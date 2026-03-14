import { generateSeedBills } from "../data/seedBills.js";
import { AnalyticsSnapshot, BillRecord } from "../types.js";

export class DataStore {
  private readonly seedBills: BillRecord[];
  private uploadedBills: BillRecord[];
  private version: number;
  private snapshotCache: { version: number; snapshot: AnalyticsSnapshot } | null;

  constructor() {
    this.seedBills = generateSeedBills();
    this.uploadedBills = [];
    this.version = 1;
    this.snapshotCache = null;
  }

  public getAllBills(): BillRecord[] {
    return [...this.seedBills, ...this.uploadedBills];
  }

  public getUploadCount(): number {
    return this.uploadedBills.length;
  }

  public addUploadedBills(records: BillRecord[]): void {
    this.uploadedBills.push(...records);
    this.version += 1;
    this.snapshotCache = null;
  }

  public async getOrBuildSnapshot(builder: (records: BillRecord[]) => Promise<AnalyticsSnapshot>): Promise<AnalyticsSnapshot> {
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
