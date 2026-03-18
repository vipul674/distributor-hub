import path from "node:path";
import XLSX from "xlsx";

const CATEGORY_KEYS = ["product category", "product_category", "category", "productcategory"];
const QUANTITY_KEYS = ["quantity", "qty", "units"];
const AMOUNT_KEYS = ["total amount", "total_amount", "amount", "revenue", "total"];
const DATE_KEYS = ["date", "bill date", "invoice date", "transaction date", "bill_date"];

function normalizeKey(key) {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function getValueByAliases(row, aliases) {
  const normalizedMap = new Map();
  Object.entries(row).forEach(([key, value]) => normalizedMap.set(normalizeKey(key), value));

  for (const alias of aliases) {
    const value = normalizedMap.get(normalizeKey(alias));
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function mapRowToBillRecord(row, sourceFile) {
  const rawDate = getValueByAliases(row, DATE_KEYS);
  const rawCategory = getValueByAliases(row, CATEGORY_KEYS);
  const rawQuantity = getValueByAliases(row, QUANTITY_KEYS);
  const rawAmount = getValueByAliases(row, AMOUNT_KEYS);

  const parsedDate = parseDateValue(rawDate);
  const parsedQuantity = parseNumber(rawQuantity);
  const parsedAmount = parseNumber(rawAmount);
  const productCategory = typeof rawCategory === "string" ? rawCategory.trim() : "";

  if (!parsedDate || !productCategory || parsedQuantity === null || parsedAmount === null) return null;
  if (parsedQuantity <= 0 || parsedAmount <= 0) return null;

  return {
    sourceFile,
    date: parsedDate,
    productCategory,
    quantity: parsedQuantity,
    totalAmount: parsedAmount,
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
      raw: false,
    });

    rows.forEach((row) => {
      const mapped = mapRowToBillRecord(row, file.originalname);
      if (mapped) records.push(mapped);
    });
  });

  return records;
}
