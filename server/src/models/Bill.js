import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customer: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    items: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Bill = mongoose.models.Bill || mongoose.model("Bill", billSchema);

