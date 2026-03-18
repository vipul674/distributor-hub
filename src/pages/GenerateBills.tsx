import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { toast } from "@/hooks/use-toast";
import { api, RecentBill } from "@/lib/api";
import { useProducts, useRecentBills } from "@/hooks/useAnalyticsData";

interface BillItem {
  product: string;
  qty: number;
  price: number;
}

const GenerateBills = () => {
  const { data: allProducts = [] } = useProducts();
  const { data: recentBills = [] } = useRecentBills();
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<BillItem[]>([{ product: "", qty: 1, price: 0 }]);
  const [bills, setBills] = useState<RecentBill[]>([]);

  useEffect(() => {
    if (bills.length === 0 && recentBills.length > 0) {
      setBills(recentBills);
    }
    // seed only once when empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentBills]);

  const addItem = () => setItems([...items, { product: "", qty: 1, price: 0 }]);

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill price from product catalog
    if (field === "product") {
      const match = allProducts.find(
        (p) => p.name.toLowerCase() === (value as string).toLowerCase()
      );
      if (match) {
        updated[index].price = match.sellingPrice;
      }
    }

    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleGenerateBill = () => {
    if (!customerName.trim()) {
      toast({ title: "Error", description: "Please enter customer name", variant: "destructive" });
      return;
    }

    const validItems = items.filter((item) => item.product.trim() && item.qty > 0 && item.price > 0);
    if (validItems.length === 0) {
      toast({ title: "Error", description: "Add at least one valid item", variant: "destructive" });
      return;
    }

    const billTotal = validItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const newBill: RecentBill = {
      id: `INV-${String(bills.length + 1).padStart(3, "0")}`,
      customer: customerName,
      amount: billTotal,
      date: new Date().toISOString().split("T")[0],
      items: validItems.length,
    };

    setBills([newBill, ...bills]);
    api.createManualBill(newBill).catch(() => {});
    setCustomerName("");
    setItems([{ product: "", qty: 1, price: 0 }]);

    toast({ title: "Bill Generated!", description: `${newBill.id} for ${newBill.customer} — ₹${billTotal.toLocaleString()}` });
  };

  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Form */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">Generate New Bill</h2>

          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-1 block">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-3 mb-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_100px_auto] gap-3 items-center">
                <input
                  type="text"
                  placeholder="Product name"
                  value={item.product}
                  onChange={(e) => updateItem(index, "product", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={item.price || ""}
                  onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive/80 text-sm font-medium"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addItem} className="text-sm text-primary hover:underline mb-4">+ Add Item</button>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <p className="text-lg font-semibold text-card-foreground">Total: ₹{total.toLocaleString()}</p>
            <button
              onClick={handleGenerateBill}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Generate Bill
            </button>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-base font-semibold text-card-foreground mb-4">Recent Bills</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{bill.id}</p>
                  <p className="text-xs text-muted-foreground">{bill.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">₹{bill.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{bill.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GenerateBills;
