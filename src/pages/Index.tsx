import { Layout } from '@/components/layout/Layout';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { TrustBadges } from '@/components/home/TrustBadges';
import { GoldRateWidget } from '@/components/home/GoldRateWidget';
import { BridalBanner } from '@/components/home/BridalBanner';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { CollectionBanner } from '@/components/home/CollectionBanner';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { MarqueeSection } from '@/components/home/MarqueeSection';
import { RotatingCardsSection } from '@/components/home/RotatingCardsSection';
import { GoogleReviewBadge } from '@/components/home/GoogleReviewBadge';

const Index = () => {
  
  return (
    <Layout>
      <CategoryCarousel />
      <HeroCarousel />
      <MarqueeSection />
      <GoldRateWidget />
      <FeaturedProducts />
      <CollectionBanner />
      <RotatingCardsSection />
      <CategoryShowcase />
      <WhyChooseUs />
      <CustomerReviews />
      <BridalBanner />
      <TrustBadges />
      <InstagramFeed />
      <GoogleReviewBadge />
    </Layout>
  );
};

export default Index;
