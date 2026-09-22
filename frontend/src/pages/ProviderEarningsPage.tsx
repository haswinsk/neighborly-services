import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { DollarSign, TrendingUp, CheckCircle, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { formatPrice } from "@/components/customer/CustomerUI";

const ProviderEarningsPage = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [adminCommissionRate, setAdminCommissionRate] = useState(0);
  const [grossEarnings, setGrossEarnings] = useState(0);
  const [adminCommissionTotal, setAdminCommissionTotal] = useState(0);
  const [netEarnings, setNetEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const completed = myBookings.filter((b) => b.status === "Completed");
  const today = new Date().toDateString();
  const todayCompleted = completed.filter(b => b.createdAt && new Date(b.createdAt).toDateString() === today);
  const todayEarnings = todayCompleted.reduce((sum, b) => sum + b.price, 0);
  const todayNet = todayEarnings - (todayEarnings * adminCommissionRate) / 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
          <p className="mt-1 text-muted-foreground">Track your income after admin commission</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Today's Stats */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Today's Performance</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  <p className="text-2xl font-bold text-foreground">{todayCompleted.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gross Earnings</p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(todayEarnings)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Earnings</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(todayNet)}</p>
                </div>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Gross Earnings" value={formatPrice(grossEarnings)} icon={DollarSign} />
              <StatCard title="Completed Jobs" value={completed.length} icon={CheckCircle} />
              <StatCard title={`Admin Commission (${adminCommissionRate}%)`} value={formatPrice(adminCommissionTotal)} icon={TrendingUp} />
              <StatCard title="Net Earnings" value={formatPrice(netEarnings)} icon={DollarSign} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard title="Avg Gross per Job" value={formatPrice(completed.length ? Math.round(grossEarnings / completed.length) : 0)} icon={ArrowUpRight} />
              <StatCard title="Avg Net per Job" value={formatPrice(completed.length ? Math.round(netEarnings / completed.length) : 0)} icon={ArrowDownRight} />
            </div>

            {/* Transaction History */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Transaction History</h2>
              <div className="space-y-3">
                {completed.map((b) => {
                  const gross = b.price;
                  const commission = (gross * adminCommissionRate) / 100;
                  const net = gross - commission;
                  return (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{b.serviceName}</p>
                        <p className="text-sm text-muted-foreground">{b.customerName} · {b.bookingDate}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-muted-foreground">Gross: {formatPrice(gross)}</p>
                        <p className="text-sm font-semibold text-green-600">Net: {formatPrice(net)}</p>
                      </div>
                    </div>
                  );
                })}
                {completed.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No completed jobs yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderEarningsPage;
