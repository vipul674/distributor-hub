import mongoose from "mongoose";

const salesRecordSchema = new mongoose.Schema(
  {
    sourceFile: { type: String, required: true, trim: true },
    transactionId: { type: String, trim: true, default: null },
    customerId: { type: String, trim: true, default: null },
    customerName: { type: String, trim: true, default: null },
    date: { type: String, required: true },
    productId: { type: String, trim: true, default: null },
    productName: { type: String, trim: true, default: null },
    productCategory: { type: String, required: true, trim: true },
    supplier: { type: String, trim: true, default: null },
    quantity: { type: Number, required: true, min: 0 },
    unitSalePrice: { type: Number, min: 0, default: null },
    costPrice: { type: Number, min: 0, default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    currentStockQty: { type: Number, min: 0, default: null },
    reorderLevel: { type: Number, min: 0, default: null },
    stockStatus: { type: String, enum: ["in-stock", "low-stock"], default: null },
    damagedQty: { type: Number, min: 0, default: 0 },
    expiryDate: { type: String, default: null },
    warehouse: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

export const SalesRecord = mongoose.models.SalesRecord || mongoose.model("SalesRecord", salesRecordSchema);
