import { useState } from "react";
import { Search, Package, ArrowDown, AlertTriangle, Plus, Edit } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { products, stockSummary, stockAlerts, lowStockRecommendations, damagedProducts } from "@/assets/fakeData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const StockManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");

  const categories = ["All Categories", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />

      <h1 className="text-2xl font-bold text-foreground mb-6">Stock Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-primary rounded-xl p-4 text-primary-foreground">
          <p className="text-sm opacity-80">Total Products</p>
          <p className="text-2xl font-bold flex items-center gap-2"><Package size={20} /> {stockSummary.totalProducts}</p>
        </div>
        <div className="bg-primary/80 rounded-xl p-4 text-primary-foreground">
          <p className="text-sm opacity-80">In Stock Items</p>
          <p className="text-2xl font-bold flex items-center gap-2"><ArrowDown size={20} /> {stockSummary.inStockItems}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-warning text-warning">
          <p className="text-sm">Low Stock</p>
          <p className="text-2xl font-bold">{stockSummary.lowStockItems} Items</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-danger text-danger">
          <p className="text-sm">Damaged Stock</p>
          <p className="text-2xl font-bold">{stockSummary.damagedStock} Items</p>
        </div>
        <button className="bg-primary rounded-xl p-4 text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product, category or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
            >
              <option value="All">Stock Status: All</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>

          {/* Products Table */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Stock Qty</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-card-foreground">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-muted-foreground">{product.supplier}</TableCell>
                    <TableCell>₹{product.costPrice}</TableCell>
                    <TableCell>₹{product.sellingPrice}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stockQty}
                        {product.status === "low-stock" && (
                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button className="flex items-center gap-1 px-3 py-1 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                        <Edit size={12} /> Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
              Showing {filtered.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Stock Alerts */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Stock Alerts</h3>
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={14} className={alert.type === "low-stock" ? "text-danger" : "text-warning"} />
                  <span className="text-card-foreground">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Damaged Stock Summary */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Damaged Stock Summary</h3>
            <div className="space-y-3">
              {damagedProducts.slice(0, 2).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-card-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.quantity} Units</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Recommendations */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Low Stock Recommendations</h3>
            <div className="space-y-3">
              {lowStockRecommendations.map((rec, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-card-foreground">{rec.name}</p>
                  <p className="text-xs text-muted-foreground">Restock suggested: {rec.restockQty} units</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockManagement;
