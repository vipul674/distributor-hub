import { TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesOverviewChart from "@/components/dashboard/SalesOverviewChart";
import StockAlerts from "@/components/dashboard/StockAlerts";
import DemandPrediction from "@/components/dashboard/DemandPrediction";
import TopRecommendations from "@/components/dashboard/TopRecommendations";
import BusinessExpansion from "@/components/dashboard/BusinessExpansion";
import { dashboardStats } from "@/assets/fakeData";

const Index = () => {
  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Monthly Sales" value={dashboardStats.monthlySales} />
        <StatsCard title="Stock Availability" value={dashboardStats.stockAvailability} subtitle="Products" />
        <StatsCard title="Damaged Stock" value={dashboardStats.damagedStock} subtitle="items" />
        <StatsCard 
          title="Demand Forecast" 
          value="High Demand Alerts" 
          highlight 
          icon={<TrendingUp size={40} className="text-primary" />}
        />
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
