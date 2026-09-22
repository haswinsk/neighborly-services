import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { BarChart3, Users, DollarSign, Star, TrendingUp } from "lucide-react";

const monthlyRevenue = [
  { month: "Mar", revenue: 245000, bookings: 156, avgOrder: 1570 },
  { month: "Apr", revenue: 312000, bookings: 198, avgOrder: 1575 },
  { month: "May", revenue: 385000, bookings: 234, avgOrder: 1645 },
  { month: "Jun", revenue: 428000, bookings: 287, avgOrder: 1491 },
  { month: "Jul", revenue: 512000, bookings: 342, avgOrder: 1497 },
  { month: "Aug", revenue: 568000, bookings: 389, avgOrder: 1460 },
];

const categoryRevenue = [
  { category: "AC Repair", value: 185000, color: "#ef4444" },
  { category: "Plumbing", value: 142000, color: "#3b82f6" },
  { category: "Electrical", value: 98000, color: "#f59e0b" },
  { category: "Carpentry", value: 76000, color: "#8b5cf6" },
  { category: "Others", value: 67000, color: "#6b7280" },
];

const AdminAnalyticsPage = () => {
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalBookings = monthlyRevenue.reduce((sum, m) => sum + m.bookings, 0);
  const avgOrderValue = totalRevenue / totalBookings;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform performance, revenue trends, and growth metrics.
          </p>
        </div>

        {/* Top Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">Total Revenue (6M)</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-muted-foreground">Total Bookings</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{totalBookings}</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium text-muted-foreground">Avg Order Value</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">₹{Math.round(avgOrderValue)}</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">MoM Growth</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">+10.9%</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Revenue */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
            <div className="h-[260px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ category, value }) => `${category}: ₹${(value/1000).toFixed(0)}k`}
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Booking Trend */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Booking Volume</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="bookings" stroke="#22c55e" strokeWidth={3} dot={{ r: 5, fill: '#22c55e' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics Table */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Month</th>
                  <th className="text-right py-3 px-2 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-2 font-semibold">Bookings</th>
                  <th className="text-right py-3 px-2 font-semibold">Avg Order</th>
                  <th className="text-right py-3 px-2 font-semibold">Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((row, idx) => {
                  const prevRevenue = idx > 0 ? monthlyRevenue[idx - 1].revenue : row.revenue;
                  const growth = ((row.revenue - prevRevenue) / prevRevenue * 100).toFixed(1);
                  return (
                    <tr key={row.month} className="border-b hover:bg-accent">
                      <td className="py-3 px-2 font-medium">{row.month}</td>
                      <td className="py-3 px-2 text-right font-semibold">₹{row.revenue.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right">{row.bookings}</td>
                      <td className="py-3 px-2 text-right">₹{row.avgOrder}</td>
                      <td className="py-3 px-2 text-right">
                        {idx > 0 && (
                          <span className={parseFloat(growth) > 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                            {parseFloat(growth) > 0 ? "+" : ""}{growth}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
