import path from "node:path";
import XLSX from "xlsx";

const CATEGORY_KEYS = ["product category", "product_category", "category", "productcategory"];
const QUANTITY_KEYS = ["quantity", "qty", "units"];
const AMOUNT_KEYS = ["total amount", "total_amount", "amount", "revenue", "total"];
const DATE_KEYS = ["date", "bill date", "invoice date", "transaction date", "bill_date"];
const TRANSACTION_ID_KEYS = ["transaction id", "transaction_id", "invoice id", "invoice_id", "bill id", "bill_id", "id"];
const CUSTOMER_ID_KEYS = ["customer id", "customer_id", "customer id", "customerid"];
const CUSTOMER_NAME_KEYS = ["customer name", "customer_name", "customer"];
const PRODUCT_ID_KEYS = ["product id", "product_id", "sku", "item id", "item_id"];
const PRODUCT_NAME_KEYS = ["product name", "product_name", "item name", "item_name", "name"];
const SUPPLIER_KEYS = ["supplier", "vendor", "supplier name", "supplier_name"];
const UNIT_SALE_PRICE_KEYS = ["unit sale price", "unit_sale_price", "price per unit", "unit price", "selling price", "sale price"];
const COST_PRICE_KEYS = ["cost price", "cost_price", "purchase price"];
const CURRENT_STOCK_QTY_KEYS = ["current stock qty", "current_stock_qty", "stock qty", "stock_qty", "current stock", "available stock"];
const REORDER_LEVEL_KEYS = ["reorder level", "reorder_level", "minimum stock", "min stock"];
const STOCK_STATUS_KEYS = ["stock status", "stock_status", "status"];
const DAMAGED_QTY_KEYS = ["damaged qty", "damaged_qty", "damaged quantity"];
const EXPIRY_DATE_KEYS = ["expiry date", "expiry_date", "expiration date", "expiration_date"];
const WAREHOUSE_KEYS = ["warehouse", "warehouse location", "location"];

const ENRICHED_REQUIRED_HEADERS = [
  { label: "Product ID", aliases: PRODUCT_ID_KEYS },
  { label: "Product Name", aliases: PRODUCT_NAME_KEYS },
  { label: "Supplier", aliases: SUPPLIER_KEYS },
  { label: "Unit Sale Price", aliases: UNIT_SALE_PRICE_KEYS },
  { label: "Cost Price", aliases: COST_PRICE_KEYS },
  { label: "Current Stock Qty", aliases: CURRENT_STOCK_QTY_KEYS },
  { label: "Reorder Level", aliases: REORDER_LEVEL_KEYS },
];

const ENRICHED_HINT_HEADERS = [
  PRODUCT_ID_KEYS,
  PRODUCT_NAME_KEYS,
  SUPPLIER_KEYS,
  COST_PRICE_KEYS,
  CURRENT_STOCK_QTY_KEYS,
  REORDER_LEVEL_KEYS,
  STOCK_STATUS_KEYS,
  DAMAGED_QTY_KEYS,
  EXPIRY_DATE_KEYS,
  WAREHOUSE_KEYS,
].flat().map(normalizeKey);

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeKey(key) {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toUtcIsoDate(year, month, day) {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const isLocalMidnightDate =
      value.getHours() === 0 &&
      value.getMinutes() === 0 &&
      value.getSeconds() === 0 &&
      value.getMilliseconds() === 0;
    const isUtcMidnightDate =
      value.getUTCHours() === 0 &&
      value.getUTCMinutes() === 0 &&
      value.getUTCSeconds() === 0 &&
      value.getUTCMilliseconds() === 0;

    if (isLocalMidnightDate && !isUtcMidnightDate) {
      return toUtcIsoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
    }

    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      return toUtcIsoDate(year, month, day);
    }

    const slashDateMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (slashDateMatch) {
      const [, month, day, yearPart] = slashDateMatch;
      const year = yearPart.length === 2
        ? Number(yearPart) >= 70
          ? `19${yearPart}`
          : `20${yearPart}`
        : yearPart;
      return toUtcIsoDate(year, month, day);
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function getNormalizedRowMap(row) {
  return new Map(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]));
}

function getValueByAliases(rowMap, aliases) {
  for (const alias of aliases) {
    const value = rowMap.get(normalizeKey(alias));
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function isBlankRow(row) {
  return Object.values(row).every((value) => value === null || value === undefined || String(value).trim() === "");
}

function inferStockStatus(stockQty, reorderLevel) {
  return Number(stockQty) <= Number(reorderLevel) ? "low-stock" : "in-stock";
}

function detectFileMode(headers) {
  return [...headers].some((header) => ENRICHED_HINT_HEADERS.includes(header)) ? "full" : "limited";
}

function validateHeaders(headers, fileName, mode) {
  if (mode !== "full") {
    return;
  }

  const missing = ENRICHED_REQUIRED_HEADERS
    .filter((field) => !field.aliases.some((alias) => headers.has(normalizeKey(alias))))
    .map((field) => field.label);

  if (missing.length > 0) {
    throw createValidationError(
      `${fileName} is using the enriched product format but is missing required columns: ${missing.join(", ")}.`
    );
  }
}

function mapRowToBillRecord(row, sourceFile, mode, rowNumber) {
  if (isBlankRow(row)) {
    return null;
  }

  const rowMap = getNormalizedRowMap(row);
  const rawDate = getValueByAliases(rowMap, DATE_KEYS);
  const rawCategory = getValueByAliases(rowMap, CATEGORY_KEYS);
  const rawQuantity = getValueByAliases(rowMap, QUANTITY_KEYS);
  const rawAmount = getValueByAliases(rowMap, AMOUNT_KEYS);
  const rawTransactionId = getValueByAliases(rowMap, TRANSACTION_ID_KEYS);
  const rawCustomerId = getValueByAliases(rowMap, CUSTOMER_ID_KEYS);
  const rawCustomerName = getValueByAliases(rowMap, CUSTOMER_NAME_KEYS);
  const rawProductId = getValueByAliases(rowMap, PRODUCT_ID_KEYS);
  const rawProductName = getValueByAliases(rowMap, PRODUCT_NAME_KEYS);
  const rawSupplier = getValueByAliases(rowMap, SUPPLIER_KEYS);
  const rawUnitSalePrice = getValueByAliases(rowMap, UNIT_SALE_PRICE_KEYS);
  const rawCostPrice = getValueByAliases(rowMap, COST_PRICE_KEYS);
  const rawCurrentStockQty = getValueByAliases(rowMap, CURRENT_STOCK_QTY_KEYS);
  const rawReorderLevel = getValueByAliases(rowMap, REORDER_LEVEL_KEYS);
  const rawDamagedQty = getValueByAliases(rowMap, DAMAGED_QTY_KEYS);
  const rawExpiryDate = getValueByAliases(rowMap, EXPIRY_DATE_KEYS);
  const rawWarehouse = getValueByAliases(rowMap, WAREHOUSE_KEYS);

  const parsedDate = parseDateValue(rawDate);
  if (!parsedDate) {
    throw createValidationError(`Invalid or missing Date in ${sourceFile} row ${rowNumber}.`);
  }

  const productCategory = normalizeText(rawCategory);
  if (!productCategory) {
    throw createValidationError(`Missing Product Category in ${sourceFile} row ${rowNumber}.`);
  }

  const parsedQuantity = parseNumber(rawQuantity);
  if (parsedQuantity === null || parsedQuantity <= 0) {
    throw createValidationError(`Quantity must be a positive number in ${sourceFile} row ${rowNumber}.`);
  }

  const parsedUnitSalePrice = parseNumber(rawUnitSalePrice);
  if (rawUnitSalePrice !== null && (parsedUnitSalePrice === null || parsedUnitSalePrice <= 0)) {
    throw createValidationError(`Unit Sale Price must be a positive number in ${sourceFile} row ${rowNumber}.`);
  }

  const parsedAmount = parseNumber(rawAmount);
  const computedAmount = parsedUnitSalePrice !== null ? Number((parsedQuantity * parsedUnitSalePrice).toFixed(2)) : null;
  let totalAmount = parsedAmount;

  if (mode === "full" && computedAmount === null) {
    throw createValidationError(`Unit Sale Price is required in ${sourceFile} row ${rowNumber}.`);
  }

  if (totalAmount === null) {
    totalAmount = computedAmount;
  }

  if (totalAmount === null || totalAmount <= 0) {
    throw createValidationError(`Total Amount must be a positive number in ${sourceFile} row ${rowNumber}.`);
  }

  if (computedAmount !== null && parsedAmount !== null && Math.abs(parsedAmount - computedAmount) > 0.01) {
    throw createValidationError(
      `Total Amount must equal Quantity x Unit Sale Price in ${sourceFile} row ${rowNumber}.`
    );
  }

  const productId = normalizeText(rawProductId);
  const productName = normalizeText(rawProductName);
  const supplier = normalizeText(rawSupplier);
  const customerId = normalizeText(rawCustomerId);
  const customerName = normalizeText(rawCustomerName);
  const transactionId = normalizeText(rawTransactionId);
  const costPrice = parseNumber(rawCostPrice);
  const currentStockQty = parseNumber(rawCurrentStockQty);
  const reorderLevel = parseNumber(rawReorderLevel);
  const damagedQty = parseNumber(rawDamagedQty) ?? 0;
  const expiryDate = parseDateValue(rawExpiryDate);
  const warehouse = normalizeText(rawWarehouse);

  if (mode === "full") {
    if (!customerId) {
      throw createValidationError(`Customer ID is required in ${sourceFile} row ${rowNumber}.`);
    }
    if (!productId) {
      throw createValidationError(`Product ID is required in ${sourceFile} row ${rowNumber}.`);
    }
    if (!productName) {
      throw createValidationError(`Product Name is required in ${sourceFile} row ${rowNumber}.`);
    }
    if (!supplier) {
      throw createValidationError(`Supplier is required in ${sourceFile} row ${rowNumber}.`);
    }
    if (costPrice === null || costPrice < 0) {
      throw createValidationError(`Cost Price must be zero or greater in ${sourceFile} row ${rowNumber}.`);
    }
    if (currentStockQty === null || currentStockQty < 0) {
      throw createValidationError(`Current Stock Qty must be zero or greater in ${sourceFile} row ${rowNumber}.`);
    }
    if (reorderLevel === null || reorderLevel < 0) {
      throw createValidationError(`Reorder Level must be zero or greater in ${sourceFile} row ${rowNumber}.`);
    }
  }

  if (rawCostPrice !== null && (costPrice === null || costPrice < 0)) {
    throw createValidationError(`Cost Price must be zero or greater in ${sourceFile} row ${rowNumber}.`);
  }

  if (rawCurrentStockQty !== null && (currentStockQty === null || currentStockQty < 0)) {
    throw createValidationError(`Current Stock Qty must be zero or greater in ${sourceFile} row ${rowNumber}.`);
  }

  if (rawReorderLevel !== null && (reorderLevel === null || reorderLevel < 0)) {
    throw createValidationError(`Reorder Level must be zero or greater in ${sourceFile} row ${rowNumber}.`);
  }

  if (damagedQty < 0) {
    throw createValidationError(`Damaged Qty must be zero or greater in ${sourceFile} row ${rowNumber}.`);
  }

  if (rawExpiryDate !== null && !expiryDate) {
    throw createValidationError(`Expiry Date is invalid in ${sourceFile} row ${rowNumber}.`);
  }

  const resolvedUnitSalePrice = parsedUnitSalePrice !== null
    ? Number(parsedUnitSalePrice.toFixed(2))
    : null;
  const resolvedStockStatus = currentStockQty !== null && reorderLevel !== null
    ? inferStockStatus(currentStockQty, reorderLevel)
    : null;

  return {
    sourceFile,
    transactionId,
    customerId,
    customerName,
    date: parsedDate,
    productId,
    productName,
    productCategory,
    supplier,
    quantity: parsedQuantity,
    unitSalePrice: resolvedUnitSalePrice,
    costPrice: costPrice !== null ? Number(costPrice.toFixed(2)) : null,
    totalAmount: Number(totalAmount.toFixed(2)),
    currentStockQty: currentStockQty !== null ? Number(currentStockQty) : null,
    reorderLevel: reorderLevel !== null ? Number(reorderLevel) : null,
    stockStatus: resolvedStockStatus,
    damagedQty: Number(damagedQty),
    expiryDate,
    warehouse,
  };
}

export function parseBillFiles(files) {
  const records = [];

  files.forEach((file) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isSpreadsheet = [".xlsx", ".xls", ".csv", ".txt"].includes(extension);
    if (!isSpreadsheet) return;

    const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return;

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
      defval: null,
      raw: true,
    });

    const normalizedHeaders = new Set(rows.flatMap((row) => Object.keys(row).map(normalizeKey)));
    const mode = detectFileMode(normalizedHeaders);
    validateHeaders(normalizedHeaders, file.originalname, mode);

    rows.forEach((row, index) => {
      const mapped = mapRowToBillRecord(row, file.originalname, mode, index + 2);
      if (mapped) {
        records.push(mapped);
      }
    });
  });

  return records;
}
