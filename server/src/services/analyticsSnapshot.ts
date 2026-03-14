import { seedDamagedProducts } from "../data/seedBills.js";
import {
  AnalyticsSnapshot,
  BillRecord,
  BusinessInsight,
  ForecastResult,
  ProfitMargin,
  RecommendationResult,
  TrendLabel,
  TrendResult,
} from "../types.js";
import {
  buildForecastInputs,
  buildMonthlyCategory,
  buildMonthlySalesSeries,
  buildSalesByCategory,
  buildTrendFeatures,
  buildWeeklySalesSeries,
  buildYearlyCategory,
  buildYearlySalesSeries,
} from "./aggregation.js";
import { OnnxService } from "./onnxService.js";

const TREND_MAP: Record<number, TrendLabel> = {
  0: "Stable",
  1: "Growing",
  2: "Declining",
};

const TREND_WEIGHT: Record<TrendLabel, number> = {
  Growing: 1.3,
  Stable: 1,
  Declining: 0.6,
};

const CATEGORY_COST_RATIO: Record<string, number> = {
  Beverages: 0.66,
  Snacks: 0.6,
  Groceries: 0.74,
  "Personal Care": 0.57,
  Health: 0.62,
  Electronics: 0.78,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getLatestMonthRevenue(monthlyCategory: AnalyticsSnapshot["monthlyCategory"]): number {
  const latest = monthlyCategory.reduce<{ year: number; month: number } | null>((acc, row) => {
    if (!acc) return { year: row.year, month: row.month };
    if (row.year > acc.year || (row.year === acc.year && row.month > acc.month)) {
      return { year: row.year, month: row.month };
    }
    return acc;
  }, null);

  if (!latest) return 0;

  return monthlyCategory
    .filter((row) => row.year === latest.year && row.month === latest.month)
    .reduce((sum, row) => sum + row.revenue, 0);
}

function buildBusinessInsights(records: BillRecord[], monthlySalesSeries: AnalyticsSnapshot["monthlySales"], stockAvailability: number): BusinessInsight[] {
  const latestRevenue = monthlySalesSeries.at(-1)?.value ?? 0;
  const previousRevenue = monthlySalesSeries.at(-2)?.value ?? latestRevenue;
  const revenueGrowth = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const latestDate = records.reduce<Date | null>((acc, row) => {
    const date = new Date(row.date);
    if (!acc || date > acc) return date;
    return acc;
  }, null);

  const cutoff = latestDate ? new Date(latestDate) : new Date();
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 3);

  const totalAmount = records.reduce((sum, row) => sum + row.totalAmount, 0);
  const averageOrderValue = records.length ? totalAmount / records.length : 0;
  const recentCategorySet = new Set(records.filter((row) => new Date(row.date) >= cutoff).map((row) => row.productCategory));
  const allCategorySet = new Set(records.map((row) => row.productCategory));
  const retention = allCategorySet.size ? (recentCategorySet.size / allCategorySet.size) * 100 : 0;

  const recentQuantity = records
    .filter((row) => new Date(row.date) >= cutoff)
    .reduce((sum, row) => sum + row.quantity, 0);
  const stockTurnover = stockAvailability > 0 ? recentQuantity / stockAvailability : 0;

  return [
    {
      title: "Revenue Growth",
      value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      description: "Compared to previous month",
      trend: revenueGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Customer Retention",
      value: `${retention.toFixed(0)}%`,
      description: "Active categories in last 3 months",
      trend: retention >= 80 ? "up" : "down",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(averageOrderValue),
      description: "Per bill row",
      trend: averageOrderValue >= 3000 ? "up" : "down",
    },
    {
      title: "Stock Turnover",
      value: `${stockTurnover.toFixed(1)}x`,
      description: "Quarterly quantity to stock ratio",
      trend: stockTurnover >= 1 ? "up" : "down",
    },
  ];
}

function buildProfitMargins(yearlyCategory: AnalyticsSnapshot["yearlyCategory"]): ProfitMargin[] {
  const latestYear = yearlyCategory.reduce((max, row) => Math.max(max, row.year), 0);
  const rows = yearlyCategory.filter((row) => row.year === latestYear);

  return rows
    .map((row) => {
      const ratio = CATEGORY_COST_RATIO[row.productCategory] ?? 0.68;
      const margin = clamp((1 - ratio) * 100, 12, 60);
      return { category: row.productCategory, margin: Number(margin.toFixed(0)) };
    })
    .sort((a, b) => b.margin - a.margin);
}

function buildDemandPredictions(recommendations: RecommendationResult[]): string[] {
  return recommendations.slice(0, 4).map((item) => `Stock more ${item.productCategory}; projected demand ${item.predictedDemand.toFixed(0)} units next month`);
}

function buildTopRecommendations(recommendations: RecommendationResult[]): Array<{ id: number; name: string; icon: "medical" | "snack" }> {
  return recommendations.slice(0, 5).map((item, index) => ({
    id: index + 1,
    name: item.productCategory,
    icon: ["Health", "Personal Care"].includes(item.productCategory) ? "medical" : "snack",
  }));
}

function buildBusinessExpansionSuggestions(trends: TrendResult[]): string[] {
  const growing = trends.filter((trend) => trend.trend === "Growing");
  const selected = growing.length > 0 ? growing : trends;
  return selected.slice(0, 5).map((trend) => `Expand ${trend.productCategory} distribution in high-demand retail zones`);
}

export async function buildAnalyticsSnapshot(records: BillRecord[], onnxService: OnnxService): Promise<AnalyticsSnapshot> {
  const monthlyCategory = buildMonthlyCategory(records);
  const yearlyCategory = buildYearlyCategory(records);

  const forecastInputs = buildForecastInputs(monthlyCategory);
  const forecastValues = await onnxService.predictDemand(forecastInputs);

  const forecast: ForecastResult[] = forecastInputs.map((input, index) => ({
    productCategory: input.productCategory,
    year: input.year,
    month: input.month,
    predictedDemand: Number((forecastValues[index] ?? 0).toFixed(3)),
  }));

  const trendFeatures = buildTrendFeatures(yearlyCategory);
  const clusters = await onnxService.classifyTrend(trendFeatures);
  const trends: TrendResult[] = trendFeatures.map((feature, index) => ({
    productCategory: feature.productCategory,
    avgQuantity: Number(feature.avgQuantity.toFixed(3)),
    volatility: Number(feature.volatility.toFixed(3)),
    cluster: clusters[index] ?? 0,
    trend: TREND_MAP[clusters[index] ?? 0] ?? "Stable",
  }));

  const trendByCategory = new Map(trends.map((trend) => [trend.productCategory, trend]));

  const recommendations: RecommendationResult[] = forecast
    .map((row) => {
      const trend = trendByCategory.get(row.productCategory)?.trend ?? "Stable";
      const trendWeight = TREND_WEIGHT[trend];
      const score = row.predictedDemand * trendWeight;

      return {
        productCategory: row.productCategory,
        predictedDemand: row.predictedDemand,
        trend,
        trendWeight,
        score: Number(score.toFixed(3)),
      };
    })
    .sort((a, b) => b.score - a.score);

  const latestMonthRevenue = getLatestMonthRevenue(monthlyCategory);
  const stockAvailability = Math.max(1, Math.round(monthlyCategory.slice(-6).reduce((sum, row) => sum + row.quantity, 0) / 2));
  const damagedStock = seedDamagedProducts.reduce((sum, row) => sum + row.quantity, 0);

  const lowStockAlerts = recommendations.slice(0, 2).map((row, index) => ({
    id: index + 1,
    type: "low-stock" as const,
    message: `Low stock risk: ${row.productCategory} may need replenishment soon`,
  }));

  const stockAlerts = [
    ...lowStockAlerts,
    {
      id: lowStockAlerts.length + 1,
      type: "expiring" as const,
      message: "Review warehouse expiry batches for fragile goods",
    },
  ];

  const monthlySales = buildMonthlySalesSeries(monthlyCategory);
  const yearlySales = buildYearlySalesSeries(yearlyCategory);
  const weeklySales = buildWeeklySalesSeries(monthlyCategory);
  const salesByCategory = buildSalesByCategory(monthlyCategory);
  const demandPredictions = buildDemandPredictions(recommendations);
  const topRecommendations = buildTopRecommendations(recommendations);
  const businessExpansionSuggestions = buildBusinessExpansionSuggestions(trends);
  const businessInsights = buildBusinessInsights(records, monthlySales, stockAvailability);
  const profitMargins = buildProfitMargins(yearlyCategory);

  return {
    monthlyCategory,
    yearlyCategory,
    forecast,
    trends,
    recommendations,
    dashboardStats: {
      monthlySales: formatCurrency(latestMonthRevenue),
      stockAvailability,
      damagedStock,
    },
    monthlySales,
    yearlySales,
    weeklySales,
    salesByCategory,
    stockAlerts,
    damagedProducts: seedDamagedProducts,
    demandPredictions,
    topRecommendations,
    businessInsights,
    profitMargins,
    businessExpansionSuggestions,
  };
}
