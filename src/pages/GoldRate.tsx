import { Layout } from '@/components/layout/Layout';
import { useGoldRate, useGoldRateHistory } from '@/hooks/useGoldRate';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Zap, Lock, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';

export default function GoldRatePage() {

  const { data: currentRate, isLoading } = useGoldRate();
  const { data: history } = useGoldRateHistory(30);
  const { data: gstSettings } = useGstSettings();

  const gstRate = gstSettings?.rate ?? 3;

  const [schemeInput, setSchemeInput] = useState('');
  const [searchedScheme, setSearchedScheme] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const chartData = history?.map((rate) => ({
    date: new Date(rate.effective_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    '22K': rate.rate_22k,
    '24K': rate.rate_24k,
    Silver: rate.silver_rate ?? null,
  }));

  return (
    <Layout>

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-rich-black via-charcoal to-rich-black overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center">

            <span className="text-gold-light text-sm uppercase tracking-[0.3em]">
              Live Update
            </span>

            <h1 className="font-serif text-4xl md:text-5xl text-ivory font-medium mt-2 mb-4">
              Today's Gold Rate
            </h1>

            <p className="text-ivory/60 max-w-2xl mx-auto">
              Check the latest gold prices updated daily.
            </p>

          </div>
        </div>
      </section>


      <section className="py-12">
        <div className="container mx-auto px-4">

          {/* Current Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

            {/* 22K */}
            <Card className="card-luxury border-primary/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  22K Gold (Per Gram)
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-serif text-4xl text-gold-gradient font-medium">
                  {isLoading ? '...' : formatPrice(currentRate?.rate_22k || 0)}
                </p>

                <p className="text-ivory/50 text-sm mt-1">
                  Most popular for jewellery
                </p>
              </CardContent>
            </Card>


            {/* 24K */}
            <Card className="card-luxury border-primary/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <div className="w-3 h-3 rounded-full bg-gold-shimmer" />
                  24K Gold (Per Gram)
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-serif text-4xl text-gold-gradient font-medium">
                  {isLoading ? '...' : formatPrice(currentRate?.rate_24k || 0)}
                </p>

                <p className="text-ivory/50 text-sm mt-1">
                  Pure gold, coins & bars
                </p>
              </CardContent>
            </Card>


            {/* Silver */}
            <Card className="card-luxury border-accent/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  Silver (Per Gram)
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-serif text-4xl text-ivory font-medium">
                  {isLoading ? '...' : currentRate?.silver_rate != null ? formatPrice(currentRate.silver_rate) : '—'}
                </p>

                <p className="text-ivory/50 text-sm mt-1">
                  Sterling & daily trade
                </p>
              </CardContent>
            </Card>


            {/* Last Updated */}
            <Card className="card-luxury border-accent/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <Calendar className="w-4 h-4" />
                  Last Updated
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="font-serif text-xl font-medium text-ivory">
                  {currentRate
                    ? new Date(currentRate.effective_date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '...'}
                </p>

                <p className="text-ivory/50 text-sm mt-1">
                  Source: {currentRate?.source || 'Market rate'}
                </p>
              </CardContent>
            </Card>

          </div>


          {/* Chart */}
          <Card className="mb-12">

            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif font-medium">
                <TrendingUp className="w-5 h-5 text-primary" />
                30-Day Gold Rate Trend
              </CardTitle>
            </CardHeader>

            <CardContent>

              {chartData && chartData.length > 0 ? (
                <div className="h-80">

                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>

                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />

                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />

                      <Tooltip
                        formatter={(value: number) => formatPrice(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="22K"
                        stroke="hsl(43, 74%, 49%)"
                        strokeWidth={2}
                        dot={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="24K"
                        stroke="hsl(48, 90%, 55%)"
                        strokeWidth={2}
                        dot={false}
                      />

                    </LineChart>
                  </ResponsiveContainer>

                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>Rate history will appear here as data accumulates</p>
                </div>
              )}

            </CardContent>

          </Card>


          {/* Digital Gold Scheme */}
          <section className="py-12 bg-gradient-to-br from-gold/5 via-transparent to-primary/5 rounded-2xl border border-primary/20 mb-12">

            <div className="px-6 md:px-10">

              <div className="text-center mb-10">

                <span className="text-primary text-sm uppercase tracking-[0.2em] font-medium">
                  New Investment Option
                </span>

                <h2 className="font-serif text-3xl md:text-4xl text-foreground font-medium mt-2 mb-3">
                  Digital Gold Scheme
                </h2>

                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Buy and own real gold without storage or insurance concerns
                </p>

              </div>


              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>

                    <h3 className="font-serif text-lg font-medium text-foreground">
                      Instant Purchase
                    </h3>

                  </div>

                  <p className="text-muted-foreground text-sm">
                    Buy gold in grams starting from ₹1.
                  </p>

                </div>


                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>

                    <h3 className="font-serif text-lg font-medium text-foreground">
                      100% Secure
                    </h3>

                  </div>

                  <p className="text-muted-foreground text-sm">
                    Stored in insured certified vaults.
                  </p>

                </div>


                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">

                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>

                    <h3 className="font-serif text-lg font-medium text-foreground">
                      Easy Liquidation
                    </h3>

                  </div>

                  <p className="text-muted-foreground text-sm">
                    Sell anytime at live market rates.
                  </p>

                </div>

              </div>


              {/* CTA */}
              <div className="text-center">

                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Start building your gold investment portfolio today.
                </p>

                <Link href="/contact">
                  <Button className="btn-premium rounded-full px-10 py-6 text-base">
                    Buy Digital Gold Now
                  </Button>
                </Link>

              </div>

            </div>

          </section>

        </div>
      </section>

    </Layout>
  );
}
