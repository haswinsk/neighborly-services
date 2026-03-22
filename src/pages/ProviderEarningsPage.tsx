import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { mockBookings } from "@/data/mockData";
import { DollarSign, TrendingUp, CheckCircle } from "lucide-react";

const ProviderEarningsPage = () => {
  const myBookings = mockBookings.filter((b) => b.providerId === "p1");
  const completed = myBookings.filter((b) => b.status === "Completed");
  const totalEarnings = completed.reduce((sum, b) => sum + b.price, 0);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
      <p className="mt-1 text-muted-foreground">Track your income and completed jobs</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Earnings" value={`₹${totalEarnings}`} icon={DollarSign} />
        <StatCard title="Completed Jobs" value={completed.length} icon={CheckCircle} />
        <StatCard title="Avg per Job" value={`₹${completed.length ? Math.round(totalEarnings / completed.length) : 0}`} icon={TrendingUp} />
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
              <span className="text-lg font-bold text-success">₹{b.price}</span>
            </div>
          ))}
          {completed.length === 0 && <p className="text-muted-foreground">No completed jobs yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderEarningsPage;
