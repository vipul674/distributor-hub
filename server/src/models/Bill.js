import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    id: { type: String, required: true, trim: true },
    customer: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    items: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

billSchema.index({ userId: 1, id: 1 }, { unique: true });

export const Bill = mongoose.models.Bill || mongoose.model("Bill", billSchema);

