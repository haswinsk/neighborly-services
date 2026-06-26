import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";

const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

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

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((booking) => (booking.id === id ? response.booking : booking)));
      toast({ title: `Booking ${status.toLowerCase()}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update booking";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Booking Requests</h1>
      <p className="mt-1 text-muted-foreground">Manage incoming booking requests</p>

      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">Customer: {b.customerName}</p>
                <p className="text-sm text-muted-foreground">Date: {b.bookingDate}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">₹{b.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status} />
                {b.status === "Requested" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(b.id, "Accepted")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "Rejected")}>Reject</Button>
                  </div>
                )}
                {b.status === "Accepted" && (
                  <Button size="sm" onClick={() => updateStatus(b.id, "In Progress")}>Start</Button>
                )}
                {b.status === "In Progress" && (
                  <Button size="sm" onClick={() => updateStatus(b.id, "Completed")}>Complete</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProviderBookingsPage;
