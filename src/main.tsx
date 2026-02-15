import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure installed PWA doesn't get stuck on a stale cached version.
// If a new service worker is available, we force a one-time reload.
import { registerSW } from 'virtual:pwa-register';

import { ensureBuildFreshness, installPwaSelfHealingHandlers, hardResetPWA } from '@/lib/pwaRecovery';

async function bootstrap() {
  // In development, ensure any previously-installed service workers
  // from production builds are removed so they don't intercept requests.
  if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      // eslint-disable-next-line no-console
      console.debug('[DEV] Unregistered existing service workers and cleared caches');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DEV] Failed to unregister service workers:', e);
    }
  }
  // PWA / service worker logic is only enabled in production builds.
  // During development this can cause reload loops when Vite injects
  // __reload query params; disabling here helps reproduce and debug
  // runtime errors locally without automatic hard resets.
  if (import.meta.env.PROD) {
    // If the user is stuck on an old cached build, reset caches once.
    await ensureBuildFreshness();

    // Self-heal from stale chunk/preload issues (no Incognito needed).
    installPwaSelfHealingHandlers();

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Avoid rapid reload loops, but allow future updates.
        const key = 'krt_pwa_refresh_at';
        const last = Number(sessionStorage.getItem(key) || '0');
        if (Date.now() - last < 10_000) return;
        sessionStorage.setItem(key, String(Date.now()));

        updateSW(true);
        // Failsafe: some browsers don't reload reliably after skipWaiting
        setTimeout(() => window.location.reload(), 750);
      },
      onRegisteredSW(_swUrl, registration) {
        // Proactively check updates on load
        registration?.update();

        // If a new SW takes control, reload once to ensure fresh assets
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            const key = 'krt_pwa_controllerchange';
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');
            window.location.reload();
          });
        }
      },
      onRegisterError(error) {
        console.warn('[PWA] SW registration error:', error);
        // If SW registration fails, ensure we don't keep a broken cached state
        void hardResetPWA('service worker registration failed');
      },
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
