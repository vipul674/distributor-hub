import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    productCode: { type: String, trim: true, default: null },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, min: 0, default: null },
    warehouse: { type: String, trim: true, default: null },
    damagedQty: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["in-stock", "low-stock"], required: true },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
