import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingStatus, Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { MiniMap, LocationBadge } from "@/components/MiniMap";
import { MapPin, User, Calendar, IndianRupee } from "lucide-react";

const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    apiRequest<{ bookings: Booking[] }>("/bookings")
      .then((res) => setBookings(res.bookings))
      .catch(() => setBookings([]));
  }, []);

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? response.booking : b)));
      toast({ title: `Booking ${status.toLowerCase()}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update booking";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground">Booking Requests</h1>
      <p className="mt-1 text-muted-foreground">Manage incoming booking requests and track customer locations</p>

      <div className="mt-6 space-y-4">
        {bookings.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground text-sm">
            No booking requests yet.
          </div>
        )}

        {bookings.map((b) => {
          const hasCustomerCoords = !!(b.customerLatitude && b.customerLongitude);

          return (
            <div key={b.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* ── Booking Info ── */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground text-base">{b.serviceName}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        {b.customerName}
                        {b.customerCity && (
                          <span className="text-gray-400">· {b.customerCity}</span>
                        )}
                      </div>
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

                  {/* ── Customer Location ── */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-green-500" />
                      Customer Location
                    </p>
                    {hasCustomerCoords ? (
                      <MiniMap
                        height={150}
                        pins={[
                          {
                            latitude: b.customerLatitude!,
                            longitude: b.customerLongitude!,
                            label: `${b.customerName}${b.customerCity ? ` · ${b.customerCity}` : ''}`,
                            type: 'customer',
                          },
                        ]}
                      />
                    ) : (
                      <LocationBadge label="Customer location not set" />
                    )}
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                  {b.status === "Requested" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(b.id, "Accepted")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "Rejected")}>
                        Reject
                      </Button>
                    </>
                  )}
                  {b.status === "Accepted" && (
                    <Button size="sm" onClick={() => updateStatus(b.id, "In Progress")}>
                      Start Job
                    </Button>
                  )}
                  {b.status === "In Progress" && (
                    <Button size="sm" onClick={() => updateStatus(b.id, "CompletionRequested")}>
                      Request Completion
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

export default ProviderBookingsPage;
