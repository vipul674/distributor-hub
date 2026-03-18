import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import hero_bg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${hero_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              AI for personalized insights
            </h1>

            <p className="text-xl text-white/70 leading-relaxed max-w-lg">
              Transform your business data into actionable insights with our
              AI-powered AutoML platform. No technical expertise required.
            </p>

            <Link to="/dashboard">
              <Button
                variant="hero"
                size="lg"
                className="px-8 py-5 rounded-3xl text-lg mt-5"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;