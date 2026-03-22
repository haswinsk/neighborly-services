import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { mockUsers, mockBookings, mockServices } from "@/data/mockData";
import { Users, Calendar, Wrench, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const customers = mockUsers.filter((u) => u.role === "customer");
  const providers = mockUsers.filter((u) => u.role === "provider");
  const totalRevenue = mockBookings.filter((b) => b.status === "Completed").reduce((s, b) => s + b.price, 0);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="mt-1 text-muted-foreground">System overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={mockUsers.length} icon={Users} />
        <StatCard title="Services" value={mockServices.length} icon={Wrench} />
        <StatCard title="Bookings" value={mockBookings.length} icon={Calendar} />
        <StatCard title="Revenue" value={`₹${totalRevenue}`} icon={DollarSign} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
          <Link to="/admin/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="mt-4 space-y-3">
          {mockBookings.slice(0, 4).map((b) => (
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
