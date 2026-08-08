import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await apiRequest<{ bookings: Booking[] }>("/bookings");
        setBookings(response.bookings);
      } catch {
        setBookings([]);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.serviceName.toLowerCase().includes(query) ||
          b.customerName.toLowerCase().includes(query) ||
          b.providerName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchQuery, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
          <p className="mt-1 text-muted-foreground">View and manage all platform bookings</p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by service, customer, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus:outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
            </div>
            {(["all", "pending", "completed", "cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-foreground hover:bg-accent/80"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-accent">
                <th className="px-4 py-3 font-medium text-foreground">Service</th>
                <th className="px-4 py-3 font-medium text-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-foreground">Provider</th>
                <th className="px-4 py-3 font-medium text-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-foreground">Price</th>
                <th className="px-4 py-3 font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{b.serviceName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.providerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.bookingDate}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">₹{b.price}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookingsPage;
