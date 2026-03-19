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

const TREND_MAP = {
  0: "Stable",
  1: "Growing",
  2: "Declining",
};

const TREND_WEIGHT = {
  Growing: 1.3,
  Stable: 1,
  Declining: 0.6,
};

const CATEGORY_COST_RATIO = {
  Beauty: 0.58,
  Clothing: 0.52,
  Beverages: 0.66,
  Snacks: 0.6,
  Groceries: 0.74,
  "Personal Care": 0.57,
  Health: 0.62,
  Electronics: 0.78,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getYearMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function formatMonthLabel(period) {
  if (!period) return "No data";

  const date = new Date(Date.UTC(period.year, period.month - 1, 1));
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getTransactionKey(record, index) {
  return record.transactionId || `${record.sourceFile}-${index + 1}`;
}

function calculateChange(currentValue, previousValue) {
  if (previousValue <= 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}

function buildTransactionSummaries(records) {
  const grouped = new Map();

  records.forEach((record, index) => {
    const key = getTransactionKey(record, index);
    const existing = grouped.get(key);

    if (existing) {
      existing.amount += record.totalAmount;
      existing.quantity += record.quantity;
      return;
    }

    grouped.set(key, {
      id: key,
      customerId: record.customerId ?? null,
      date: record.date,
      amount: record.totalAmount,
      quantity: record.quantity,
    });
  });

  return [...grouped.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function buildMonthlyPeriodStats(records, transactions) {
  const grouped = new Map();

  records.forEach((record) => {
    const date = new Date(record.date);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const key = getYearMonthKey(year, month);
    const existing = grouped.get(key) ?? {
      key,
      year,
      month,
      revenue: 0,
      quantity: 0,
      days: new Set(),
      categories: new Set(),
      customers: new Set(),
      transactionIds: new Set(),
      lastObservedDay: 0,
    };

    existing.revenue += record.totalAmount;
    existing.quantity += record.quantity;
    existing.days.add(day);
    existing.categories.add(record.productCategory);
    if (record.customerId) {
      existing.customers.add(record.customerId);
    }
    existing.lastObservedDay = Math.max(existing.lastObservedDay, day);
    grouped.set(key, existing);
  });

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = getYearMonthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
    const existing = grouped.get(key);

    if (!existing) {
      return;
    }

    existing.transactionIds.add(transaction.id);
    if (transaction.customerId) {
      existing.customers.add(transaction.customerId);
    }
  });

  return [...grouped.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((period) => ({
      key: period.key,
      year: period.year,
      month: period.month,
      revenue: Number(period.revenue.toFixed(2)),
      quantity: period.quantity,
      transactionCount: period.transactionIds.size,
      customerCount: period.customers.size,
      categoryCount: period.categories.size,
      dayCount: period.days.size,
      lastObservedDay: period.lastObservedDay,
    }));
}

function isLikelyPartialMonth(period) {
  return period.dayCount < 10 && period.lastObservedDay < 25;
}

function getReportingMonth(monthlyPeriods) {
  if (monthlyPeriods.length === 0) {
    return null;
  }

  const latest = monthlyPeriods[monthlyPeriods.length - 1];
  if (monthlyPeriods.length > 1 && isLikelyPartialMonth(latest)) {
    return monthlyPeriods[monthlyPeriods.length - 2];
  }

  return latest;
}

function getPreviousPeriod(monthlyPeriods, reportingPeriod) {
  if (!reportingPeriod) {
    return null;
  }

  const index = monthlyPeriods.findIndex((period) => period.key === reportingPeriod.key);
  return index > 0 ? monthlyPeriods[index - 1] : null;
}

function buildBusinessInsights(reportingPeriod, previousPeriod) {
  if (!reportingPeriod) {
    return [];
  }

  const reportingLabel = formatMonthLabel(reportingPeriod);
  const previousLabel = previousPeriod ? formatMonthLabel(previousPeriod) : "previous month";
  const revenueGrowth = calculateChange(reportingPeriod.revenue, previousPeriod?.revenue ?? 0);
  const transactionChange = calculateChange(reportingPeriod.transactionCount, previousPeriod?.transactionCount ?? 0);
  const customerChange = calculateChange(reportingPeriod.customerCount, previousPeriod?.customerCount ?? 0);
  const reportingAverageOrderValue = reportingPeriod.transactionCount
    ? reportingPeriod.revenue / reportingPeriod.transactionCount
    : 0;
  const previousAverageOrderValue = previousPeriod?.transactionCount
    ? previousPeriod.revenue / previousPeriod.transactionCount
    : 0;

  return [
    {
      title: "Revenue Growth",
      value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      description: `${reportingLabel} vs ${previousLabel}`,
      trend: revenueGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Transactions",
      value: `${reportingPeriod.transactionCount}`,
      description: `Completed sales in ${reportingLabel}`,
      trend: transactionChange >= 0 ? "up" : "down",
    },
    {
      title: "Unique Customers",
      value: `${reportingPeriod.customerCount}`,
      description: `Distinct buyers in ${reportingLabel}`,
      trend: customerChange >= 0 ? "up" : "down",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(reportingAverageOrderValue),
      description: `Per transaction in ${reportingLabel}`,
      trend: reportingAverageOrderValue >= previousAverageOrderValue ? "up" : "down",
    },
  ];
}

function buildProfitMargins(salesByCategory) {
  return salesByCategory
    .map((row) => {
      const ratio = CATEGORY_COST_RATIO[row.category] ?? 0.68;
      const margin = clamp((1 - ratio) * 100, 12, 60);
      return { category: row.category, margin: Number(margin.toFixed(0)) };
    })
    .sort((a, b) => b.margin - a.margin);
}

function buildDemandPredictions(recommendations) {
  return recommendations
    .slice(0, 4)
    .map((item) => `${item.productCategory}: projected demand of ${item.predictedDemand.toFixed(0)} units next month`);
}

function buildTopRecommendations(recommendations) {
  return recommendations.slice(0, 5).map((item, index) => ({
    id: index + 1,
    name: item.productCategory,
    predictedDemand: Number(item.predictedDemand.toFixed(0)),
    icon: ["Health", "Personal Care", "Beauty"].includes(item.productCategory) ? "medical" : "snack",
  }));
}

function buildBusinessExpansionSuggestions(recommendations) {
  return recommendations
    .slice(0, 5)
    .map((recommendation) => `Prioritize ${recommendation.productCategory} in next month planning and channel promotions`);
}

export async function buildAnalyticsSnapshot(records, onnxService, damagedProducts = []) {
  const monthlyCategory = buildMonthlyCategory(records);
  const yearlyCategory = buildYearlyCategory(records);
  const transactionSummaries = buildTransactionSummaries(records);
  const monthlyPeriods = buildMonthlyPeriodStats(records, transactionSummaries);
  const reportingPeriod = getReportingMonth(monthlyPeriods);
  const previousPeriod = getPreviousPeriod(monthlyPeriods, reportingPeriod);

  const forecastInputs = buildForecastInputs(monthlyCategory);
  const forecastValues = await onnxService.predictDemand(forecastInputs);

  const forecast = forecastInputs.map((input, index) => ({
    productCategory: input.productCategory,
    year: input.year,
    month: input.month,
    predictedDemand: Number((forecastValues[index] ?? 0).toFixed(3)),
  }));

  const trendFeatures = buildTrendFeatures(yearlyCategory);
  const clusters = await onnxService.classifyTrend(trendFeatures);
  const trends = trendFeatures.map((feature, index) => ({
    productCategory: feature.productCategory,
    avgQuantity: Number(feature.avgQuantity.toFixed(3)),
    volatility: Number(feature.volatility.toFixed(3)),
    cluster: clusters[index] ?? 0,
    trend: TREND_MAP[clusters[index] ?? 0] ?? "Stable",
  }));

  const trendByCategory = new Map(trends.map((trend) => [trend.productCategory, trend]));

  const recommendations = forecast
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

  const normalizedDamagedProducts = damagedProducts.map((item) => ({ ...item }));
  const monthlySales = buildMonthlySalesSeries(monthlyCategory, reportingPeriod);
  const yearlySales = buildYearlySalesSeries(yearlyCategory, reportingPeriod);
  const weeklySales = buildWeeklySalesSeries(records, reportingPeriod);
  const salesByCategory = buildSalesByCategory(records, reportingPeriod);
  const demandPredictions = buildDemandPredictions(recommendations);
  const topRecommendations = buildTopRecommendations(recommendations);
  const businessExpansionSuggestions = buildBusinessExpansionSuggestions(recommendations);
  const businessInsights = buildBusinessInsights(reportingPeriod, previousPeriod);
  const profitMargins = buildProfitMargins(salesByCategory);
  const stockAlerts = recommendations.slice(0, 3).map((recommendation, index) => ({
    id: index + 1,
    type: "low-stock",
    message: `${recommendation.productCategory}: projected demand ${recommendation.predictedDemand.toFixed(0)} units next month`,
  }));

  return {
    monthlyCategory,
    yearlyCategory,
    forecast,
    trends,
    recommendations,
    dashboardStats: {
      monthlySales: formatCurrency(reportingPeriod?.revenue ?? 0),
      transactions: reportingPeriod?.transactionCount ?? 0,
      unitsSold: reportingPeriod?.quantity ?? 0,
      activeCategories: reportingPeriod?.categoryCount ?? 0,
      reportingPeriodLabel: formatMonthLabel(reportingPeriod),
    },
    monthlySales,
    yearlySales,
    weeklySales,
    salesByCategory,
    stockAlerts,
    damagedProducts: normalizedDamagedProducts,
    demandPredictions,
    topRecommendations,
    businessInsights,
    profitMargins,
    businessExpansionSuggestions,
  };
}
