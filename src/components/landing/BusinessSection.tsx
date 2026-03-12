import businessAnalytics from "@/assets/business-analytics.png";

const BusinessSection = () => {
  const benefits = [
    { number: "1", title: "Make data-driven decisions 3x faster" },
    { number: "2", title: "Reduce analytics costs by up to 80%" },
    { number: "3", title: "Identify new revenue opportunities automatically" },
    { number: "4", title: "Predict customer behavior and trends" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            How It Will Help Your Business
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              src={businessAnalytics}
              alt="Business Analytics Illustration"
              className="w-full rounded-2xl shadow-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-start text-left space-y-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(180deg, #171717 16%, #730073 100%)",
                  }}
                >
                  {benefit.number}
                </div>
                <p className="text-base text-black leading-relaxed max-w-xs">
                  {benefit.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
