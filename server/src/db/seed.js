import { Product } from "../models/Product.js";
import { Bill } from "../models/Bill.js";
import { seedProducts, seedRecentBills } from "../data/seedCatalog.js";

export async function seedIfEmpty() {
  const productCount = await Product.estimatedDocumentCount();
  if (productCount === 0) {
    await Product.insertMany(seedProducts, { ordered: true });
  }

  const billCount = await Bill.estimatedDocumentCount();
  if (billCount === 0) {
    await Bill.insertMany(seedRecentBills, { ordered: true });
  }
}

