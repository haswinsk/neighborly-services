import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { mockBookings, mockServices } from "@/data/mockData";
import { Calendar, CheckCircle, Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const myBookings = mockBookings.filter((b) => b.customerId === "c1");
  const activeBookings = myBookings.filter((b) => b.status !== "Completed" && b.status !== "Rejected");
  const completedBookings = myBookings.filter((b) => b.status === "Completed");

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your bookings</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Bookings" value={myBookings.length} icon={Calendar} />
        <StatCard title="Active" value={activeBookings.length} icon={Clock} />
        <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
          <Link to="/customer/bookings">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {myBookings.slice(0, 3).map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">by {b.providerName} · {b.bookingDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">₹{b.price}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/services">
          <Button className="gap-2"><Search className="h-4 w-4" /> Browse Services</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
