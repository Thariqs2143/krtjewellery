import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, ExternalLink } from 'lucide-react';

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
  const mapLink =
    'https://www.google.com/maps/place/1154,+Big+Bazaar+St,+Prakasam,+Town+Hall,+Coimbatore,+Tamil+Nadu+641001';

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
        <div className="container mx-auto px-4 py-12">
          <h3 className="text-gold-light font-serif text-xl mb-6">Find Our Showroom</h3>
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open KRT Jewellers location in Google Maps"
            className="relative block w-full overflow-hidden rounded-2xl border border-gold-light/30 shadow-2xl group transition-all duration-500 hover:border-gold-light/80"
          >
            <div className="w-full h-[260px] md:h-[320px] bg-[#14100e] relative flex items-center justify-center">
              <svg
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                viewBox="0 0 1000 400"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <g stroke="#cca352" strokeWidth="1.5" fill="none" opacity="0.4">
                  <path d="M-100,250 C200,240 500,280 1100,200" />
                  <path d="M-100,150 C300,160 600,120 1100,180" />
                  <path d="M300,-50 C320,100 280,300 350,450" />
                  <path d="M700,-50 C680,150 720,250 650,450" />
                  <path d="M480,-50 L520,450" strokeWidth="2.5" opacity="0.6" />
                </g>
                <g fill="#cca352" opacity="0.7" fontFamily="serif" fontSize="14" letterSpacing="2">
                  <text x="540" y="320" transform="rotate(-5, 540, 320)">
                    BIG BAZAAR ST
                  </text>
                  <text x="200" y="140" transform="rotate(3, 200, 140)">
                    RAJA ST
                  </text>
                  <text x="730" y="170" transform="rotate(10, 730, 170)">
                    TOWN HALL
                  </text>
                </g>
                <circle cx="900" cy="80" r="30" stroke="#cca352" strokeWidth="1" fill="none" opacity="0.3" />
                <path d="M900,40 L900,120 M860,80 L940,80" stroke="#cca352" strokeWidth="1" opacity="0.3" />
              </svg>

              <div className="absolute z-10 flex flex-col items-center transform -translate-y-4 group-hover:-translate-y-6 transition-transform duration-500">
                <div className="w-12 h-12 bg-[#cca352] rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(204,163,82,0.4)] border-2 border-[#1a1512]">
                  <span className="text-[#1a1512] font-serif font-bold text-lg -rotate-45 block tracking-tighter">
                    KRT
                  </span>
                </div>
                <div className="w-1 h-8 bg-gradient-to-b from-[#cca352] to-transparent mt-1"></div>
              </div>
            </div>

            <div className="absolute inset-0 bg-[#1a1512]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
              <div className="flex flex-col items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="w-14 h-14 rounded-full border border-[#cca352] flex items-center justify-center mb-4 bg-[#cca352]/10 text-[#cca352]">
                  <MapPin size={24} />
                </div>
                <span className="text-[#cca352] font-serif tracking-widest text-lg uppercase">Get Directions</span>
                <div className="flex items-center gap-2 mt-2 text-white/50 text-sm font-light">
                  <span>Opens in Google Maps</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            </div>
          </a>

          <div className="mt-6 text-center md:text-left text-ivory/70 font-light leading-relaxed">
            <p>1154, Big Bazaar St, Prakasam,</p>
            <p>Town Hall, Coimbatore,</p>
            <p>Tamil Nadu 641001</p>
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
