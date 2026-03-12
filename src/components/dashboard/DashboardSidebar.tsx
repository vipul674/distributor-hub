import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Package, 
  BarChart3, 
  AlertTriangle, 
  Lightbulb 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Bills", url: "/upload-bills", icon: Upload },
  { title: "Generate Bills", url: "/generate-bills", icon: FileText },
  { title: "Stock Management", url: "/stock-management", icon: Package },
  { title: "Sales Analysis", url: "/sales-analysis", icon: BarChart3 },
  { title: "Damaged Products", url: "/damaged-products", icon: AlertTriangle },
  { title: "Business Insights", url: "/business-insights", icon: Lightbulb },
];

const DashboardSidebar = () => {
  return (
    <aside className="w-60 min-h-screen bg-sidebar flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground">SupplyDesk</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-foreground"
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
