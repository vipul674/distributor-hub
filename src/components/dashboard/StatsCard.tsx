import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
  icon?: ReactNode;
}

const StatsCard = ({ title, value, subtitle, highlight, icon }: StatsCardProps) => {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={`text-2xl font-bold ${highlight ? "text-danger" : "text-card-foreground"}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
