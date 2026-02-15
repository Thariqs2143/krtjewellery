const HARD_RESET_KEY = 'krt_pwa_hard_reset_done';
const BUILD_STORAGE_KEY = 'krt_app_build_id';

function getErrorMessage(reason: unknown): string {
  if (typeof reason === 'string') return reason;
  if (reason instanceof Error) return reason.message;
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const msg = (reason as Record<string, unknown>).message;
    if (typeof msg === 'string') return msg;
  }
  return '';
}

function isLikelyStaleChunkError(reason: unknown): boolean {
  const msg = getErrorMessage(reason);
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(msg);
}

export async function hardResetPWA(reason: string) {
  // Prevent infinite reload loops
  if (sessionStorage.getItem(HARD_RESET_KEY)) return;
  sessionStorage.setItem(HARD_RESET_KEY, '1');

  try {
    console.warn('[PWA] Hard reset triggered:', reason);

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.warn('[PWA] Hard reset cleanup failed (continuing):', e);
  } finally {
    // Cache-busting reload
    const url = new URL(window.location.href);
    url.searchParams.set('__reload', Date.now().toString());
    window.location.replace(url.toString());
  }
}

/**
 * If the app gets stuck on an old cached bundle (common for installed PWA),
 * this ensures we blow away caches once when a new build is detected.
 */
export async function ensureBuildFreshness() {
  try {
    const prev = localStorage.getItem(BUILD_STORAGE_KEY);
    if (prev && prev !== __APP_BUILD_ID__) {
      await hardResetPWA('New build detected');
      return;
    }
    localStorage.setItem(BUILD_STORAGE_KEY, __APP_BUILD_ID__);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Adds global listeners that recover from stale/chunk errors without the user needing Incognito.
 */
export function installPwaSelfHealingHandlers() {
  // Vite preload/dynamic chunk errors (common after deployments)
  window.addEventListener('vite:preloadError', () => {
    void hardResetPWA('vite:preloadError');
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isLikelyStaleChunkError(event.reason)) {
      void hardResetPWA('unhandledrejection: stale chunk');
    }
  });

  window.addEventListener('error', (event) => {
    if (isLikelyStaleChunkError((event as ErrorEvent).error || (event as any).message)) {
      void hardResetPWA('error: stale chunk');
    }
  });
}
