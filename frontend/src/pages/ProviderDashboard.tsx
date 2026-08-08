import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, ClipboardList, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Booking, Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);

  useEffect(() => {
    if (user?.approved === false) {
      setMyBookings([]);
      setMyServices([]);
      return;
    }

    const loadData = async () => {
      try {
        const [bookingsResponse, servicesResponse] = await Promise.all([
          apiRequest<{ bookings: Booking[] }>("/bookings"),
          apiRequest<{ services: Service[] }>("/services"),
        ]);

        setMyBookings(bookingsResponse.bookings);
        setMyServices(servicesResponse.services.filter((service) => service.providerId === user?.id));
      } catch {
        setMyBookings([]);
        setMyServices([]);
      }
    };

    loadData();
  }, [user?.id, user?.approved]);

  const completed = myBookings.filter((b) => b.status === "Completed");
  const earnings = completed.reduce((sum, b) => sum + b.price, 0);
  const pending = myBookings.filter((b) => b.status === "Requested");

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Manage your services and bookings</p>

      {user?.approved === false && (
        <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-5">
          <h2 className="text-lg font-semibold text-foreground">Pending Admin Approval</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your provider account is under review. You can access services, bookings, and earnings after admin approval.
          </p>
        </div>
      )}

      {user?.approved === false ? null : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Earnings" value={`₹${earnings}`} icon={DollarSign} />
            <StatCard title="Active Services" value={myServices.length} icon={Star} />
            <StatCard title="Pending Requests" value={pending.length} icon={ClipboardList} />
            <StatCard title="Completed Jobs" value={completed.length} icon={CheckCircle} />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Requests</h2>
              <Link to="/provider/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
            <div className="mt-4 space-y-3">
              {myBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">{b.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{b.customerName} · {b.bookingDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">₹{b.price}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ProviderDashboard;
