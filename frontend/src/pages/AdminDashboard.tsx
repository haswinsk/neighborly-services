import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, Calendar, Wrench, DollarSign, Wallet, TrendingUp, Activity } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [adminCommissionRate, setAdminCommissionRate] = useState(0);
  const [adminCommissionTotal, setAdminCommissionTotal] = useState(0);
  const [providerPayoutTotal, setProviderPayoutTotal] = useState(0);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; commission: number }[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState<{ status: string; count: number }[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiRequest<{
          usersCount: number;
          servicesCount: number;
          bookingsCount: number;
          totalRevenue: number;
          adminCommissionRate: number;
          adminCommissionTotal: number;
          providerPayoutTotal: number;
          recentBookings: Booking[];
        }>("/admin/stats");

        setUsersCount(response.usersCount);
        setServicesCount(response.servicesCount);
        setBookingsCount(response.bookingsCount);
        setTotalRevenue(response.totalRevenue);
        setAdminCommissionRate(response.adminCommissionRate);
        setAdminCommissionTotal(response.adminCommissionTotal);
        setProviderPayoutTotal(response.providerPayoutTotal);
        setRecentBookings(response.recentBookings);

        // Generate sample revenue data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const data = months.map((month, idx) => ({
          month,
          revenue: Math.floor(Math.random() * 50000) + 20000,
          commission: Math.floor(Math.random() * 10000) + 2000,
        }));
        setRevenueData(data);

        // Generate booking status breakdown
        setBookingStatusData([
          { status: 'Completed', count: 145 },
          { status: 'Pending', count: 32 },
          { status: 'Cancelled', count: 18 },
        ]);
      } catch {
        setUsersCount(0);
        setServicesCount(0);
        setBookingsCount(0);
        setTotalRevenue(0);
        setAdminCommissionRate(0);
        setAdminCommissionTotal(0);
        setProviderPayoutTotal(0);
        setRecentBookings([]);
      }
    };

    loadStats();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Comprehensive platform analytics and management</p>
        </div>

        {/* Key Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard title="Total Users" value={usersCount} icon={Users} />
          <StatCard title="Services" value={servicesCount} icon={Wrench} />
          <StatCard title="Bookings" value={bookingsCount} icon={Calendar} />
          <StatCard title="Gross Revenue" value={`₹${totalRevenue}`} icon={DollarSign} />
          <StatCard title={`Admin Commission (${adminCommissionRate}%)`} value={`₹${adminCommissionTotal}`} icon={Wallet} />
          <StatCard title="Provider Payout" value={`₹${providerPayoutTotal}`} icon={DollarSign} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue Trend
              </h2>
              <span className="text-xs text-muted-foreground">Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2} name="Commission" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Booking Status
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Monthly Bookings</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Bookings */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
            <Link to="/admin/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {recentBookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border bg-background p-3 hover:bg-accent/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground text-sm">{b.serviceName}</p>
                  <p className="text-xs text-muted-foreground">{b.customerName} → {b.providerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">₹{b.price}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
