import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesOverviewChart from "@/components/dashboard/SalesOverviewChart";
import StockAlerts from "@/components/dashboard/StockAlerts";
import DemandPrediction from "@/components/dashboard/DemandPrediction";
import TopRecommendations from "@/components/dashboard/TopRecommendations";
import BusinessExpansion from "@/components/dashboard/BusinessExpansion";
import { useDashboardStats } from "@/hooks/useAnalyticsData";

const Index = () => {
  const { data: stats } = useDashboardStats();
  return (
    <DashboardLayout>
      <DashboardHeader userName="Distributor" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Monthly Sales" value={stats?.monthlySales ?? "—"} subtitle={stats?.reportingPeriodLabel ?? "Latest complete month"} />
        <StatsCard title="Transactions" value={stats?.transactions ?? "—"} subtitle={stats?.reportingPeriodLabel ?? "Latest complete month"} />
        <StatsCard title="Units Sold" value={stats?.unitsSold ?? "—"} subtitle={stats?.reportingPeriodLabel ?? "Latest complete month"} />
        <StatsCard title="Active Categories" value={stats?.activeCategories ?? "—"} subtitle={stats?.reportingPeriodLabel ?? "Latest complete month"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SalesOverviewChart />
          <TopRecommendations />
        </div>
        <div className="space-y-6">
          <StockAlerts />
          <DemandPrediction />
          <BusinessExpansion />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
