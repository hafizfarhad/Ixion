
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import PricingSection from "../components/PricingSection";
import StatsSection from "../components/StatsSection";
import ContactSection from "../components/ContactSection";
import FooterSection from "../components/FooterSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <FeatureSection />
      <PricingSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
