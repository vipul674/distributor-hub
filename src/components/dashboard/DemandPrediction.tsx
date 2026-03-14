import { useInsightsRecommendations } from "@/hooks/useAnalyticsData";

const DemandPrediction = () => {
  const { data } = useInsightsRecommendations();
  const predictions = data?.predictions ?? [];
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <h3 className="text-base font-semibold text-card-foreground mb-2">Demand Prediction</h3>
      <p className="text-sm text-success mb-4">(High demand expected for next week)</p>
      <div className="space-y-3">
        {predictions.map((prediction, index) => (
          <p key={index} className="text-sm text-card-foreground py-2 border-b border-border last:border-0">{prediction}</p>
        ))}
      </div>
    </div>
  );
};

export default DemandPrediction;
