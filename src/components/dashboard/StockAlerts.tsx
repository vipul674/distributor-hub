import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { useStockAlerts } from "@/hooks/useAnalyticsData";

const StockAlerts = () => {
  const { data: alerts = [] } = useStockAlerts();
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Stock Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded transition-colors">
            <div className="flex items-center gap-3">
              {alert.type === "low-stock" ? <AlertTriangle size={16} className="text-danger" /> : <Clock size={16} className="text-warning" />}
              <span className="text-sm text-card-foreground">{alert.message}</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockAlerts;
