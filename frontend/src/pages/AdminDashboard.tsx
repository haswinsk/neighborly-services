import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, Calendar, Wrench, DollarSign, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [adminCommissionRate, setAdminCommissionRate] = useState(0);
  const [adminCommissionTotal, setAdminCommissionTotal] = useState(0);
  const [providerPayoutTotal, setProviderPayoutTotal] = useState(0);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="mt-1 text-muted-foreground">System overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Total Users" value={usersCount} icon={Users} />
        <StatCard title="Services" value={servicesCount} icon={Wrench} />
        <StatCard title="Bookings" value={bookingsCount} icon={Calendar} />
        <StatCard title="Gross Revenue" value={`₹${totalRevenue}`} icon={DollarSign} />
        <StatCard title={`Admin Commission (${adminCommissionRate}%)`} value={`₹${adminCommissionTotal}`} icon={Wallet} />
        <StatCard title="Provider Payout" value={`₹${providerPayoutTotal}`} icon={DollarSign} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
          <Link to="/admin/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentBookings.slice(0, 4).map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">{b.customerName} → {b.providerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">₹{b.price}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
