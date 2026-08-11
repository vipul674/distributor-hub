import { seedProducts, seedRecentBills } from "../data/seedCatalog.js";
import { generateSeedBills, seedDamagedProducts } from "../data/seedBills.js";
import { buildDamagedProductsFromCatalog, buildDamagedProductsFromRecords, mergeDamagedProducts } from "./damagedProducts.js";
import { getCatalogMode } from "./productCatalog.js";

function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

function sortBillsByDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function buildRecentBillsFromRecords(records) {
  const grouped = new Map();

  records.forEach((record, index) => {
    const transactionId = record.transactionId || `${record.sourceFile}-${index + 1}`;
    const existing = grouped.get(transactionId);

    if (existing) {
      existing.amount += record.totalAmount;
      existing.items += record.quantity;
      return;
    }

    grouped.set(transactionId, {
      id: transactionId,
      customer: record.customerName || record.customerId || "Imported customer",
      amount: record.totalAmount,
      date: record.date.slice(0, 10),
      items: record.quantity,
    });
  });

  return [...grouped.values()].sort(sortBillsByDateDesc).slice(0, 20);
}

function inferStatus(stockQty, reorderLevel = 20) {
  return Number(stockQty) <= Number(reorderLevel) ? "low-stock" : "in-stock";
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function getUserKey(userId) {
  return userId ? String(userId) : "__global__";
}

export class DataStore {
  constructor({ useDemoData = true } = {}) {
    this.seedBills = useDemoData ? generateSeedBills() : [];
    this.products = cloneItems(useDemoData ? seedProducts : []);
    this.defaultRecentBills = cloneItems(useDemoData ? seedRecentBills : []);
    this.damagedProducts = cloneItems(useDemoData ? seedDamagedProducts : []);
    this.users = [];
    this.nextProductId = this.products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
    this.nextUserId = 1;
    this.userData = new Map();
  }

  getUserState(userId) {
    const key = getUserKey(userId);
    if (!this.userData.has(key)) {
      this.userData.set(key, {
        uploadedBills: [],
        uploadedRecentBills: [],
        uploadedDamagedProducts: [],
        manualRecentBills: [],
        uploadCatalogMode: "limited",
        version: 1,
        snapshotCache: null,
      });
    }
    return this.userData.get(key);
  }

  getAllBills(userId) {
    const state = this.getUserState(userId);
    if (state.uploadedBills.length > 0) {
      return cloneItems(state.uploadedBills);
    }

    return cloneItems(this.seedBills);
  }

  getUploadCount(userId) {
    return this.getUserState(userId).uploadedBills.length;
  }

  setUploadedBills(records, userId) {
    const state = this.getUserState(userId);
    state.uploadedBills = cloneItems(records);
    state.uploadedRecentBills = buildRecentBillsFromRecords(records);
    state.uploadedDamagedProducts = buildDamagedProductsFromRecords(records);
    state.uploadCatalogMode = getCatalogMode(records);
    state.version += 1;
    state.snapshotCache = null;
  }

  hasUploadedBills(userId) {
    return this.getUserState(userId).uploadedBills.length > 0;
  }

  getProducts() {
    return cloneItems(this.products).sort((a, b) => a.id - b.id);
  }

  createProduct(payload) {
    const reorderLevel = payload.reorderLevel ?? null;
    const product = {
      id: this.nextProductId++,
      productCode: payload.productCode ?? null,
      name: payload.name,
      category: payload.category,
      supplier: payload.supplier,
      costPrice: Number(payload.costPrice),
      sellingPrice: Number(payload.sellingPrice),
      stockQty: Number(payload.stockQty),
      reorderLevel,
      warehouse: payload.warehouse ?? null,
      damagedQty: Number(payload.damagedQty ?? 0),
      status: payload.status ?? inferStatus(payload.stockQty, reorderLevel ?? 20),
    };

    this.products.push(product);
    return { ...product };
  }

  updateProduct(id, payload) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) {
      return null;
    }

    const current = this.products[index];
    const next = {
      ...current,
      ...Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)),
    };

    next.costPrice = Number(next.costPrice);
    next.sellingPrice = Number(next.sellingPrice);
    next.stockQty = Number(next.stockQty);
    next.reorderLevel = next.reorderLevel === null || next.reorderLevel === undefined ? null : Number(next.reorderLevel);
    next.damagedQty = Number(next.damagedQty ?? 0);

    if (payload.status === undefined && (payload.stockQty !== undefined || payload.reorderLevel !== undefined)) {
      next.status = inferStatus(next.stockQty, next.reorderLevel ?? 20);
    }

    this.products[index] = next;
    return { ...next };
  }

  deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) {
      return false;
    }

    this.products.splice(index, 1);
    return true;
  }

  getRecentBills(userId) {
    const state = this.getUserState(userId);
    const recentBills = state.uploadedRecentBills.length > 0
      ? [...state.manualRecentBills, ...state.uploadedRecentBills]
      : [...state.manualRecentBills, ...this.defaultRecentBills];

    const deduped = [];
    const seen = new Set();

    recentBills
      .sort(sortBillsByDateDesc)
      .forEach((bill) => {
        if (seen.has(bill.id)) {
          return;
        }

        seen.add(bill.id);
        deduped.push({ ...bill });
      });

    return deduped.slice(0, 20);
  }

  getUploadedRecentBills(userId) {
    return cloneItems(this.getUserState(userId).uploadedRecentBills);
  }

  createManualBill(payload, userId) {
    const state = this.getUserState(userId);
    const existingBills = [...state.manualRecentBills, ...this.defaultRecentBills, ...state.uploadedRecentBills];
    if (existingBills.some((bill) => bill.id === payload.id)) {
      const error = new Error("Bill already exists");
      error.code = 11000;
      throw error;
    }

    const bill = {
      id: payload.id,
      customer: payload.customer,
      amount: Number(payload.amount),
      date: payload.date,
      items: Number(payload.items),
    };

    state.manualRecentBills.unshift(bill);
    return { ...bill };
  }

  getDamagedProducts(userId) {
    const state = this.getUserState(userId);
    const baseDamagedProducts = state.uploadedBills.length > 0
      ? state.uploadedDamagedProducts
      : this.damagedProducts;
    const manualDamagedProducts = buildDamagedProductsFromCatalog(
      this.products.map((product) => ({ ...product, source: "manual" }))
    );

    return mergeDamagedProducts(baseDamagedProducts, manualDamagedProducts);
  }

  getUploadCatalogMode(userId) {
    return this.getUserState(userId).uploadCatalogMode;
  }

  findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return this.users.find((user) => user.email === normalizedEmail) ?? null;
  }

  createUser({ name, email, passwordHash }) {
    const user = {
      id: String(this.nextUserId++),
      name: name ? String(name).trim() : null,
      email: normalizeEmail(email),
      passwordHash,
    };

    this.users.push(user);
    return { ...user };
  }

  findUserById(id) {
    return this.users.find((user) => user.id === String(id)) ?? null;
  }

  async getOrBuildSnapshot(builder, userId) {
    const state = this.getUserState(userId);
    if (state.snapshotCache && state.snapshotCache.version === state.version) {
      return state.snapshotCache.snapshot;
    }

    const snapshot = await builder(this.getAllBills(userId));
    state.snapshotCache = {
      version: state.version,
      snapshot,
    };

    return snapshot;
  }
}
