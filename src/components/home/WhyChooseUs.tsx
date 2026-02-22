import { Shield, Award, Gem, Truck, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'BIS Hallmarked',
    description: 'Every piece is certified with BIS hallmark, guaranteeing purity and quality.',
  },
  {
    icon: Award,
    title: '50+ Years Legacy',
    description: 'Trusted by generations of families for their most precious moments.',
  },
  {
    icon: Gem,
    title: 'Handcrafted',
    description: 'Master artisans create each piece with meticulous attention to detail.',
  },
  {
    icon: Truck,
    title: 'Free Insured Shipping',
    description: 'Complimentary delivery with full insurance coverage across India.',
  },
  {
    icon: RefreshCw,
    title: 'Lifetime Exchange',
    description: 'Exchange your jewellery anytime at full gold value with no deductions.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated team is always here to assist you with any queries.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden select-none">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 bg-pattern-lines opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-[0.3em] font-medium select-none">
            <span className="w-8 h-px bg-primary" />
            Our Promise
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium section-heading select-none cursor-default">
            Why Choose KRT Jewels
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto select-text">
            Experience the perfect blend of tradition and trust with every purchase
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-gold select-none cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3 group-hover:text-primary transition-colors select-none">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed select-text">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
