import { Layout } from '@/components/layout/Layout';
import { useGoldRate, useGoldRateHistory } from '@/hooks/useGoldRate';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Info, Zap, Lock, BarChart3, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function GoldRatePage() {
  const { data: currentRate, isLoading } = useGoldRate();
  const { data: history } = useGoldRateHistory(30);
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const [schemeInput, setSchemeInput] = useState('');
  const [searchedScheme, setSearchedScheme] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTrackGold = async () => {
    if (!schemeInput.trim()) return;
    
    setIsSearching(true);
    // Simulate API call to fetch scheme details
    setTimeout(() => {
      setSearchedScheme({
        schemeId: schemeInput,
        totalGold: 5.25,
        investedAmount: 45000,
        currentValue: 51250,
        profitLoss: 6250,
        profitPercentage: 13.9,
        monthlyContribution: 1500,
      });
      setIsSearching(false);
    }, 1000);
  };

  const chartData = history?.map((rate) => ({
    date: new Date(rate.effective_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    '22K': rate.rate_22k,
    '24K': rate.rate_24k,
  }));

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-r from-rich-black via-charcoal to-rich-black overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center">
            <span className="text-gold-light text-sm uppercase tracking-[0.3em]">Live Update</span>
            <h1 className="font-serif text-4xl md:text-5xl text-ivory font-semibold mt-2 mb-4">
              Today's Gold Rate
            </h1>
            <p className="text-ivory/60 max-w-2xl mx-auto">
              Check the latest gold prices updated daily. Our jewellery prices are dynamically 
              calculated based on these rates.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Current Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="card-luxury border-primary/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  22K Gold (Per Gram)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-4xl text-gold-gradient font-bold">
                  {isLoading ? '...' : formatPrice(currentRate?.rate_22k || 0)}
                </p>
                <p className="text-ivory/50 text-sm mt-1">
                  Most popular for jewellery
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury border-primary/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <div className="w-3 h-3 rounded-full bg-gold-shimmer" />
                  24K Gold (Per Gram)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-4xl text-gold-gradient font-bold">
                  {isLoading ? '...' : formatPrice(currentRate?.rate_24k || 0)}
                </p>
                <p className="text-ivory/50 text-sm mt-1">
                  Pure gold, coins & bars
                </p>
              </CardContent>
            </Card>

            <Card className="card-luxury border-accent/20 bg-rich-black">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-ivory/70 text-sm font-normal">
                  <Calendar className="w-4 h-4" />
                  Last Updated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-2xl font-bold text-ivory">
                  {currentRate ? new Date(currentRate.effective_date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '...'}
                </p>
                <p className="text-ivory/50 text-sm mt-1">
                  Source: {currentRate?.source || 'Market rate'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Track Your Gold Savings */}
          <section className="py-12 bg-gradient-to-r from-primary/5 via-gold-shimmer/10 to-primary/5 rounded-2xl border border-primary/20 mb-12">
            <div className="px-6 md:px-10">
              <div className="text-center mb-8">
                <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">Digital Gold Scheme</span>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground font-bold mt-2 mb-3">
                  Track Your Gold Savings
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Enter your scheme ID or registered phone number to view your savings details.
                </p>
              </div>

              {/* Search Form */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="Enter Scheme ID or Phone Number"
                    value={schemeInput}
                    onChange={(e) => setSchemeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackGold()}
                    className="flex-1 h-12 px-4"
                  />
                  <Button
                    onClick={handleTrackGold}
                    disabled={isSearching || !schemeInput.trim()}
                    className="bg-primary hover:bg-gold-dark h-12 px-8 flex items-center gap-2 rounded-lg"
                  >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </div>
              </div>

              {/* Results */}
              {searchedScheme && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-gold-shimmer p-6 text-white">
                      <h3 className="font-serif text-2xl font-bold mb-1">Scheme Details</h3>
                      <p className="text-sm opacity-90">Scheme ID: {searchedScheme.schemeId}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        {/* Total Gold */}
                        <div className="text-center p-4 bg-secondary/30 rounded-lg">
                          <p className="text-muted-foreground text-sm font-medium">Total Gold Owned</p>
                          <p className="font-serif text-2xl text-gold-gradient font-bold mt-1">
                            {searchedScheme.totalGold}g
                          </p>
                        </div>

                        {/* Invested Amount */}
                        <div className="text-center p-4 bg-secondary/30 rounded-lg">
                          <p className="text-muted-foreground text-sm font-medium">Total Invested</p>
                          <p className="font-serif text-2xl text-foreground font-bold mt-1">
                            {formatPrice(searchedScheme.investedAmount)}
                          </p>
                        </div>

                        {/* Current Value */}
                        <div className="text-center p-4 bg-secondary/30 rounded-lg">
                          <p className="text-muted-foreground text-sm font-medium">Current Value</p>
                          <p className="font-serif text-2xl text-primary font-bold mt-1">
                            {formatPrice(searchedScheme.currentValue)}
                          </p>
                        </div>
                      </div>

                      {/* Profit/Loss */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-muted-foreground text-sm font-medium mb-1">Profit / Loss</p>
                            <p className={`font-serif text-2xl font-bold ${searchedScheme.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {searchedScheme.profitLoss >= 0 ? '+' : '-'}{formatPrice(Math.abs(searchedScheme.profitLoss))}
                            </p>
                          </div>
                          <div className="mt-4 sm:mt-0 text-right">
                            <p className={`font-semibold text-lg ${searchedScheme.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {searchedScheme.profitPercentage >= 0 ? '+' : '-'}{Math.abs(searchedScheme.profitPercentage)}%
                            </p>
                            <p className="text-muted-foreground text-sm">Return on Investment</p>
                          </div>
                        </div>
                      </div>

                      {/* Monthly Contribution */}
                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-muted-foreground text-sm font-medium">Monthly Contribution</p>
                        <p className="font-serif text-xl text-foreground font-bold mt-1">
                          {formatPrice(searchedScheme.monthlyContribution)}/month
                        </p>
                        <div className="mt-4 flex gap-3">
                          <Button className="flex-1 bg-primary hover:bg-gold-dark">
                            View Transactions
                          </Button>
                          <Button className="flex-1" variant="outline">
                            Download Statement
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {schemeInput && !searchedScheme && !isSearching && (
                <div className="text-center text-muted-foreground max-w-2xl mx-auto">
                  <p className="mb-3">No scheme found with the provided details.</p>
                  <p className="text-sm">Please verify your Scheme ID or phone number and try again.</p>
                </div>
              )}
            </div>
          </section>

          {/* Chart */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
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

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  How We Calculate Prices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  All our jewellery prices are calculated using a transparent formula:
                </p>
                <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm">
                  <p><strong>Final Price =</strong></p>
                  <p className="ml-4">(Gold Rate × Weight)</p>
                  <p className="ml-4">+ Making Charges</p>
                  <p className="ml-4">+ Stone/Diamond Cost</p>
                  <p className="ml-4">+ {gstRate}% GST</p>
                </div>
                <p>
                  When the gold rate changes, all product prices update automatically. 
                  This ensures you always pay the fair market price.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Gold Purity Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="font-medium text-foreground">24K Gold</span>
                    <span>99.9% Pure</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="font-medium text-foreground">22K Gold</span>
                    <span>91.6% Pure</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="font-medium text-foreground">18K Gold</span>
                    <span>75% Pure</span>
                  </div>
                </div>
                <p className="text-sm">
                  22K gold is the most popular choice for jewellery as it offers 
                  the perfect balance between purity and durability.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Digital Gold Scheme Section */}
          <section className="py-12 bg-gradient-to-br from-gold/5 via-transparent to-primary/5 rounded-2xl border border-primary/20 mb-12">
            <div className="px-6 md:px-10">
              <div className="text-center mb-10">
                <span className="text-primary text-sm uppercase tracking-[0.2em] font-semibold">New Investment Option</span>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground font-bold mt-2 mb-3">
                  Digital Gold Scheme
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Buy and own real gold without the burden of storage, insurance, or purity concerns
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">Instant Purchase</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Buy gold in grams starting from ₹1, no minimum investment required
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">100% Secure</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Stored in certified vaults with insurance included. No storage worries
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">Easy Liquidation</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Sell anytime at live market rates with instant settlement
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Start building your gold investment portfolio today with flexible, secure digital gold
                </p>
                <Button className="btn-premium rounded-full px-10 py-6 text-base">
                  Buy Digital Gold Now
                </Button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
