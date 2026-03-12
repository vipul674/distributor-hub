const StatsSection = () => {
  const stats = [
    { number: "10,000+", label: "Businesses" },
    { number: "95%", label: "Satisfaction" },
    { number: "3x", label: "Faster Decisions" },
    { number: "24/7", label: "AI Support" },
  ];

  return (
    <section className="py-16" style={{ backgroundColor: "#F0F0F0" }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: "#171717" }}
              >
                {stat.number}
              </div>
              <div className="text-lg" style={{ color: "#171717" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
