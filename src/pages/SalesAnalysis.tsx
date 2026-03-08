import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { salesByCategory, weeklySalesData, recentBills } from "@/assets/fakeData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = [
  "hsl(280, 60%, 35%)", "hsl(280, 55%, 45%)", "hsl(280, 50%, 55%)",
  "hsl(280, 45%, 65%)", "hsl(280, 40%, 75%)", "hsl(280, 35%, 85%)",
];

const SalesAnalysis = () => {
  return (
    <DashboardLayout>
      <DashboardHeader userName="Sahith" />

      <h1 className="text-2xl font-bold text-foreground mb-6">Sales Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Sales Chart */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Weekly Sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySalesData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {weeklySalesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Sales by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByCategory} dataKey="sales" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, percentage }) => `${category} ${percentage}%`}>
                  {salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Category Breakdown</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesByCategory.map((cat) => (
              <TableRow key={cat.category}>
                <TableCell className="font-medium text-card-foreground">{cat.category}</TableCell>
                <TableCell>₹{cat.sales.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${cat.percentage}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{cat.percentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Transactions</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium text-primary">{bill.id}</TableCell>
                <TableCell className="text-card-foreground">{bill.customer}</TableCell>
                <TableCell className="text-muted-foreground">{bill.items}</TableCell>
                <TableCell className="font-medium">₹{bill.amount.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{bill.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default SalesAnalysis;
