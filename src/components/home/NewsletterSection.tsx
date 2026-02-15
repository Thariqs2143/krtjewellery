import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Gift, Bell, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate subscription
    setIsSubmitted(true);
    toast({
      title: 'Welcome to KRT Jewels!',
      description: 'You\'ve been subscribed to our newsletter.',
    });
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Luxury Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rich-black via-charcoal to-rich-black" />
      <div className="absolute inset-0 bg-pattern-dots opacity-10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-shimmer/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-8">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-ivory mb-6">
            Stay Connected with <span className="text-gold-gradient">Elegance</span>
          </h2>
          
          <p className="text-lg md:text-xl text-ivory/70 mb-10 max-w-2xl mx-auto">
            Subscribe to receive exclusive offers, early access to new collections, and daily gold rate updates.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-ivory/80">
              <Gift className="w-5 h-5 text-primary" />
              <span>Exclusive Discounts</span>
            </div>
            <div className="flex items-center gap-2 text-ivory/80">
              <Bell className="w-5 h-5 text-primary" />
              <span>New Arrival Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-ivory/80">
              <Mail className="w-5 h-5 text-primary" />
              <span>Daily Gold Rates</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 px-6 text-lg bg-white/10 border-white/20 text-ivory placeholder:text-ivory/50 rounded-xl focus:border-primary focus:ring-primary"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitted}
              className={`h-14 px-8 text-lg font-semibold rounded-xl transition-all duration-300 ${
                isSubmitted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'btn-premium'
              }`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Subscribed!
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </form>

          <p className="text-sm text-ivory/50 mt-6">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
