import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";

const ProviderEarningsPage = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [adminCommissionRate, setAdminCommissionRate] = useState(0);
  const [grossEarnings, setGrossEarnings] = useState(0);
  const [adminCommissionTotal, setAdminCommissionTotal] = useState(0);
  const [netEarnings, setNetEarnings] = useState(0);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const [bookingsResponse, summaryResponse] = await Promise.all([
          apiRequest<{ bookings: Booking[] }>("/bookings"),
          apiRequest<{
            grossEarnings: number;
            adminCommissionRate: number;
            adminCommissionTotal: number;
            netEarnings: number;
            completedJobsCount: number;
          }>("/bookings/earnings/summary"),
        ]);

        setMyBookings(bookingsResponse.bookings);
        setAdminCommissionRate(summaryResponse.adminCommissionRate);
        setGrossEarnings(summaryResponse.grossEarnings);
        setAdminCommissionTotal(summaryResponse.adminCommissionTotal);
        setNetEarnings(summaryResponse.netEarnings);
      } catch {
        setMyBookings([]);
        setAdminCommissionRate(0);
        setGrossEarnings(0);
        setAdminCommissionTotal(0);
        setNetEarnings(0);
      }
    };

    loadBookings();
  }, []);

  const completed = myBookings.filter((b) => b.status === "Completed");

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
      <p className="mt-1 text-muted-foreground">Track your income after admin commission</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Gross Earnings" value={`₹${grossEarnings}`} icon={DollarSign} />
        <StatCard title="Completed Jobs" value={completed.length} icon={CheckCircle} />
        <StatCard title={`Admin Commission (${adminCommissionRate}%)`} value={`₹${adminCommissionTotal}`} icon={TrendingUp} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard title="Net Earnings" value={`₹${netEarnings}`} icon={DollarSign} />
        <StatCard title="Avg Net per Job" value={`₹${completed.length ? Math.round(netEarnings / completed.length) : 0}`} icon={TrendingUp} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Completed Jobs</h2>
        <div className="mt-4 space-y-3">
          {completed.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">{b.customerName} · {b.bookingDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Gross ₹{b.price}</p>
                <p className="text-lg font-bold text-success">Net ₹{Math.round(b.price - (b.price * adminCommissionRate) / 100)}</p>
              </div>
            </div>
          ))}
          {completed.length === 0 && <p className="text-muted-foreground">No completed jobs yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderEarningsPage;
