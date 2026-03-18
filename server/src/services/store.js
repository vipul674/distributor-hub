export class DataStore {
  constructor() {
    this.seedBills = [];
    this.uploadedBills = [];
    this.version = 1;
    this.snapshotCache = null;
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
}
