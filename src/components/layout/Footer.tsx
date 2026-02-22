import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const collections = [
  { name: 'Necklaces', href: '/collections/necklaces' },
  { name: 'Earrings', href: '/collections/earrings' },
  { name: 'Rings', href: '/collections/rings' },
  { name: 'Bangles', href: '/collections/bangles' },
  { name: 'Wedding Sets', href: '/collections/wedding-sets' },
  { name: 'Diamond', href: '/collections/diamond-jewellery' },
];

const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Store Locator', href: '/stores' },
  { name: 'Gold Rate', href: '/gold-rate' },
  { name: 'Contact', href: '/contact' },
  { name: 'Track Order', href: '/track-order' },
];

const policies = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'Shipping Policy', href: '/shipping' },
  { name: 'Return Policy', href: '/returns' },
  { name: 'FAQ', href: '/faq' },
];

export function Footer() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  useEffect(() => {
    if (shouldLoadMap) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true);
        }
      },
      { rootMargin: '200px' }
    );

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoadMap]);

  return (
    <footer className="bg-rich-black text-ivory">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <h2 className="font-serif text-2xl font-bold">
                <span className="text-primary">KRT</span> JEWELLERS
              </h2>
              <p className="text-xs text-ivory/50 tracking-widest uppercase mt-1">Trusted Since 30+ Years</p>
            </Link>
            <p className="text-ivory/60 mb-6 max-w-sm">
              Crafting timeless elegance for over three decades. Every piece tells a story of tradition,
              craftsmanship, and uncompromising quality in 916 BIS Hallmarked gold jewellery.
            </p>
            <div className="space-y-3 text-ivory/60">
              <a href="tel:+919843010986" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                <span>+91 98430 10986</span>
              </a>
              <a href="mailto:info@krtjewels.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@krtjewels.com</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>1154, Big Bazaar St, Prakasam,<br />Town Hall, Coimbatore,<br />Tamil Nadu 641001</span>
              </div>
            </div>

          </div>

          {/* Collections */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-gold-light">Collections</h4>
            <ul className="space-y-3">
              {collections.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-ivory/60 hover:text-primary transition-colors link-elegant"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-gold-light">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-ivory/60 hover:text-primary transition-colors link-elegant"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-gold-light">Policies</h4>
            <ul className="space-y-3">
              {policies.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-ivory/60 hover:text-primary transition-colors link-elegant"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Full-width Map */}
      <div className="relative overflow-hidden border-t border-charcoal/50">
        <div className="container mx-auto px-4 py-10">
          <div className="rounded-3xl border-2 border-primary/75 p-2 md:p-3 shadow-gold/50 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
            <div ref={mapContainerRef} className="group relative overflow-hidden rounded-2xl">
          {shouldLoadMap ? (
            <iframe
              title="KRT Jewellers Location"
              src="https://www.google.com/maps?q=1154%2C%20Big%20Bazaar%20St%2C%20Prakasam%2C%20Town%20Hall%2C%20Coimbatore%2C%20Tamil%20Nadu%20641001&output=embed"
              className="h-64 md:h-80 w-full saturate-[1.15] contrast-[1.1] brightness-[0.95] hue-rotate-[-8deg] transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="h-64 md:h-80 w-full bg-rich-black/60" />
          )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-black/40 via-transparent to-primary/25 mix-blend-multiply opacity-80" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-rich-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span
                  className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-outline select-none"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  KRT JEWELLERS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-ivory/40 text-sm">
              © {new Date().getFullYear()} KRT JEWELLERS. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="https://facebook.com/krtjewels" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/krtjewellers/" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/krtjewels" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/krtjewels" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Policy Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="text-ivory/40 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-ivory/40 hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
