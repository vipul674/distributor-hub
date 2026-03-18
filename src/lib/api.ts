const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface DashboardStats {
  monthlySales: string;
  stockAvailability: number;
  damagedStock: number;
}

export interface SalesPoint { name: string; value: number }
export interface WeeklySalesPoint { day: string; sales: number }
export interface SalesByCategoryPoint { category: string; sales: number; percentage: number }

export interface StockAlert {
  id: number;
  type: "low-stock" | "expiring";
  message: string;
}

export interface DamagedProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  reason: string;
  date: string;
}

export interface BusinessInsight {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down";
}

export interface ProfitMargin { category: string; margin: number }

export interface Product {
  id: number;
  name: string;
  category: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  status: "in-stock" | "low-stock";
}

export interface RecentBill {
  id: string;
  customer: string;
  amount: number;
  date: string;
  items: number;
}

export interface BusinessInsightsResponse {
  insights: BusinessInsight[];
  profitMargins: ProfitMargin[];
}

export interface TopRecommendation { id: number; name: string; icon: "medical" | "snack" }

export interface InsightsRecommendationsResponse {
  predictions: string[];
  recommendations: TopRecommendation[];
  suggestions: string[];
}

export interface UploadResult {
  uploadedFiles: number;
  parsedRows: number;
  totalRows: number;
  uploadedRows: number;
}

export interface ProcessResult {
  message: string;
  totalRecords: number;
  uploadedRecords: number;
  categories: string[];
  forecastCount: number;
}

export const api = {
  getDashboardStats: () => get<DashboardStats>("/dashboard/stats"),
  getMonthlySales: () => get<SalesPoint[]>("/sales/monthly"),
  getYearlySales: () => get<SalesPoint[]>("/sales/yearly"),
  getWeeklySales: () => get<WeeklySalesPoint[]>("/sales/weekly"),
  getSalesByCategory: () => get<SalesByCategoryPoint[]>("/sales/by-category"),
  getStockAlerts: () => get<StockAlert[]>("/stock/alerts"),
  getDamagedProducts: () => get<DamagedProduct[]>("/stock/damaged"),
  getBusinessInsights: () => get<BusinessInsightsResponse>("/insights/business"),
  getInsightsRecommendations: () => get<InsightsRecommendationsResponse>("/insights/recommendations"),

  getProducts: () => get<Product[]>("/products"),
  createProduct: async (payload: Omit<Product, "id">): Promise<Product> => {
    const res = await fetch(`${BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create product failed: ${res.status}`);
    return res.json() as Promise<Product>;
  },
  updateProduct: async (id: number, payload: Partial<Omit<Product, "id">>): Promise<Product> => {
    const res = await fetch(`${BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Update product failed: ${res.status}`);
    return res.json() as Promise<Product>;
  },
  deleteProduct: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/products/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error(`Delete product failed: ${res.status}`);
  },

  getRecentBills: () => get<RecentBill[]>("/bills/recent"),
  createManualBill: async (payload: RecentBill): Promise<RecentBill> => {
    const res = await fetch(`${BASE}/bills/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create bill failed: ${res.status}`);
    return res.json() as Promise<RecentBill>;
  },

  uploadBills: async (files: File[]): Promise<UploadResult> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await fetch(`${BASE}/bills/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<UploadResult>;
  },

  processBills: async (): Promise<ProcessResult> => {
    const res = await fetch(`${BASE}/bills/process`, { method: "POST" });
    if (!res.ok) throw new Error(`Process failed: ${res.status}`);
    return res.json() as Promise<ProcessResult>;
  },
};
