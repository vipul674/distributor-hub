import { useEffect, useState } from "react";
import { Search, Package, ArrowDown, AlertTriangle, Plus, Edit, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { useStockAlerts, useDamagedProducts, useInsightsRecommendations, useProducts } from "@/hooks/useAnalyticsData";

type ProductForm = {
  productCode: string;
  name: string;
  category: string;
  supplier: string;
  warehouse: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  reorderLevel: number;
  damagedQty: number;
  status: "in-stock" | "low-stock";
};
type ProductTextField = "productCode" | "name" | "category" | "supplier" | "warehouse";
type ProductNumberField = "costPrice" | "sellingPrice" | "stockQty" | "reorderLevel" | "damagedQty";

const textFields: Array<{ key: ProductTextField; label: string }> = [
  { key: "productCode", label: "Product Code" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "supplier", label: "Supplier" },
  { key: "warehouse", label: "Warehouse" },
];

const numberFields: Array<{ key: ProductNumberField; label: string }> = [
  { key: "costPrice", label: "Cost Rs" },
  { key: "sellingPrice", label: "Sell Rs" },
  { key: "stockQty", label: "Qty" },
  { key: "reorderLevel", label: "Reorder" },
  { key: "damagedQty", label: "Damaged" },
];

const emptyProduct: ProductForm = {
  productCode: "",
  name: "",
  category: "",
  supplier: "",
  warehouse: "",
  costPrice: 0,
  sellingPrice: 0,
  stockQty: 0,
  reorderLevel: 20,
  damagedQty: 0,
  status: "in-stock",
};

const StockManagement = () => {
  const queryClient = useQueryClient();
  const { data: stockAlerts = [] } = useStockAlerts();
  const { data: damagedProducts = [] } = useDamagedProducts();
  const { data: recData } = useInsightsRecommendations();
  const { data: fetchedProducts = [] } = useProducts();
  const hasUploadedCatalog = fetchedProducts.some((product) => product.source === "uploaded");
  const hasLimitedCatalog = !hasUploadedCatalog && fetchedProducts.some((product) => product.source === "sales-derived");
  const lowStockRecommendations = (recData?.recommendations ?? []).slice(0, 3).map((r) => ({
    name: r.name,
    restockQty: r.predictedDemand,
  }));
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProducts(fetchedProducts);
  }, [fetchedProducts]);

  const categories = ["All Categories", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.productCode ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.warehouse ?? "").toLowerCase().includes(searchQuery.toLowerCase());
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
    setForm({
      productCode: product.productCode ?? "",
      name: product.name,
      category: product.category,
      supplier: product.supplier,
      warehouse: product.warehouse ?? "",
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQty: product.stockQty,
      reorderLevel: product.reorderLevel ?? 20,
      damagedQty: product.damagedQty ?? 0,
      status: product.status,
    });
    setDialogOpen(true);
  };

  const updateTextField = (field: ProductTextField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateNumberField = (field: ProductNumberField, value: number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const refreshQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["stock", "damaged"] }),
    ]);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast({ title: "Error", description: "Name and category are required", variant: "destructive" });
      return;
    }

    if (form.damagedQty < 0) {
      toast({ title: "Error", description: "Damaged quantity cannot be negative", variant: "destructive" });
      return;
    }

    const reorderLevel = form.reorderLevel || 20;
    const status = form.stockQty <= reorderLevel ? "low-stock" as const : "in-stock" as const;
    const payload = {
      productCode: form.productCode.trim() || null,
      name: form.name.trim(),
      category: form.category.trim(),
      supplier: form.supplier.trim(),
      warehouse: form.warehouse.trim() || null,
      costPrice: form.costPrice,
      sellingPrice: form.sellingPrice,
      stockQty: form.stockQty,
      reorderLevel,
      damagedQty: form.damagedQty,
      status,
    };

    setIsSaving(true);

    if (editingProduct) {
      try {
        const updated = await api.updateProduct(editingProduct.id, payload);
        setProducts(products.map((product) => (product.id === editingProduct.id ? updated : product)));
        await refreshQueries();
        toast({ title: "Product Updated", description: `${payload.name} has been updated` });
        setDialogOpen(false);
      } catch (error) {
        toast({
          title: "Update failed",
          description: error instanceof Error ? error.message : "The product could not be updated.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        const created = await api.createProduct(payload);
        setProducts([...products, created]);
        await refreshQueries();
        toast({ title: "Product Added", description: `${payload.name} has been added` });
        setDialogOpen(false);
      } catch (error) {
        toast({
          title: "Create failed",
          description: error instanceof Error ? error.message : "The product could not be created.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const summary = {
    totalProducts: products.length,
    inStockItems: products.filter((p) => p.status === "in-stock").length,
    lowStockItems: products.filter((p) => p.status === "low-stock").length,
    damagedStock: damagedProducts.reduce((sum, product) => sum + product.quantity, 0),
  };

  return (
    <DashboardLayout>
      <DashboardHeader userName="Distributor" />
      <h1 className="text-2xl font-bold text-foreground mb-6">Stock Management</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {hasUploadedCatalog
          ? "Uploaded product rows are active. Stock quantity, supplier, pricing, and reorder status are coming from the enriched CSV."
          : hasLimitedCatalog
            ? "Rows tagged Sales-derived are estimated from the uploaded sales dataset because the file contains categories and transaction history, not a full product master or live warehouse stock counts."
            : "Manual catalog rows are active. Upload an enriched CSV to sync product pricing and reorder thresholds automatically."}
      </p>

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
          <p className="text-sm">Damaged Units</p>
          <p className="text-2xl font-bold">{summary.damagedStock} Units</p>
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
                  <TableHead>Damaged Qty</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-card-foreground">
                      <div className="flex items-center gap-2">
                        <div>
                          <span>{product.name}</span>
                          {product.productCode && <p className="text-xs text-muted-foreground">{product.productCode}</p>}
                        </div>
                        {product.source === "uploaded" && <Badge variant="secondary">Uploaded</Badge>}
                        {product.source === "sales-derived" && <Badge variant="outline">Sales-derived</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>
                        <span>{product.supplier}</span>
                        {product.warehouse && <p className="text-xs text-muted-foreground">{product.warehouse}</p>}
                      </div>
                    </TableCell>
                    <TableCell>₹{product.costPrice}</TableCell>
                    <TableCell>₹{product.sellingPrice}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stockQty}
                        {product.status === "low-stock" && <Badge variant="destructive" className="text-xs">Low Stock</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className={product.damagedQty ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {product.damagedQty ?? 0}
                    </TableCell>
                    <TableCell>{product.reorderLevel ?? "—"}</TableCell>
                    <TableCell>
                      {product.source === "sales-derived" || product.source === "uploaded" ? (
                        <Badge variant="outline" className="text-xs">Read only</Badge>
                      ) : (
                        <button onClick={() => openEdit(product)} className="flex items-center gap-1 px-3 py-1 rounded bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                          <Edit size={12} /> Edit
                        </button>
                      )}
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
            <h3 className="text-base font-semibold text-card-foreground mb-4">Demand Alerts</h3>
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
              {damagedProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No damaged units are currently recorded.</p>
              ) : damagedProducts.slice(0, 3).map((item) => (
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
                  <p className="text-xs text-muted-foreground">Suggested stock cover: {rec.restockQty} units</p>
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
            {textFields.map((field) => (
              <div key={field.key}>
                <label className="text-sm text-muted-foreground">{field.label}</label>
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={(e) => updateTextField(field.key, e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {numberFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-muted-foreground">{field.label}</label>
                  <input
                    type="number"
                    value={form[field.key] || ""}
                    onChange={(e) => updateNumberField(field.key, Number(e.target.value))}
                    className="w-full px-3 py-2 mt-1 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StockManagement;
