import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, CheckCircle, Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await apiRequest<{ bookings: Booking[] }>("/bookings");
        setMyBookings(response.bookings);
      } catch {
        setMyBookings([]);
      }
    };

    loadBookings();
  }, []);

  const activeBookings = myBookings.filter((b) => b.status !== "Completed" && b.status !== "Rejected");
  const completedBookings = myBookings.filter((b) => b.status === "Completed");

  return (
    <DashboardLayout>
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="mt-2 text-muted-foreground">Here&apos;s an overview of your recent bookings</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Bookings" value={myBookings.length} icon={Calendar} />
        <StatCard title="Active Services" value={activeBookings.length} icon={Clock} />
        <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
      </div>

      <div className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent Bookings</h2>
            <p className="text-sm text-muted-foreground mt-1">Track your service requests</p>
          </div>
          <Link to="/customer/bookings">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View All</Button>
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {myBookings.length > 0 ? (
            myBookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border bg-white p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{b.serviceName}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">by {b.providerName} • {b.bookingDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground whitespace-nowrap">₹{b.price}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-slate-50 p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No bookings yet. Start exploring services!</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to book more services?</h3>
        <p className="text-muted-foreground mb-4">Browse our verified professionals and get things done today.</p>
        <Link to="/services">
          <Button className="gap-2"><Search className="h-4 w-4" /> Browse Services</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
