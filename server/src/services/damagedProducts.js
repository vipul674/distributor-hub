const DAMAGE_SOURCE_PRIORITY = {
  manual: 3,
  uploaded: 2,
  "sales-derived": 1,
  seed: 0,
};

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function normalizeDamageKey(item) {
  if (item.productCode) {
    return String(item.productCode).trim().toLowerCase();
  }

  if (item.id !== null && item.id !== undefined) {
    return String(item.id).trim().toLowerCase();
  }

  return `${String(item.category ?? "").trim().toLowerCase()}::${String(item.name ?? "").trim().toLowerCase()}`;
}

function compareDamagedProducts(a, b) {
  const dateA = a.date ? Date.parse(a.date) : 0;
  const dateB = b.date ? Date.parse(b.date) : 0;
  if (dateA !== dateB) {
    return dateB - dateA;
  }

  return String(a.name).localeCompare(String(b.name));
}

function normalizeDamagedProduct(item) {
  return {
    id: item.id,
    productCode: item.productCode ?? null,
    name: item.name,
    category: item.category,
    quantity: Number(item.quantity ?? 0),
    reason: item.reason ?? "Damage reported",
    date: normalizeDate(item.date),
    supplier: item.supplier ?? null,
    warehouse: item.warehouse ?? null,
    source: item.source ?? "manual",
  };
}

export function buildDamagedProductsFromRecords(records) {
  const grouped = new Map();

  records.forEach((record, index) => {
    const damagedQty = Number(record.damagedQty ?? 0);
    if (damagedQty <= 0) {
      return;
    }

    const key = record.productId || record.productName || `${record.productCategory}-${index + 1}`;
    const normalizedDate = normalizeDate(record.date);
    const existing = grouped.get(key) ?? {
      id: key,
      productCode: record.productId ?? null,
      name: record.productName || `${record.productCategory} Inventory Item`,
      category: record.productCategory,
      quantity: 0,
      reason: "Reported in uploaded dataset",
      date: normalizedDate,
      supplier: record.supplier ?? null,
      warehouse: record.warehouse ?? null,
      source: record.productId || record.productName ? "uploaded" : "sales-derived",
    };

    existing.quantity += damagedQty;

    const currentDateValue = existing.date ? Date.parse(existing.date) : 0;
    const nextDateValue = normalizedDate ? Date.parse(normalizedDate) : 0;
    if (nextDateValue > currentDateValue) {
      existing.date = normalizedDate;
      existing.supplier = record.supplier ?? existing.supplier;
      existing.warehouse = record.warehouse ?? existing.warehouse;
      existing.productCode = record.productId ?? existing.productCode;
    }

    grouped.set(key, existing);
  });

  return [...grouped.values()].sort(compareDamagedProducts);
}

export function buildDamagedProductsFromCatalog(products, { reason } = {}) {
  return products
    .filter((product) => Number(product.damagedQty ?? 0) > 0)
    .map((product) => ({
      id: product.productCode || product.id,
      productCode: product.productCode ?? null,
      name: product.name,
      category: product.category,
      quantity: Number(product.damagedQty ?? 0),
      reason: reason ?? "Marked in stock management",
      date: normalizeDate(product.updatedAt ?? product.createdAt),
      supplier: product.supplier ?? null,
      warehouse: product.warehouse ?? null,
      source: product.source ?? "manual",
    }))
    .sort(compareDamagedProducts);
}

export function mergeDamagedProducts(...groups) {
  const merged = new Map();

  groups.flat().forEach((rawItem) => {
    const item = normalizeDamagedProduct(rawItem);
    if (item.quantity <= 0) {
      return;
    }

    const key = normalizeDamageKey(item);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, item);
      return;
    }

    const existingPriority = DAMAGE_SOURCE_PRIORITY[existing.source] ?? 0;
    const nextPriority = DAMAGE_SOURCE_PRIORITY[item.source] ?? 0;

    if (nextPriority > existingPriority) {
      merged.set(key, item);
      return;
    }

    if (nextPriority < existingPriority) {
      return;
    }

    const existingDate = existing.date ? Date.parse(existing.date) : 0;
    const nextDate = item.date ? Date.parse(item.date) : 0;
    const latest = nextDate >= existingDate ? item : existing;

    merged.set(key, {
      ...latest,
      quantity: existing.quantity + item.quantity,
      supplier: latest.supplier ?? existing.supplier ?? item.supplier ?? null,
      warehouse: latest.warehouse ?? existing.warehouse ?? item.warehouse ?? null,
      productCode: latest.productCode ?? existing.productCode ?? item.productCode ?? null,
    });
  });

  return [...merged.values()].sort(compareDamagedProducts);
}
