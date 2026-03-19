import { describe, expect, it } from "vitest";
import { Buffer } from "node:buffer";
import { parseBillFiles } from "../../server/src/services/billParser.js";

describe("parseBillFiles", () => {
  it("preserves transaction fields and calendar dates for legacy sales CSV uploads", () => {
    const csv = [
      "Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount",
      "1,2023-11-24,CUST001,Male,34,Beauty,3,50,150",
      "2,2023-02-27,CUST002,Female,26,Clothing,2,500,1000",
    ].join("\n");

    const records = parseBillFiles([
      {
        originalname: "retail_sales_dataset.csv",
        buffer: Buffer.from(csv, "utf8"),
      },
    ]);

    expect(records).toEqual([
      {
        sourceFile: "retail_sales_dataset.csv",
        transactionId: "1",
        customerId: "CUST001",
        customerName: null,
        date: "2023-11-24T00:00:00.000Z",
        productId: null,
        productName: null,
        productCategory: "Beauty",
        supplier: null,
        quantity: 3,
        unitSalePrice: 50,
        costPrice: null,
        totalAmount: 150,
        currentStockQty: null,
        reorderLevel: null,
        stockStatus: null,
        damagedQty: 0,
        expiryDate: null,
        warehouse: null,
      },
      {
        sourceFile: "retail_sales_dataset.csv",
        transactionId: "2",
        customerId: "CUST002",
        customerName: null,
        date: "2023-02-27T00:00:00.000Z",
        productId: null,
        productName: null,
        productCategory: "Clothing",
        supplier: null,
        quantity: 2,
        unitSalePrice: 500,
        costPrice: null,
        totalAmount: 1000,
        currentStockQty: null,
        reorderLevel: null,
        stockStatus: null,
        damagedQty: 0,
        expiryDate: null,
        warehouse: null,
      },
    ]);
  });

  it("parses the enriched whole-site CSV format and derives stock status", () => {
    const csv = [
      "Transaction ID,Date,Customer ID,Customer Name,Product ID,Product Name,Product Category,Supplier,Quantity,Unit Sale Price,Cost Price,Total Amount,Current Stock Qty,Reorder Level,Stock Status,Damaged Qty,Expiry Date,Warehouse",
      "1001,2023-12-13,CUST009,Ravi Traders,SKU-ELEC-001,USB Fast Charger,Electronics,Tech Solutions,2,300,220,600,92,20,in-stock,0,,Hyderabad Warehouse",
      "1002,2023-12-14,CUST010,Asha Stores,SKU-BEA-010,Face Serum,Beauty,Glow Labs,1,450,250,,8,10,in-stock,2,2024-06-30,Secunderabad Warehouse",
    ].join("\n");

    const records = parseBillFiles([
      {
        originalname: "enriched_catalog.csv",
        buffer: Buffer.from(csv, "utf8"),
      },
    ]);

    expect(records).toEqual([
      {
        sourceFile: "enriched_catalog.csv",
        transactionId: "1001",
        customerId: "CUST009",
        customerName: "Ravi Traders",
        date: "2023-12-13T00:00:00.000Z",
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
        stockStatus: "in-stock",
        damagedQty: 0,
        expiryDate: null,
        warehouse: "Hyderabad Warehouse",
      },
      {
        sourceFile: "enriched_catalog.csv",
        transactionId: "1002",
        customerId: "CUST010",
        customerName: "Asha Stores",
        date: "2023-12-14T00:00:00.000Z",
        productId: "SKU-BEA-010",
        productName: "Face Serum",
        productCategory: "Beauty",
        supplier: "Glow Labs",
        quantity: 1,
        unitSalePrice: 450,
        costPrice: 250,
        totalAmount: 450,
        currentStockQty: 8,
        reorderLevel: 10,
        stockStatus: "low-stock",
        damagedQty: 2,
        expiryDate: "2024-06-30T00:00:00.000Z",
        warehouse: "Secunderabad Warehouse",
      },
    ]);
  });

  it("rejects partial enriched files that are missing required catalog columns", () => {
    const csv = [
      "Transaction ID,Date,Customer ID,Product ID,Product Name,Product Category,Supplier,Quantity,Unit Sale Price,Cost Price,Total Amount,Current Stock Qty",
      "1001,2023-12-13,CUST009,SKU-ELEC-001,USB Fast Charger,Electronics,Tech Solutions,2,300,220,600,92",
    ].join("\n");

    expect(() =>
      parseBillFiles([
        {
          originalname: "broken_enriched_catalog.csv",
          buffer: Buffer.from(csv, "utf8"),
        },
      ])
    ).toThrow("missing required columns: Reorder Level");
  });
});
