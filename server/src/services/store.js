import { generateSeedBills } from "../data/seedBills.js";
import { seedProducts, seedRecentBills } from "../data/seedCatalog.js";

export class DataStore {
  constructor() {
    this.seedBills = generateSeedBills();
    this.uploadedBills = [];
    this.version = 1;
    this.snapshotCache = null;

    this.products = seedProducts.map((p) => ({ ...p }));
    this.recentBills = seedRecentBills.map((b) => ({ ...b }));
  }

  getAllBills() {
    return [...this.seedBills, ...this.uploadedBills];
  }

  getUploadCount() {
    return this.uploadedBills.length;
  }

  addUploadedBills(records) {
    this.uploadedBills.push(...records);
    this.version += 1;
    this.snapshotCache = null;
  }

  async getOrBuildSnapshot(builder) {
    if (this.snapshotCache && this.snapshotCache.version === this.version) {
      return this.snapshotCache.snapshot;
    }

    const snapshot = await builder(this.getAllBills());
    this.snapshotCache = {
      version: this.version,
      snapshot,
    };

    return snapshot;
  }

  getProducts() {
    return this.products.map((p) => ({ ...p }));
  }

  addProduct(product) {
    const nextId = this.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const created = { ...product, id: nextId };
    this.products.push(created);
    return created;
  }

  updateProduct(id, updates) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...updates, id };
    return this.products[index];
  }

  deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  getRecentBills() {
    return this.recentBills.map((b) => ({ ...b }));
  }

  addManualBill(bill) {
    const created = { ...bill };
    this.recentBills.unshift(created);
    this.recentBills = this.recentBills.slice(0, 20);
    return created;
  }
}
