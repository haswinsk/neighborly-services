import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { mockBookings } from "@/data/mockData";

const CustomerBookingsPage = () => {
  const myBookings = mockBookings.filter((b) => b.customerId === "c1");

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
      <p className="mt-1 text-muted-foreground">Track all your service bookings</p>

      <div className="mt-6 space-y-3">
        {myBookings.map((b) => (
          <div key={b.id} className="flex flex-col gap-3 rounded-lg border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">{b.serviceName}</p>
              <p className="text-sm text-muted-foreground">by {b.providerName}</p>
              <p className="text-sm text-muted-foreground">{b.bookingDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-foreground">${b.price}</span>
              <StatusBadge status={b.status} />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CustomerBookingsPage;
