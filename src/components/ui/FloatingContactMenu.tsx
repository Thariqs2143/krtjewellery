import { useState, useRef, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Mail, Share2, X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingContactMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const contactInfo = {
    phone: '+91 98430 10986',
    phoneRaw: '919843010986',
    whatsapp: '919843010986',
    email: 'info@krtjewels.com',
    address: 'Your Store Address Here',
    website: 'https://krtjewels.com',
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const actions = [
    {
      id: 'call',
      icon: Phone,
      label: 'Call',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        window.location.href = `tel:${contactInfo.phoneRaw}`;
        setIsOpen(false);
      },
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20BD5A]',
      onClick: () => {
        const message = encodeURIComponent('Hello KRT Jewels! I would like to inquire about your jewellery collection.');
        window.open(`https://wa.me/${contactInfo.whatsapp}?text=${message}`, '_blank');
        setIsOpen(false);
      },
    },
    {
      id: 'directions',
      icon: MapPin,
      label: 'Directions',
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => {
        window.open(`https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.address)}`, '_blank');
        setIsOpen(false);
      },
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => {
        window.location.href = `mailto:${contactInfo.email}`;
        setIsOpen(false);
      },
    },
    {
      id: 'qr',
      icon: QrCode,
      label: 'QR Code',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        setShowQRModal(true);
      },
    },
  ];

  return (
    <>
      {/* Floating Menu */}
      <div ref={menuRef} className="fixed bottom-[65px] md:bottom-6 right-6 z-50">
        {/* Menu Items */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-2 animate-in fade-in zoom-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-xs font-medium text-foreground whitespace-nowrap bg-white px-3 py-1 rounded-lg shadow-lg">
                    {action.label}
                  </span>
                  <Button
                    onClick={action.onClick}
                    className={`w-12 h-12 rounded-full shadow-lg text-white p-0 transition-all hover:scale-110 flex items-center justify-center ${action.color}`}
                    aria-label={action.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-luxury text-white p-0 transition-all hover:scale-110 flex items-center justify-center ${
            isOpen
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-primary hover:bg-gold-dark'
          }`}
          aria-label="Open contact menu"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Share2 className="w-7 h-7" />
          )}
        </Button>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full animate-in zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Share Website</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code */}
            <div className="bg-secondary rounded-lg p-6 flex items-center justify-center mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  contactInfo.website
                )}`}
                alt="Website QR Code"
                className="w-full h-auto"
              />
            </div>

            {/* Website URL */}
            <div className="mb-6 p-3 bg-secondary rounded-lg">
              <p className="text-sm text-center text-foreground break-all font-medium">
                {contactInfo.website}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(contactInfo.website);
                  alert('Website URL copied to clipboard!');
                }}
                className="flex-1 text-sm"
                variant="outline"
              >
                Copy Link
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'KRT Jewels',
                      text: 'Check out KRT Jewels - Trusted Since 30+ Years',
                      url: contactInfo.website,
                    });
                  } else {
                    alert('Sharing not supported on this device');
                  }
                }}
                className="flex-1 text-sm bg-primary hover:bg-gold-dark"
              >
                Share
              </Button>
            </div>

            <Button
              onClick={() => setShowQRModal(false)}
              variant="ghost"
              className="w-full mt-4 text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingContactMenu;
