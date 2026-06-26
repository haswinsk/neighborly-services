import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CustomerBookingsPage = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      const response = await apiRequest<{ bookings: Booking[] }>("/bookings");
      setMyBookings(response.bookings);
    } catch {
      setMyBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const confirmCompletion = async (bookingId: string) => {
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Completed" }),
      });

      setMyBookings((prev) => prev.map((booking) => (booking.id === bookingId ? response.booking : booking)));
      await loadBookings();

      toast({ title: "Work marked as completed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update booking";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  const completePayment = async (bookingId: string) => {
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${bookingId}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "Completed" }),
      });

      setMyBookings((prev) => prev.map((booking) => (booking.id === bookingId ? response.booking : booking)));
      await loadBookings();

      toast({ title: "Payment completed. Contact details unlocked." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete payment";
      toast({ title: "Payment failed", description: message, variant: "destructive" });
    }
  };

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
              {b.paymentStatus === "Completed" && (b.providerPhone || b.providerEmail || b.providerLocation) && (
                <div className="mt-2 rounded-md border bg-background p-3 text-sm">
                  <p className="font-medium text-foreground">Provider Contact Details</p>
                  {b.providerPhone && <p className="text-muted-foreground">Phone: {b.providerPhone}</p>}
                  {b.providerEmail && <p className="text-muted-foreground">Email: {b.providerEmail}</p>}
                  {b.providerLocation && <p className="text-muted-foreground">Location: {b.providerLocation}</p>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {(b.status === "Accepted" || b.status === "In Progress") && (
                <Button size="sm" onClick={() => confirmCompletion(b.id)}>
                  Confirm Completed
                </Button>
              )}
              {b.status === "Completed" && b.paymentStatus === "Pending" && (
                <Button size="sm" onClick={() => completePayment(b.id)}>
                  Complete Payment
                </Button>
              )}
              <span className="text-lg font-bold text-foreground">₹{b.price}</span>
              <StatusBadge status={b.status} />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CustomerBookingsPage;
