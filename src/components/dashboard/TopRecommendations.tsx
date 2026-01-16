import { Pill, Cookie } from "lucide-react";

interface Recommendation {
  id: number;
  name: string;
  icon: "medical" | "snack";
}

const recommendations: Recommendation[] = [
  { id: 1, name: "Medical Suppliments", icon: "medical" },
  { id: 2, name: "Snacks", icon: "snack" },
  { id: 3, name: "Medical Suppliments", icon: "medical" },
  { id: 4, name: "Medical Suppliments", icon: "medical" },
  { id: 5, name: "Medical Suppliments", icon: "medical" },
  { id: 6, name: "Medical Suppliments", icon: "medical" },
  { id: 7, name: "Medical Suppliments", icon: "medical" },
];

const TopRecommendations = () => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Top Recomendations</h3>
      
      <div className="space-y-1">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center gap-3 py-3 border-b border-border last:border-0"
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              rec.icon === "medical" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
            }`}>
              {rec.icon === "medical" ? <Pill size={14} /> : <Cookie size={14} />}
            </div>
            <span className="text-sm text-card-foreground">{rec.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRecommendations;
