import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Booking, BookingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { MiniMap, LocationBadge } from "@/components/MiniMap";
import { 
  MapPin, 
  User, 
  Calendar, 
  IndianRupee, 
  ClipboardList, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

function RequestSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-3 w-28 bg-muted rounded" />
        </div>
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
      <div className="h-3 w-28 bg-muted rounded mb-2" />
      <div className="h-[150px] w-full bg-muted rounded-lg" />
    </div>
  );
}

const ProviderRequestsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ bookings: Booking[] }>("/bookings");
      setBookings(res.bookings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load requests";
      setError(message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? response.booking : b)));
      
      const label = status === "Accepted" ? "accepted" : status === "Rejected" ? "rejected" : "updated";
      toast({ title: `Request ${label}` });
      
      // If accepted, navigate to active job
      if (status === "Accepted") {
        navigate("/provider/active");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update request";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  const requested = bookings.filter((b) => b.status === "Requested");
  const accepted = bookings.filter((b) => b.status === "Accepted");
  const inProgress = bookings.filter((b) => 
    b.status === "On The Way" || 
    b.status === "Arrived" || 
    b.status === "In Progress" ||
    b.status === "CompletionRequested"
  );

  return (
    <DashboardLayout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incoming Requests</h1>
          <p className="mt-1 text-muted-foreground">Manage incoming service requests from customers</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadBookings} disabled={loading} className="gap-2 shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats strip */}
      {!loading && !error && bookings.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
          <div className="rounded-lg border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 p-3 text-center">
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{requested.length}</p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">Requested</p>
          </div>
          <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{accepted.length}</p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Accepted</p>
          </div>
          <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-3 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{inProgress.length}</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">In Progress</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {/* Loading state */}
        {loading && (
          <>
            <RequestSkeleton />
            <RequestSkeleton />
            <RequestSkeleton />
          </>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-200">Failed to load requests</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={loadBookings}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-xl border bg-card p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No requests yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              When customers book your services, their requests will appear here.
            </p>
          </div>
        )}

        {/* Request cards */}
        {!loading && !error && bookings.map((b) => {
          const hasCustomerCoords = !!(b.customerLatitude && b.customerLongitude);
          const isEmergency = isRoadsideCategory(b.serviceName);
          const isRequested = b.status === "Requested";

          return (
            <div 
              key={b.id} 
              className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${
                isEmergency && isRequested ? "border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20" : "bg-card"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Request Info */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isEmergency && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            EMERGENCY
                          </span>
                        )}
                        <p className="font-semibold text-foreground text-base truncate">{b.serviceName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{b.customerName}</span>
                        {b.customerCity && (
                          <span className="text-muted-foreground/60 truncate">· {b.customerCity}</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {b.bookingDate}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {formatPrice(b.price)}
                    </span>
                  </div>

                  {/* Customer Location */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                        Customer Location
                      </p>
                      {hasCustomerCoords && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-1.5 text-xs gap-1.5"
                          onClick={() => navigate(`/provider/requests/${b.id}`)}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                    {hasCustomerCoords ? (
                      <MiniMap
                        height={160}
                        pins={[
                          {
                            latitude: b.customerLatitude!,
                            longitude: b.customerLongitude!,
                            label: `${b.customerName}${b.customerCity ? ` · ${b.customerCity}` : ""}`,
                            type: "customer",
                          },
                        ]}
                      />
                    ) : (
                      <LocationBadge label="Customer location not set — customer needs to enable location" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end shrink-0">
                  {b.status === "Requested" && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(b.id, "Accepted")}
                        className={isEmergency ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {isEmergency ? "Accept Emergency" : "Accept"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateStatus(b.id, "Rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {b.status === "Accepted" && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(b.id, "On The Way")}
                    >
                      Start Navigation
                    </Button>
                  )}
                  {b.status === "On The Way" && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(b.id, "Arrived")}
                    >
                      Mark Arrived
                    </Button>
                  )}
                  {b.status === "Arrived" && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(b.id, "In Progress")}
                    >
                      Start Service
                    </Button>
                  )}
                  {b.status === "In Progress" && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus(b.id, "CompletionRequested")}
                    >
                      Request Completion
                    </Button>
                  )}
                  {b.status === "CompletionRequested" && (
                    <div className="text-sm text-muted-foreground">
                      Waiting for customer to complete payment
                    </div>
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

export default ProviderRequestsPage;
