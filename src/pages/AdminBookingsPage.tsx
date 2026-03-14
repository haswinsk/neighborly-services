import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { mockBookings } from "@/data/mockData";

const AdminBookingsPage = () => (
  <DashboardLayout>
    <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
    <p className="mt-1 text-muted-foreground">View all platform bookings</p>

    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="pb-3 font-medium">Service</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Provider</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Price</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {mockBookings.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="py-4 font-medium text-foreground">{b.serviceName}</td>
              <td className="py-4 text-muted-foreground">{b.customerName}</td>
              <td className="py-4 text-muted-foreground">{b.providerName}</td>
              <td className="py-4 text-muted-foreground">{b.bookingDate}</td>
              <td className="py-4 font-semibold text-foreground">${b.price}</td>
              <td className="py-4"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </DashboardLayout>
);

export default AdminBookingsPage;
