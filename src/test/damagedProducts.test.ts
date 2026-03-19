import { describe, expect, it } from "vitest";
import {
  buildDamagedProductsFromCatalog,
  buildDamagedProductsFromRecords,
  mergeDamagedProducts,
} from "../../server/src/services/damagedProducts.js";

describe("damagedProducts helpers", () => {
  it("aggregates uploaded record damage by product and keeps the latest report date", () => {
    const damagedProducts = buildDamagedProductsFromRecords([
      {
        productId: "SKU-ELEC-001",
        productName: "USB Fast Charger",
        productCategory: "Electronics",
        supplier: "Tech Solutions",
        damagedQty: 2,
        warehouse: "Hyderabad Warehouse",
        date: "2024-01-10T00:00:00.000Z",
      },
      {
        productId: "SKU-ELEC-001",
        productName: "USB Fast Charger",
        productCategory: "Electronics",
        supplier: "Tech Solutions",
        damagedQty: 1,
        warehouse: "Hyderabad Warehouse",
        date: "2024-01-15T00:00:00.000Z",
      },
    ]);

    expect(damagedProducts).toEqual([
      {
        id: "SKU-ELEC-001",
        productCode: "SKU-ELEC-001",
        name: "USB Fast Charger",
        category: "Electronics",
        quantity: 3,
        reason: "Reported in uploaded dataset",
        date: "2024-01-15",
        supplier: "Tech Solutions",
        warehouse: "Hyderabad Warehouse",
        source: "uploaded",
      },
    ]);
  });

  it("prefers manual catalog damage over duplicate uploaded rows while preserving other uploaded items", () => {
    const uploadedDamage = buildDamagedProductsFromRecords([
      {
        productId: "SKU-ELEC-001",
        productName: "USB Fast Charger",
        productCategory: "Electronics",
        supplier: "Tech Solutions",
        damagedQty: 2,
        warehouse: "Hyderabad Warehouse",
        date: "2024-01-10T00:00:00.000Z",
      },
      {
        productId: "SKU-BEA-002",
        productName: "Face Serum",
        productCategory: "Beauty",
        supplier: "Glow Labs",
        damagedQty: 1,
        warehouse: "Beauty Hub",
        date: "2024-01-12T00:00:00.000Z",
      },
    ]);
    const manualDamage = buildDamagedProductsFromCatalog([
      {
        id: 7,
        productCode: "SKU-ELEC-001",
        name: "USB Fast Charger",
        category: "Electronics",
        supplier: "Tech Solutions",
        warehouse: "Main Warehouse",
        damagedQty: 5,
        source: "manual",
        updatedAt: "2024-01-20T00:00:00.000Z",
      },
    ]);

    expect(mergeDamagedProducts(uploadedDamage, manualDamage)).toEqual([
      {
        id: "SKU-ELEC-001",
        productCode: "SKU-ELEC-001",
        name: "USB Fast Charger",
        category: "Electronics",
        quantity: 5,
        reason: "Marked in stock management",
        date: "2024-01-20",
        supplier: "Tech Solutions",
        warehouse: "Main Warehouse",
        source: "manual",
      },
      {
        id: "SKU-BEA-002",
        productCode: "SKU-BEA-002",
        name: "Face Serum",
        category: "Beauty",
        quantity: 1,
        reason: "Reported in uploaded dataset",
        date: "2024-01-12",
        supplier: "Glow Labs",
        warehouse: "Beauty Hub",
        source: "uploaded",
      },
    ]);
  });
});
