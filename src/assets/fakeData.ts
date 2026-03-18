// // Dashboard data
// export const dashboardStats = {
//   monthlySales: "$12,450",
//   stockAvailability: 320,
//   damagedStock: 23,
// };

// export const monthlySalesData = [
//   { name: "Jan", value: 45000 },
//   { name: "Feb", value: 65000 },
//   { name: "Mar", value: 15000 },
//   { name: "Apr", value: 55000 },
//   { name: "May", value: 40000 },
//   { name: "Jun", value: 50000 },
//   { name: "Jul", value: 72000 },
// ];

// export const yearlySalesData = [
//   { name: "2020", value: 350000 },
//   { name: "2021", value: 420000 },
//   { name: "2022", value: 580000 },
//   { name: "2023", value: 650000 },
//   { name: "2024", value: 720000 },
// ];

// export const stockAlerts = [
//   { id: 1, type: "low-stock" as const, message: "Low Stock: Mobile Chargers" },
//   { id: 2, type: "expiring" as const, message: "Expire Soon: Dairy Products" },
// ];

// export const demandPredictions = [
//   "Stock more Beverages and soft drinks",
//   "Increase snack inventory before weekends",
//   "Medical supplements demand rising",
//   "Personal care products trending upward",
// ];

// export const topRecommendations = [
//   { id: 1, name: "Medical Supplements", icon: "medical" as const },
//   { id: 2, name: "Snacks", icon: "snack" as const },
//   { id: 3, name: "Beverages", icon: "snack" as const },
//   { id: 4, name: "Personal Care", icon: "medical" as const },
//   { id: 5, name: "Groceries", icon: "snack" as const },
// ];

// export const businessExpansionSuggestions = [
//   "Expand to new retail location in East Zone",
//   "Add organic product line for health-conscious customers",
//   "Partner with local bakeries for fresh goods distribution",
//   "Introduce bulk-buy discounts for regular retailers",
//   "Start online ordering portal for remote customers",
// ];

// // Stock Management data
// export interface Product {
//   id: number;
//   name: string;
//   category: string;
//   supplier: string;
//   costPrice: number;
//   sellingPrice: number;
//   stockQty: number;
//   status: "in-stock" | "low-stock";
// }

// export const products: Product[] = [
//   { id: 1, name: "Premium Green Tea", category: "Beverages", supplier: "Green Beverages Ltd.", costPrice: 180, sellingPrice: 220, stockQty: 15, status: "in-stock" },
//   { id: 2, name: "Fresh Cashews", category: "Snacks", supplier: "Nutri Snacks Co.", costPrice: 100, sellingPrice: 220, stockQty: 65, status: "in-stock" },
//   { id: 3, name: "Chocolate Biscuits", category: "Snacks", supplier: "Sweet Treats Inc.", costPrice: 120, sellingPrice: 220, stockQty: 53, status: "in-stock" },
//   { id: 4, name: "Hand Sanitizer 100ml", category: "Health", supplier: "HygieneHealth Inc.", costPrice: 100, sellingPrice: 190, stockQty: 37, status: "in-stock" },
//   { id: 5, name: "Organic Honey", category: "Groceries", supplier: "Pure Foods", costPrice: 140, sellingPrice: 250, stockQty: 22, status: "low-stock" },
//   { id: 6, name: "Energy Drink", category: "Beverages", supplier: "Kingfizz Beverages", costPrice: 140, sellingPrice: 250, stockQty: 273, status: "in-stock" },
//   { id: 7, name: "Herbal Shampoo", category: "Personal Care", supplier: "Shine Personal Care", costPrice: 100, sellingPrice: 220, stockQty: 53, status: "low-stock" },
//   { id: 8, name: "Mobile Charger", category: "Electronics", supplier: "Tech Solutions", costPrice: 100, sellingPrice: 220, stockQty: 8, status: "low-stock" },
//   { id: 9, name: "Basmati Rice 5kg", category: "Groceries", supplier: "Golden Grains", costPrice: 250, sellingPrice: 350, stockQty: 120, status: "in-stock" },
//   { id: 10, name: "Face Wash", category: "Personal Care", supplier: "Shine Personal Care", costPrice: 80, sellingPrice: 150, stockQty: 45, status: "in-stock" },
// ];

// export const stockSummary = {
//   totalProducts: 320,
//   inStockItems: 285,
//   lowStockItems: 5,
//   damagedStock: 12,
// };

// export const damagedProducts = [
//   { id: 1, name: "Glass Bottles Set", category: "Kitchenware", quantity: 5, reason: "Broken during transit", date: "2024-12-15" },
//   { id: 2, name: "Expired Cans", category: "Beverages", quantity: 7, reason: "Past expiry date", date: "2024-12-10" },
//   { id: 3, name: "Torn Packaging - Rice", category: "Groceries", quantity: 3, reason: "Packaging damage", date: "2024-12-08" },
//   { id: 4, name: "Dented Tins", category: "Canned Food", quantity: 4, reason: "Warehouse mishandling", date: "2024-12-05" },
//   { id: 5, name: "Cracked Screens - Chargers", category: "Electronics", quantity: 2, reason: "Shipping damage", date: "2024-12-01" },
// ];

// export const lowStockRecommendations = [
//   { name: "Energy Drinks", restockQty: 20 },
//   { name: "Organic Snacks", restockQty: 30 },
//   { name: "Home Cleaning Products", restockQty: 30 },
// ];

// // Sales Analysis data
// export const salesByCategory = [
//   { category: "Beverages", sales: 45000, percentage: 28 },
//   { category: "Snacks", sales: 32000, percentage: 20 },
//   { category: "Groceries", sales: 28000, percentage: 17 },
//   { category: "Personal Care", sales: 22000, percentage: 14 },
//   { category: "Health", sales: 18000, percentage: 11 },
//   { category: "Electronics", sales: 15000, percentage: 10 },
// ];

// export const weeklySalesData = [
//   { day: "Mon", sales: 4500 },
//   { day: "Tue", sales: 5200 },
//   { day: "Wed", sales: 4800 },
//   { day: "Thu", sales: 6100 },
//   { day: "Fri", sales: 7200 },
//   { day: "Sat", sales: 8500 },
//   { day: "Sun", sales: 3200 },
// ];

// export const recentBills = [
//   { id: "INV-001", customer: "Rajesh Store", amount: 2450, date: "2024-12-20", items: 12 },
//   { id: "INV-002", customer: "Kumar Mart", amount: 5680, date: "2024-12-19", items: 28 },
//   { id: "INV-003", customer: "City Grocers", amount: 1230, date: "2024-12-18", items: 8 },
//   { id: "INV-004", customer: "Fresh Corner", amount: 3890, date: "2024-12-17", items: 15 },
//   { id: "INV-005", customer: "Daily Needs", amount: 4520, date: "2024-12-16", items: 22 },
// ];

// // Business Insights
// export const businessInsights = [
//   { title: "Revenue Growth", value: "+12.5%", description: "Compared to last month", trend: "up" as const },
//   { title: "Customer Retention", value: "87%", description: "Repeat customers this quarter", trend: "up" as const },
//   { title: "Average Order Value", value: "₹3,240", description: "Per transaction", trend: "up" as const },
//   { title: "Stock Turnover", value: "4.2x", description: "Monthly average", trend: "down" as const },
// ];

// export const profitMargins = [
//   { category: "Beverages", margin: 35 },
//   { category: "Snacks", margin: 42 },
//   { category: "Groceries", margin: 25 },
//   { category: "Personal Care", margin: 48 },
//   { category: "Health", margin: 38 },
//   { category: "Electronics", margin: 22 },
// ];
