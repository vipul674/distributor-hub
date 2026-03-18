const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toYearMonth(dateIso) {
  const date = new Date(dateIso);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function sortMonthly(a, b) {
  if (a.productCategory !== b.productCategory) return a.productCategory.localeCompare(b.productCategory);
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

function sortYearly(a, b) {
  if (a.productCategory !== b.productCategory) return a.productCategory.localeCompare(b.productCategory);
  return a.year - b.year;
}

export function buildMonthlyCategory(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const { year, month } = toYearMonth(record.date);
    const key = `${year}-${month}-${record.productCategory}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += record.quantity;
      existing.revenue += record.totalAmount;
      return;
    }

    grouped.set(key, {
      year,
      month,
      productCategory: record.productCategory,
      quantity: record.quantity,
      revenue: record.totalAmount,
    });
  });

  return [...grouped.values()].sort(sortMonthly);
}

export function buildYearlyCategory(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const { year } = toYearMonth(record.date);
    const key = `${year}-${record.productCategory}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += record.quantity;
      existing.revenue += record.totalAmount;
      return;
    }

    grouped.set(key, {
      year,
      productCategory: record.productCategory,
      quantity: record.quantity,
      revenue: record.totalAmount,
    });
  });

  return [...grouped.values()].sort(sortYearly);
}

export function buildForecastInputs(monthlyCategory) {
  const categoryMap = new Map();

  monthlyCategory.forEach((row) => {
    const list = categoryMap.get(row.productCategory) ?? [];
    list.push(row);
    categoryMap.set(row.productCategory, list);
  });

  const inputs = [];

  categoryMap.forEach((rows, productCategory) => {
    const sortedRows = [...rows].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    if (sortedRows.length < 3) return;

    const latest = sortedRows[sortedRows.length - 1];
    const lag1Row = sortedRows[sortedRows.length - 1];
    const lag2Row = sortedRows[sortedRows.length - 2];
    const lag3Row = sortedRows[sortedRows.length - 3];

    let nextYear = latest.year;
    let nextMonth = latest.month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    inputs.push({
      productCategory,
      year: nextYear,
      month: nextMonth,
      lag1: lag1Row.quantity,
      lag2: lag2Row.quantity,
      rollingMean3: (lag1Row.quantity + lag2Row.quantity + lag3Row.quantity) / 3,
    });
  });

  return inputs;
}

export function buildTrendFeatures(yearlyCategory) {
  const categoryMap = new Map();

  yearlyCategory.forEach((row) => {
    const list = categoryMap.get(row.productCategory) ?? [];
    list.push(row.quantity);
    categoryMap.set(row.productCategory, list);
  });

  return [...categoryMap.entries()].map(([productCategory, quantities]) => {
    const avgQuantity = quantities.reduce((acc, item) => acc + item, 0) / quantities.length;
    const denominator = quantities.length > 1 ? quantities.length - 1 : 1;
    const variance = quantities.reduce((acc, item) => acc + (item - avgQuantity) ** 2, 0) / denominator;
    return {
      productCategory,
      avgQuantity,
      volatility: Math.sqrt(variance),
    };
  });
}

export function buildMonthlySalesSeries(monthlyCategory) {
  const grouped = new Map();

  monthlyCategory.forEach((row) => {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    grouped.set(key, (grouped.get(key) ?? 0) + row.revenue);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, value]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        name: `${MONTH_NAMES[month - 1]} ${String(year).slice(-2)}`,
        value: Number(value.toFixed(2)),
      };
    });
}

export function buildYearlySalesSeries(yearlyCategory) {
  const grouped = new Map();

  yearlyCategory.forEach((row) => {
    grouped.set(row.year, (grouped.get(row.year) ?? 0) + row.revenue);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({ name: String(year), value: Number(value.toFixed(2)) }));
}

export function buildWeeklySalesSeries(monthlyCategory) {
  const latestMonth = monthlyCategory.reduce((acc, row) => {
    if (!acc) return row;
    if (row.year > acc.year) return row;
    if (row.year === acc.year && row.month > acc.month) return row;
    return acc;
  }, null);

  const latestMonthRevenue = monthlyCategory
    .filter((row) => latestMonth && row.year === latestMonth.year && row.month === latestMonth.month)
    .reduce((sum, row) => sum + row.revenue, 0);

  const distribution = [0.12, 0.13, 0.13, 0.14, 0.16, 0.2, 0.12];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return days.map((day, index) => ({
    day,
    sales: Number((latestMonthRevenue * distribution[index]).toFixed(2)),
  }));
}

export function buildSalesByCategory(monthlyCategory) {
  const latestYear = monthlyCategory.reduce((acc, row) => Math.max(acc, row.year), 0);
  const grouped = new Map();

  monthlyCategory
    .filter((row) => row.year === latestYear)
    .forEach((row) => grouped.set(row.productCategory, (grouped.get(row.productCategory) ?? 0) + row.revenue));

  const total = [...grouped.values()].reduce((acc, value) => acc + value, 0);

  return [...grouped.entries()]
    .map(([category, sales]) => ({
      category,
      sales: Number(sales.toFixed(2)),
      percentage: total > 0 ? Math.round((sales / total) * 100) : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}
