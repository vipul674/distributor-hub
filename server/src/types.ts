export interface BillRecord {
  sourceFile: string;
  date: string;
  productCategory: string;
  quantity: number;
  totalAmount: number;
}

export interface MonthlyCategoryRow {
  year: number;
  month: number;
  productCategory: string;
  quantity: number;
  revenue: number;
}

export interface YearlyCategoryRow {
  year: number;
  productCategory: string;
  quantity: number;
  revenue: number;
}

export interface ForecastInput {
  productCategory: string;
  year: number;
  month: number;
  lag1: number;
  lag2: number;
  rollingMean3: number;
}

export interface ForecastResult {
  productCategory: string;
  year: number;
  month: number;
  predictedDemand: number;
}

export type TrendLabel = "Growing" | "Stable" | "Declining";

export interface TrendResult {
  productCategory: string;
  avgQuantity: number;
  volatility: number;
  cluster: number;
  trend: TrendLabel;
}

export interface RecommendationResult {
  productCategory: string;
  predictedDemand: number;
  trend: TrendLabel;
  trendWeight: number;
  score: number;
}

export interface DashboardStats {
  monthlySales: string;
  stockAvailability: number;
  damagedStock: number;
}

export interface SalesPoint {
  name: string;
  value: number;
}

export interface WeeklySalesPoint {
  day: string;
  sales: number;
}

export interface SalesByCategoryPoint {
  category: string;
  sales: number;
  percentage: number;
}

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

export interface ProfitMargin {
  category: string;
  margin: number;
}

export interface AnalyticsSnapshot {
  monthlyCategory: MonthlyCategoryRow[];
  yearlyCategory: YearlyCategoryRow[];
  forecast: ForecastResult[];
  trends: TrendResult[];
  recommendations: RecommendationResult[];
  dashboardStats: DashboardStats;
  monthlySales: SalesPoint[];
  yearlySales: SalesPoint[];
  weeklySales: WeeklySalesPoint[];
  salesByCategory: SalesByCategoryPoint[];
  stockAlerts: StockAlert[];
  damagedProducts: DamagedProduct[];
  demandPredictions: string[];
  topRecommendations: Array<{ id: number; name: string; icon: "medical" | "snack" }>;
  businessInsights: BusinessInsight[];
  profitMargins: ProfitMargin[];
  businessExpansionSuggestions: string[];
}
