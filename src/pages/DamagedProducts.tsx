import { AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDamagedProducts } from "@/hooks/useAnalyticsData";

const DamagedProducts = () => {
  const { data: damagedProducts = [] } = useDamagedProducts();
  const totalDamaged = damagedProducts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />

      <h1 className="text-2xl font-bold text-foreground mb-6">Damaged Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 border border-danger/30 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-danger" />
            <div>
              <p className="text-sm text-muted-foreground">Total Damaged Items</p>
              <p className="text-2xl font-bold text-danger">{totalDamaged}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Categories Affected</p>
          <p className="text-2xl font-bold text-card-foreground">{new Set(damagedProducts.map(p => p.category)).size}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Most Recent Report</p>
          <p className="text-2xl font-bold text-card-foreground">{damagedProducts[0]?.date}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {damagedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-card-foreground">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.category}</TableCell>
                <TableCell className="text-danger font-medium">{product.quantity}</TableCell>
                <TableCell className="text-muted-foreground">{product.reason}</TableCell>
                <TableCell className="text-muted-foreground">{product.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default DamagedProducts;
