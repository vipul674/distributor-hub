import { monthlySalesData, yearlySalesData } from "@/assets/fakeData";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const SalesOverviewChart = () => {
  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  const data = view === "monthly" ? monthlySalesData : yearlySalesData;

  const getBarColor = (index: number) => {
    const colors = [
      "hsl(280, 60%, 35%)", "hsl(280, 55%, 45%)", "hsl(280, 50%, 55%)",
      "hsl(280, 45%, 65%)", "hsl(280, 40%, 75%)",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Sales Overview</h3>
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setView("monthly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "monthly" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"
            }`}
          >Monthly</button>
          <button
            onClick={() => setView("yearly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === "yearly" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"
            }`}
          >Yearly</button>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k₹`} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={getBarColor(index)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverviewChart;
