const ResultsSection = () => {
  const results = [
    { percentage: "23%", label: "Average Revenue Increase" },
    { percentage: "3x", label: "Faster Decision Making" },
    { percentage: "60%", label: "Cost Reduction" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-black">
            Real Results
          </h2>
        </div>

        <div
          className="rounded-2xl p-12 border border-border/50"
          style={{ background: "var(--card-gradient)" }}
        >
          <div className="grid md:grid-cols-3 gap-12">
            {results.map((result, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-white mb-4">
                  {result.percentage}
                </div>
                <div className="text-white/80 text-lg">
                  {result.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;