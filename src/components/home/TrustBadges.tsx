import { Shield, Award, Truck, Gem } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'BIS Hallmarked',
    description: 'Every piece certified for purity by the Bureau of Indian Standards.',
  },
  {
    icon: Gem,
    title: 'Certified Diamonds',
    description: 'GIA and IGI certified diamonds with complete documentation.',
  },
  {
    icon: Award,
    title: '60+ Years Legacy',
    description: 'Trusted by generations of families for their precious moments.',
  },
  {
    icon: Truck,
    title: 'Insured Delivery',
    description: 'Free insured shipping across India with secure packaging.',
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-rich-black to-charcoal relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative w-18 h-18 mx-auto mb-5">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-primary/30 group-hover:border-primary/60 transition-colors" />
                {/* Inner glow */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all" />
                {/* Icon container */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary via-gold-shimmer to-primary flex items-center justify-center shadow-gold group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-rich-black" />
                </div>
              </div>
              <h3 className="font-serif text-lg text-ivory font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-ivory/50 text-sm leading-relaxed max-w-[200px] mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
