import { Sparkles, Award, Shield, Gem, Star, Heart } from 'lucide-react';

const marqueeItems = [
  { icon: Sparkles, text: '916 BIS Hallmarked Gold' },
  { icon: Award, text: '30+ Years of Trust' },
  { icon: Shield, text: '100% Certified Jewellery' },
  { icon: Gem, text: 'Premium Craftsmanship' },
  { icon: Star, text: 'Exclusive Designs' },
  { icon: Heart, text: 'Handcrafted with Love' },
];

export function MarqueeSection() {
  return (
    <section className="bg-rich-black py-4 overflow-hidden">
      <div className="relative flex">
        {/* First marquee track */}
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 mx-8 text-ivory/90"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium tracking-wide uppercase">
                {item.text}
              </span>
              <span className="text-primary">✦</span>
            </div>
          ))}
        </div>
        
        {/* Duplicate for seamless loop */}
        <div className="flex animate-marquee whitespace-nowrap" aria-hidden="true">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 mx-8 text-ivory/90"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium tracking-wide uppercase">
                {item.text}
              </span>
              <span className="text-primary">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
