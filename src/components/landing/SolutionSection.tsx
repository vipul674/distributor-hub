import { Upload, BarChart3, Monitor, Shield } from "lucide-react";

const SolutionSection = () => {
  const solutions = [
    {
      icon: Upload,
      title: "Simple Data Upload",
      description:
        "Upload your data files and connect databases with one-click integration.",
    },
    {
      icon: BarChart3,
      title: "Instant AI Analysis",
      description:
        "Our AI automatically analyzes patterns and generates insights in minutes.",
    },
    {
      icon: Monitor,
      title: "Interactive Dashboards",
      description:
        "Beautiful, interactive dashboards that update in real-time with your data.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-grade security ensures your sensitive business data stays protected.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 bg-background"
      style={{ padding: "130px 0" }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Our AI-Powered Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A complete AutoML platform that transforms your business data into
            actionable insights with zero technical knowledge required.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="text-center group">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-border/50">
                <solution.icon className="w-12 h-12 text-foreground" />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-4">
                {solution.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
