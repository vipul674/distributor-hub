import LandingNavigation from "@/components/landing/LandingNavigation";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import StatsSection from "@/components/landing/StatsSection";
import SolutionSection from "@/components/landing/SolutionSection";
import BusinessSection from "@/components/landing/BusinessSection";
import ResultsSection from "@/components/landing/ResultsSection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavigation />

      <main>
        <HeroSection />
        <ProblemSection />
        <StatsSection />
        <SolutionSection />
        <BusinessSection />
        <ResultsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
