import { TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useBusinessInsights, useInsightsRecommendations } from "@/hooks/useAnalyticsData";

const COLORS = [
  "hsl(280, 60%, 35%)", "hsl(280, 55%, 45%)", "hsl(280, 50%, 55%)",
  "hsl(280, 45%, 65%)", "hsl(280, 40%, 75%)", "hsl(280, 35%, 85%)",
];

const BusinessInsights = () => {
  const { data: insightsData } = useBusinessInsights();
  const { data: recData } = useInsightsRecommendations();
  const businessInsights = insightsData?.insights ?? [];
  const profitMargins = insightsData?.profitMargins ?? [];
  const businessExpansionSuggestions = recData?.suggestions ?? [];
  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />

      <h1 className="text-2xl font-bold text-foreground mb-6">Business Insights</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {businessInsights.map((insight, i) => (
          <div key={i} className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{insight.title}</p>
                <p className="text-2xl font-bold text-card-foreground">{insight.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              </div>
              {insight.trend === "up" ? (
                <TrendingUp size={20} className="text-success" />
              ) : (
                <TrendingDown size={20} className="text-danger" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Margins Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Profit Margins by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitMargins} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 12 }} width={100} />
                <Bar dataKey="margin" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {profitMargins.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expansion Suggestions */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Business Expansion Suggestions</h3>
          <div className="space-y-4">
            {businessExpansionSuggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="text-sm text-card-foreground">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessInsights;
