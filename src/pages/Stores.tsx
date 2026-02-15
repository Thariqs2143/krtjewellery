import { Layout } from '@/components/layout/Layout';
import { useStoresByCity } from '@/hooks/useStores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoresPage() {
  const { storesByCity, isLoading } = useStoresByCity();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-r from-rich-black via-charcoal to-rich-black">
        <div className="container mx-auto px-4 text-center">
          <span className="text-gold-light text-sm uppercase tracking-[0.3em]">Visit Us</span>
          <h1 className="font-serif text-4xl md:text-5xl text-ivory font-semibold mt-2 mb-4">
            Our Stores
          </h1>
          <p className="text-ivory/60 max-w-2xl mx-auto">
            Experience our exquisite collections in person at any of our flagship stores. 
            Our jewellery experts are ready to assist you.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {storesByCity && Object.entries(storesByCity).map(([city, stores]) => (
                <div key={city}>
                  <h2 className="font-serif text-2xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    {city}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store) => (
                      <Card key={store.id} className="card-luxury">
                        <CardHeader>
                          <CardTitle className="font-serif text-xl">{store.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-1 shrink-0 text-primary" />
                            <p className="text-sm">
                              {store.address}<br />
                              {store.city}, {store.state} - {store.pincode}
                            </p>
                          </div>
                          {store.phone && (
                            <a 
                              href={`tel:${store.phone}`}
                              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Phone className="w-4 h-4 text-primary" />
                              <span className="text-sm">{store.phone}</span>
                            </a>
                          )}
                          {store.email && (
                            <a 
                              href={`mailto:${store.email}`}
                              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Mail className="w-4 h-4 text-primary" />
                              <span className="text-sm">{store.email}</span>
                            </a>
                          )}
                          {store.timings && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm">{store.timings}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
