import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["in-stock", "low-stock"], required: true },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

