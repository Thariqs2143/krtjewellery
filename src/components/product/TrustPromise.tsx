import { Shield, RefreshCw, Award, Truck, Star, Gem } from 'lucide-react';

export function TrustPromise() {
  const promises = [
    { icon: Shield, title: 'BIS Hallmark', description: 'Certified purity' },
    { icon: RefreshCw, title: 'Exchange & Buyback', description: 'Lifetime exchange' },
    { icon: Truck, title: 'Free Shipping & Returns', description: '15-day returns' },
    { icon: Award, title: 'KRT Certified', description: 'Authenticity guaranteed' },
    { icon: Star, title: 'Rated 4.8/5', description: 'By 1000+ customers' },
    { icon: Gem, title: 'Expert Craftsmanship', description: 'Handcrafted pieces' },
  ];

  return (
    <section className="py-12 bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4">
        <h3 className="font-serif text-xl md:text-2xl font-semibold text-center mb-8">
          The KRT Difference
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {promises.map((p, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-xs mb-0.5">{p.title}</h4>
              <p className="text-[10px] text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
