import { useEffect, useState } from "react";
import { Search, Package, ArrowDown, AlertTriangle, Plus, Edit, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { useStockAlerts, useDamagedProducts, useInsightsRecommendations, useProducts } from "@/hooks/useAnalyticsData";

const emptyProduct: Omit<Product, "id"> = {
  name: "", category: "", supplier: "", costPrice: 0, sellingPrice: 0, stockQty: 0, status: "in-stock",
};

const StockManagement = () => {
  const { data: stockAlerts = [] } = useStockAlerts();
  const { data: damagedProducts = [] } = useDamagedProducts();
  const { data: recData } = useInsightsRecommendations();
  const { data: fetchedProducts = [] } = useProducts();
  const lowStockRecommendations = (recData?.recommendations ?? []).slice(0, 3).map((r) => ({
    name: r.name,
    restockQty: 30,
  }));
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  // keep existing local editing behavior, but seed list from backend
  useEffect(() => {
    if (products.length === 0 && fetchedProducts.length > 0) {
      setProducts(fetchedProducts);
    }
    // only seed when local list is empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedProducts]);

  const categories = ["All Categories", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ name: product.name, category: product.category, supplier: product.supplier, costPrice: product.costPrice, sellingPrice: product.sellingPrice, stockQty: product.stockQty, status: product.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast({ title: "Error", description: "Name and category are required", variant: "destructive" });
      return;
    }
    const status = form.stockQty < 20 ? "low-stock" as const : "in-stock" as const;

    if (editingProduct) {
      const updated = { ...editingProduct, ...form, status };
      setProducts(products.map((p) => p.id === editingProduct.id ? updated : p));
      const { id: _id, ...updates } = updated;
      api.updateProduct(editingProduct.id, updates).catch(() => {});
      toast({ title: "Product Updated", description: `${form.name} has been updated` });
    } else {
      const tempId = -Date.now();
      const newProduct: Product = { ...form, status, id: tempId };
      setProducts([...products, newProduct]);
      api.createProduct({ ...form, status }).then((created) => {
        setProducts((prev) => prev.map((p) => (p.id === tempId ? created : p)));
      }).catch(() => {});
      toast({ title: "Product Added", description: `${form.name} has been added` });
    }
    setDialogOpen(false);
  };

  const summary = {
    totalProducts: products.length,
    inStockItems: products.filter((p) => p.status === "in-stock").length,
    lowStockItems: products.filter((p) => p.status === "low-stock").length,
    damagedStock: damagedProducts.length,
  };

  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />
      <h1 className="text-2xl font-bold text-foreground mb-6">Stock Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-primary rounded-xl p-4 text-primary-foreground">
          <p className="text-sm opacity-80">Total Products</p>
          <p className="text-2xl font-bold flex items-center gap-2"><Package size={20} /> {summary.totalProducts}</p>
        </div>
        <div className="bg-primary/80 rounded-xl p-4 text-primary-foreground">
          <p className="text-sm opacity-80">In Stock Items</p>
          <p className="text-2xl font-bold flex items-center gap-2"><ArrowDown size={20} /> {summary.inStockItems}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-warning text-warning">
          <p className="text-sm">Low Stock</p>
          <p className="text-2xl font-bold">{summary.lowStockItems} Items</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-destructive text-destructive">
          <p className="text-sm">Damaged Stock</p>
          <p className="text-2xl font-bold">{summary.damagedStock} Items</p>
        </div>
        <button onClick={openAdd} className="bg-primary rounded-xl p-4 text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search by product, category or supplier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
              <option value="All">Stock Status: All</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>

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
                        {product.status === "low-stock" && <Badge variant="destructive" className="text-xs">Low Stock</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => openEdit(product)} className="flex items-center gap-1 px-3 py-1 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
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
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Stock Alerts</h3>
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={14} className={alert.type === "low-stock" ? "text-destructive" : "text-warning"} />
                  <span className="text-card-foreground">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {(["name", "category", "supplier"] as const).map((field) => (
              <div key={field}>
                <label className="text-sm text-muted-foreground capitalize">{field}</label>
                <input
                  type="text"
                  value={(form as any)[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              {(["costPrice", "sellingPrice", "stockQty"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm text-muted-foreground">{field === "costPrice" ? "Cost ₹" : field === "sellingPrice" ? "Sell ₹" : "Qty"}</label>
                  <input
                    type="number"
                    value={(form as any)[field] || ""}
                    onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                    className="w-full px-3 py-2 mt-1 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StockManagement;
