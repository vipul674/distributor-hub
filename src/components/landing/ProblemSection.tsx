import problem_bg from "@/assets/problem-bg.png";
import expensive_tools from "@/assets/expensive-tools.png";
import technical_barries from "@/assets/technical-barrier.png";
import missed_opp from "@/assets/missed-opp.png";

const ProblemSection = () => {
  const problems = [
    {
      icon: expensive_tools,
      title: "Expensive Tools",
      description:
        "Traditional analytics tools cost thousands annually, making them inaccessible for smaller businesses.",
    },
    {
      icon: technical_barries,
      title: "Technical Barriers",
      description:
        "Most advanced analytics platforms and technical expertise to implement effectively.",
    },
    {
      icon: missed_opp,
      title: "Missed Opportunities",
      description:
        "Without proper data analysis, businesses miss crucial insights leading to poor decisions and lost revenue opportunities.",
    },
  ];

  return (
    <section
      id="about"
      className="py-20 bg-white"
      style={{
        backgroundImage: `url(${problem_bg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundSize: "contain",
        paddingTop: "105px",
      }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#171717" }}>
            The Problem We Solve
          </h2>
          <p
            className="text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#171717" }}
          >
            Small and medium businesses struggle with expensive analytics tools,
            technical complexity, and missed opportunities from unused data.
          </p>
        </div>

        <div className="flex justify-center">
          <div
            className="grid md:grid-cols-3 place-items-center"
            style={{ gap: "130px" }}
          >
            {problems.map((problem, index) => (
              <div
                key={index}
                className="w-full max-w-[304px] h-[274px] p-6 md:p-8 rounded-2xl border border-border/50 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                style={{
                  background:
                    "linear-gradient(180deg, #171717 16%, #730073 100%)",
                  borderRadius: "10px",
                }}
              >
                <div className="relative z-10 text-center space-y-4 flex flex-col h-full justify-center">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <img
                      src={problem.icon}
                      alt=""
                      style={{ width: "75px", height: "65px" }}
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white">
                    {problem.title}
                  </h3>
                  <p
                    className="md:text-base text-gray-100 leading-relaxed"
                    style={{ fontSize: "13px" }}
                  >
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
