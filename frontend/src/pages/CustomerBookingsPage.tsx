import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MiniMap, LocationBadge } from "@/components/MiniMap";
import { MapPin, Phone, Mail, Calendar, IndianRupee } from "lucide-react";

const CustomerBookingsPage = () => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

  const loadBookings = useCallback(async () => {
    try {
      const response = await apiRequest<{ bookings: Booking[] }>("/bookings");
      setMyBookings(response.bookings);
    } catch {
      setMyBookings([]);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const confirmCompletion = async (bookingId: string) => {
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Completed" }),
      });
      setMyBookings((prev) => prev.map((b) => (b.id === bookingId ? response.booking : b)));
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
      setMyBookings((prev) => prev.map((b) => (b.id === bookingId ? response.booking : b)));
      toast({ title: "Payment completed. Contact details unlocked." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete payment";
      toast({ title: "Payment failed", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
      <p className="mt-1 text-muted-foreground">Track your service bookings and provider locations</p>

      <div className="mt-6 space-y-4">
        {myBookings.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground text-sm">
            No bookings yet.
          </div>
        )}

        {myBookings.map((b) => {
          const hasProviderCoords = !!(b.providerLatitude && b.providerLongitude);

          return (
            <div key={b.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* ── Booking Info ── */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground text-base">{b.serviceName}</p>
                      <p className="text-sm text-muted-foreground">by {b.providerName}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {b.bookingDate}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {b.price}
                    </span>
                  </div>

                  {/* ── Provider Location ── */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Provider Location
                    </p>
                    {hasProviderCoords ? (
                      <MiniMap
                        height={150}
                        pins={[
                          {
                            latitude: b.providerLatitude!,
                            longitude: b.providerLongitude!,
                            label: `${b.providerName}${b.providerLocation ? ` · ${b.providerLocation}` : ''}`,
                            type: 'user',
                          },
                        ]}
                      />
                    ) : (
                      <LocationBadge label={b.providerLocation || 'Provider location not set'} />
                    )}
                  </div>

                  {/* ── Contact details (unlocked after payment) ── */}
                  {b.paymentStatus === "Completed" &&
                    (b.providerPhone || b.providerEmail || b.providerLocation) && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-1">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                          Provider Contact Details
                        </p>
                        {b.providerPhone && (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {b.providerPhone}
                          </p>
                        )}
                        {b.providerEmail && (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {b.providerEmail}
                          </p>
                        )}
                        {b.providerLocation && (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {b.providerLocation}
                          </p>
                        )}
                      </div>
                    )}
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                  {(b.status === "Accepted" || b.status === "In Progress") && (
                    <Button size="sm" onClick={() => confirmCompletion(b.id)}>
                      Confirm Completed
                    </Button>
                  )}
                  {b.status === "CompletionRequested" && b.paymentStatus === "Pending" && (
                    <Button size="sm" onClick={() => completePayment(b.id)}>
                      Complete Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default CustomerBookingsPage;
