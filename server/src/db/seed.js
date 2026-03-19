import { seedProducts, seedRecentBills } from "../data/seedCatalog.js";
import { Bill } from "../models/Bill.js";
import { Product } from "../models/Product.js";

export async function seedIfEmpty() {
  const [productCount, billCount] = await Promise.all([Product.countDocuments(), Bill.countDocuments()]);

  const tasks = [];

  if (productCount === 0) {
    tasks.push(Product.insertMany(seedProducts));
  }

  if (billCount === 0) {
    tasks.push(Bill.insertMany(seedRecentBills));
  }

  await Promise.all(tasks);
}
