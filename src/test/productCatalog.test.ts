import { describe, expect, it } from "vitest";
import { buildUploadedCatalog, mergeProductsWithSalesCatalog } from "../../server/src/services/productCatalog.js";

describe("mergeProductsWithSalesCatalog", () => {
  it("prefers uploaded product rows when the enriched CSV contains full catalog fields", () => {
    const records = [
      {
        transactionId: "1001",
        productId: "SKU-ELEC-001",
        productName: "USB Fast Charger",
        productCategory: "Electronics",
        supplier: "Tech Solutions",
        quantity: 2,
        unitSalePrice: 300,
        costPrice: 220,
        totalAmount: 600,
        currentStockQty: 92,
        reorderLevel: 20,
        damagedQty: 0,
        warehouse: "Hyderabad Warehouse",
        date: "2023-12-13T00:00:00.000Z",
        sourceFile: "enriched.csv",
      },
      {
        transactionId: "1002",
        productId: "SKU-ELEC-001",
        productName: "USB Fast Charger",
        productCategory: "Electronics",
        supplier: "Tech Solutions",
        quantity: 1,
        unitSalePrice: 300,
        costPrice: 220,
        totalAmount: 300,
        currentStockQty: 88,
        reorderLevel: 20,
        damagedQty: 1,
        warehouse: "Hyderabad Warehouse",
        date: "2023-12-14T00:00:00.000Z",
        sourceFile: "enriched.csv",
      },
    ];

    expect(buildUploadedCatalog(records)).toEqual([
      {
        id: 2000001,
        productCode: "SKU-ELEC-001",
        name: "USB Fast Charger",
        category: "Electronics",
        supplier: "Tech Solutions",
        costPrice: 220,
        sellingPrice: 300,
        stockQty: 88,
        reorderLevel: 20,
        status: "in-stock",
        warehouse: "Hyderabad Warehouse",
        damagedQty: 1,
        source: "uploaded",
      },
    ]);
  });

  it("adds sales-derived stock rows for uploaded categories that do not have manual products", () => {
    const products = [
      {
        id: 11,
        name: "Snack Shelf",
        category: "Snacks",
        supplier: "Manual Supplier",
        costPrice: 90,
        sellingPrice: 100,
        stockQty: 30,
        status: "in-stock",
      },
    ];

    const records = [
      {
        productCategory: "Beauty",
        quantity: 3,
        totalAmount: 150,
        date: "2023-12-24T00:00:00.000Z",
      },
      {
        productCategory: "Beauty",
        quantity: 2,
        totalAmount: 100,
        date: "2023-12-15T00:00:00.000Z",
      },
      {
        productCategory: "Clothing",
        quantity: 4,
        totalAmount: 800,
        date: "2023-12-05T00:00:00.000Z",
      },
      {
        productCategory: "Clothing",
        quantity: 2,
        totalAmount: 400,
        date: "2024-01-02T00:00:00.000Z",
      },
    ];

    expect(mergeProductsWithSalesCatalog(products, records)).toEqual([
      {
        id: 1000001,
        productCode: null,
        name: "Beauty Inventory Plan",
        category: "Beauty",
        supplier: "Uploaded sales dataset",
        costPrice: 29,
        sellingPrice: 50,
        stockQty: 5,
        reorderLevel: 20,
        status: "low-stock",
        warehouse: null,
        damagedQty: 0,
        source: "sales-derived",
      },
      {
        id: 1000002,
        productCode: null,
        name: "Clothing Inventory Plan",
        category: "Clothing",
        supplier: "Uploaded sales dataset",
        costPrice: 104,
        sellingPrice: 200,
        stockQty: 4,
        reorderLevel: 20,
        status: "low-stock",
        warehouse: null,
        damagedQty: 0,
        source: "sales-derived",
      },
      {
        id: 11,
        productCode: null,
        name: "Snack Shelf",
        category: "Snacks",
        supplier: "Manual Supplier",
        costPrice: 90,
        sellingPrice: 100,
        stockQty: 30,
        reorderLevel: null,
        status: "in-stock",
        warehouse: null,
        damagedQty: 0,
        source: "manual",
      },
    ]);
  });
});
