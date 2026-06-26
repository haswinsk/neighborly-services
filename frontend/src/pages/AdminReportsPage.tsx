import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Calendar, TrendingUp, Users, Wallet, BookOpen } from "lucide-react";

const AdminReportsPage = () => {
  const [reportData, setReportData] = useState<{
    totalUsers: number;
    activeProviders: number;
    totalBookings: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  }>({
    totalUsers: 0,
    activeProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });

  const [monthlyData, setMonthlyData] = useState<{ month: string; bookings: number; revenue: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        // Simulating API response
        setReportData({
          totalUsers: 342,
          activeProviders: 87,
          totalBookings: 1294,
          totalRevenue: 485200,
          averageOrderValue: 375,
          conversionRate: 42.5,
        });

        setMonthlyData([
          { month: "Jan", bookings: 145, revenue: 54300 },
          { month: "Feb", bookings: 168, revenue: 63000 },
          { month: "Mar", bookings: 192, revenue: 72000 },
          { month: "Apr", bookings: 187, revenue: 70125 },
          { month: "May", bookings: 215, revenue: 80625 },
          { month: "Jun", bookings: 387, revenue: 145150 },
        ]);

        setCategoryData([
          { category: "Plumbing", count: 287 },
          { category: "Electrical", count: 312 },
          { category: "Cleaning", count: 198 },
          { category: "Carpentry", count: 187 },
          { category: "Gardening", count: 154 },
          { category: "Other", count: 176 },
        ]);
      } catch {
        console.error("Failed to load reports");
      }
    };

    loadReports();
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const exportReport = async (format: "csv" | "pdf") => {
    try {
      // Simulate export
      console.log(`Exporting report as ${format}`);
      const element = document.createElement("a");
      const file = new Blob([`Platform Report - ${new Date().toLocaleDateString()}`], {
        type: "text/plain",
      });
      element.href = URL.createObjectURL(file);
      element.download = `platform-report.${format === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Reports</h1>
            <p className="mt-1 text-muted-foreground">Comprehensive statistics and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport("csv")}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport("pdf")}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={reportData.totalUsers}
            icon={Users}
            trend={{ value: 12, direction: "up" }}
          />
          <StatCard
            title="Active Providers"
            value={reportData.activeProviders}
            icon={TrendingUp}
            trend={{ value: 8, direction: "up" }}
          />
          <StatCard
            title="Total Bookings"
            value={reportData.totalBookings}
            icon={BookOpen}
            trend={{ value: 23, direction: "up" }}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${reportData.totalRevenue}`}
            icon={Wallet}
            trend={{ value: 18, direction: "up" }}
          />
          <StatCard
            title="Avg Order Value"
            value={`₹${reportData.averageOrderValue}`}
            icon={Calendar}
          />
          <StatCard
            title="Conversion Rate"
            value={`${reportData.conversionRate}%`}
            icon={TrendingUp}
            trend={{ value: 5, direction: "up" }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Trends */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" yAxisId="left" />
                <YAxis stroke="#6b7280" yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Bookings"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings by Category */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bookings by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Bar dataKey="count" fill="#3b82f6" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Service Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, count }) => {
                  return `${category}: ${count}`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Service Category Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-accent">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Bookings</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Avg Value</th>
                  <th className="px-4 py-3 font-medium text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((row) => (
                  <tr key={row.category} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{row.category}</td>
                    <td className="px-4 py-3 text-right">{row.count}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                      ₹{(row.count * 375).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">₹375</td>
                    <td className="px-4 py-3 text-right">
                      {((row.count / reportData.totalBookings) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReportsPage;
