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

const SALES_DERIVED_ID_OFFSET = 1_000_000;
const UPLOADED_ID_OFFSET = 2_000_000;

function normalizeCategory(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getYearMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function buildMonthlyPeriods(records) {
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
      days: new Set(),
      lastObservedDay: 0,
    };

    existing.days.add(day);
    existing.lastObservedDay = Math.max(existing.lastObservedDay, day);
    grouped.set(key, existing);
  });

  return [...grouped.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((period) => ({
      key: period.key,
      year: period.year,
      month: period.month,
      dayCount: period.days.size,
      lastObservedDay: period.lastObservedDay,
    }));
}

function isLikelyPartialMonth(period) {
  return period.dayCount < 10 && period.lastObservedDay < 25;
}

function getReportingMonth(records) {
  const periods = buildMonthlyPeriods(records);
  if (periods.length === 0) {
    return null;
  }

  const latest = periods[periods.length - 1];
  if (periods.length > 1 && isLikelyPartialMonth(latest)) {
    return periods[periods.length - 2];
  }

  return latest;
}

function roundCurrency(value) {
  return Math.max(1, Math.round(value));
}

export function inferStockStatus(stockQty, reorderLevel = 20) {
  return Number(stockQty) <= Number(reorderLevel) ? "low-stock" : "in-stock";
}

function hasUploadedProductFields(record) {
  return Boolean(
    record.productId &&
    record.productName &&
    record.supplier &&
    record.unitSalePrice !== null &&
    record.unitSalePrice !== undefined &&
    record.costPrice !== null &&
    record.costPrice !== undefined &&
    record.currentStockQty !== null &&
    record.currentStockQty !== undefined &&
    record.reorderLevel !== null &&
    record.reorderLevel !== undefined
  );
}

function compareCatalogRecords(a, b) {
  const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateCompare !== 0) {
    return dateCompare;
  }

  const transactionIdA = a.transactionId ?? "";
  const transactionIdB = b.transactionId ?? "";
  const transactionCompare = transactionIdA.localeCompare(transactionIdB);
  if (transactionCompare !== 0) {
    return transactionCompare;
  }

  return (a.sourceFile ?? "").localeCompare(b.sourceFile ?? "");
}

function buildUploadedProduct(recordGroup, index) {
  const latest = [...recordGroup.records].sort(compareCatalogRecords).at(-1);
  if (!latest) {
    return null;
  }

  const stockQty = Number(latest.currentStockQty ?? 0);
  const reorderLevel = Number(latest.reorderLevel ?? 20);

  return {
    id: UPLOADED_ID_OFFSET + index + 1,
    productCode: latest.productId,
    name: latest.productName,
    category: latest.productCategory,
    supplier: latest.supplier,
    costPrice: Number(latest.costPrice ?? 0),
    sellingPrice: Number(latest.unitSalePrice ?? latest.totalAmount),
    stockQty,
    reorderLevel,
    status: inferStockStatus(stockQty, reorderLevel),
    warehouse: latest.warehouse ?? null,
    damagedQty: Number(latest.damagedQty ?? 0),
    source: "uploaded",
  };
}

function buildDerivedProduct(recordGroup, index, reportingMonth) {
  const sellingPrice = roundCurrency(recordGroup.totalRevenue / recordGroup.totalQty);
  const costRatio = CATEGORY_COST_RATIO[recordGroup.category] ?? 0.68;
  const costPrice = roundCurrency(sellingPrice * costRatio);
  const averageMonthlyQty = recordGroup.monthKeys.size > 0
    ? recordGroup.totalQty / recordGroup.monthKeys.size
    : recordGroup.totalQty;
  const estimatedStockQty = Math.max(1, Math.round(recordGroup.reportingMonthQty || averageMonthlyQty));

  return {
    id: SALES_DERIVED_ID_OFFSET + index + 1,
    productCode: null,
    name: `${recordGroup.category} Inventory Plan`,
    category: recordGroup.category,
    supplier: reportingMonth ? "Uploaded sales dataset" : "Sales-derived estimate",
    costPrice,
    sellingPrice,
    stockQty: estimatedStockQty,
    reorderLevel: 20,
    status: inferStockStatus(estimatedStockQty, 20),
    warehouse: null,
    damagedQty: 0,
    source: "sales-derived",
  };
}

export function buildUploadedCatalog(records) {
  const grouped = new Map();

  records.forEach((record) => {
    if (!hasUploadedProductFields(record)) {
      return;
    }

    const key = String(record.productId).trim().toLowerCase();
    const existing = grouped.get(key) ?? {
      productId: record.productId,
      records: [],
    };
    existing.records.push(record);
    grouped.set(key, existing);
  });

  return [...grouped.values()]
    .sort((a, b) => String(a.productId).localeCompare(String(b.productId)))
    .map((group, index) => buildUploadedProduct(group, index))
    .filter(Boolean);
}

export function getCatalogMode(records) {
  return buildUploadedCatalog(records).length > 0 ? "full" : "limited";
}

function buildDerivedCatalog(records, manualProducts) {
  const reportingMonth = getReportingMonth(records);
  const reportingMonthKey = reportingMonth ? getYearMonthKey(reportingMonth.year, reportingMonth.month) : null;
  const coveredCategories = new Set(manualProducts.map((product) => normalizeCategory(product.category)));
  const grouped = new Map();

  records.forEach((record) => {
    const normalizedCategory = normalizeCategory(record.productCategory);
    if (!normalizedCategory || coveredCategories.has(normalizedCategory)) {
      return;
    }

    const date = new Date(record.date);
    const monthKey = getYearMonthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
    const existing = grouped.get(normalizedCategory) ?? {
      category: record.productCategory,
      totalQty: 0,
      totalRevenue: 0,
      monthKeys: new Set(),
      reportingMonthQty: 0,
    };

    existing.totalQty += record.quantity;
    existing.totalRevenue += record.totalAmount;
    existing.monthKeys.add(monthKey);
    if (reportingMonthKey && monthKey === reportingMonthKey) {
      existing.reportingMonthQty += record.quantity;
    }
    grouped.set(normalizedCategory, existing);
  });

  return [...grouped.values()]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((group, index) => buildDerivedProduct(group, index, reportingMonth));
}

export function mergeProductsWithSalesCatalog(products, records) {
  const manualProducts = products.map((product) => ({
    ...product,
    productCode: product.productCode ?? null,
    reorderLevel: product.reorderLevel ?? null,
    warehouse: product.warehouse ?? null,
    damagedQty: product.damagedQty ?? 0,
    source: "manual",
  }));

  if (!records.length) {
    return manualProducts.sort((a, b) => a.id - b.id);
  }

  const uploadedProducts = buildUploadedCatalog(records);
  const derivedProducts = uploadedProducts.length === 0 ? buildDerivedCatalog(records, manualProducts) : [];

  return [...manualProducts, ...uploadedProducts, ...derivedProducts].sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) {
      return categoryCompare;
    }

    if (a.source !== b.source) {
      return a.source === "manual" ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}
