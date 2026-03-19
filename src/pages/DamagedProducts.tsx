import { AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDamagedProducts, useProducts } from "@/hooks/useAnalyticsData";

function formatReportedDate(value: string | null) {
  if (!value) {
    return "Current state";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const DamagedProducts = () => {
  const { data: damagedProducts = [], isLoading, isError } = useDamagedProducts();
  const { data: products = [] } = useProducts();
  const totalDamaged = damagedProducts.reduce((sum, p) => sum + p.quantity, 0);
  const mostRecentReport = damagedProducts.reduce<string | null>((latest, product) => {
    if (!product.date) {
      return latest;
    }

    if (!latest) {
      return product.date;
    }

    return Date.parse(product.date) > Date.parse(latest) ? product.date : latest;
  }, null);
  const hasUploadedCatalog = products.some((product) => product.source === "uploaded");
  const hasLimitedCatalog = !hasUploadedCatalog && products.some((product) => product.source === "sales-derived");
  const affectedCategories = new Set(damagedProducts.map((product) => product.category)).size;

  return (
    <DashboardLayout>
      <DashboardHeader userName="Distributor" />

      <h1 className="text-2xl font-bold text-foreground mb-6">Damaged Products</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {hasUploadedCatalog
          ? "Showing damaged quantities from the active uploaded catalog and any manually maintained stock entries."
          : hasLimitedCatalog
            ? "The current upload is analytics-only, so this page will only show manually recorded damaged stock until a full catalog CSV with Damaged Qty is uploaded."
            : "Showing damaged quantities recorded in the current stock catalog."}
      </p>

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
          <p className="text-2xl font-bold text-card-foreground">{affectedCategories}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Most Recent Report</p>
          <p className="text-2xl font-bold text-card-foreground">{formatReportedDate(mostRecentReport)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Loading damaged stock...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-danger py-8">
                  Damaged stock could not be loaded right now.
                </TableCell>
              </TableRow>
            ) : damagedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {hasLimitedCatalog
                    ? "No product-level damaged quantities are available in the active dataset yet. Upload a full catalog CSV with Damaged Qty or record damaged units in stock management."
                    : "No damaged quantities are currently recorded in the active catalog."}
                </TableCell>
              </TableRow>
            ) : damagedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-card-foreground">
                  <div>
                    <p>{product.name}</p>
                    {product.productCode && <p className="text-xs text-muted-foreground">{product.productCode}</p>}
                    {(product.supplier || product.warehouse) && (
                      <p className="text-xs text-muted-foreground">
                        {[product.supplier, product.warehouse].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.category}</TableCell>
                <TableCell className="text-danger font-medium">{product.quantity}</TableCell>
                <TableCell>
                  <Badge variant={product.source === "manual" ? "secondary" : "outline"}>
                    {product.source === "manual"
                      ? "Manual"
                      : product.source === "uploaded"
                        ? "Uploaded"
                        : "Sales-derived"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.reason}</TableCell>
                <TableCell className="text-muted-foreground">{formatReportedDate(product.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default DamagedProducts;
