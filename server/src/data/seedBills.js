const CATEGORIES = ["Beverages", "Snacks", "Groceries", "Personal Care", "Health", "Electronics"];

const BASE_QUANTITY = {
  Beverages: 140,
  Snacks: 125,
  Groceries: 110,
  "Personal Care": 90,
  Health: 82,
  Electronics: 60,
};

const PRICE_PER_UNIT = {
  Beverages: 34,
  Snacks: 29,
  Groceries: 38,
  "Personal Care": 56,
  Health: 64,
  Electronics: 120,
};

const GROWTH_FACTOR = {
  Beverages: 1.035,
  Snacks: 1.02,
  Groceries: 1.015,
  "Personal Care": 1.03,
  Health: 1.025,
  Electronics: 0.992,
};

const MONTHLY_SEASONAL = [0.88, 0.9, 0.95, 1.0, 1.06, 1.1, 1.16, 1.14, 1.05, 1.0, 0.96, 1.2];

function round2(value) {
  return Number(value.toFixed(2));
}

export function generateSeedBills() {
  const startYear = 2023;
  const endYear = 2025;
  const records = [];

  for (let year = startYear; year <= endYear; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      CATEGORIES.forEach((category) => {
        const yearOffset = year - startYear;
        const trendFactor = Math.pow(GROWTH_FACTOR[category], yearOffset * 12 + (month - 1));
        const seasonal = MONTHLY_SEASONAL[month - 1];
        const quantity = Math.max(25, Math.round(BASE_QUANTITY[category] * trendFactor * seasonal));
        const totalAmount = round2(quantity * PRICE_PER_UNIT[category]);

        records.push({
          sourceFile: "seed-dataset",
          date: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
          productCategory: category,
          quantity,
          totalAmount,
        });
      });
    }
  }

  return records;
}

export const seedDamagedProducts = [
  { id: 1, name: "Cracked Bottles", category: "Beverages", quantity: 6, reason: "Transit breakage", date: "2025-12-08" },
  { id: 2, name: "Expired Snack Packs", category: "Snacks", quantity: 8, reason: "Expired inventory", date: "2025-12-06" },
  { id: 3, name: "Torn Rice Bags", category: "Groceries", quantity: 4, reason: "Storage handling", date: "2025-12-05" },
  { id: 4, name: "Leaking Sanitizers", category: "Health", quantity: 3, reason: "Packaging defect", date: "2025-12-03" },
];
