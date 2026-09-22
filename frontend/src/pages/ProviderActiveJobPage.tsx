import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookingStatusTimeline } from "@/components/BookingStatusTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Booking, BookingStatus } from "@/types";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  User, 
  Calendar, 
  IndianRupee, 
  AlertCircle, 
  AlertTriangle, 
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  CheckCircle,
  Loader2
} from "lucide-react";
import { MiniMap, LocationBadge } from "@/components/MiniMap";
import { formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

const ProviderActiveJobPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadActiveBooking = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ bookings: Booking[] }>("/bookings");
      const active = res.bookings.find((b) => 
        b.status === "Accepted" || 
        b.status === "On The Way" || 
        b.status === "Arrived" || 
        b.status === "In Progress" ||
        b.status === "CompletionRequested"
      );
      setActiveBooking(active || null);
    } catch (err) {
      console.error("Failed to load active job:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveBooking();
  }, []);

  const updateStatus = async (status: BookingStatus) => {
    if (!activeBooking) return;
    setIsUpdating(true);
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${activeBooking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setActiveBooking(response.booking);
      
      const label = status === "On The Way" ? "on the way" : 
                    status === "Arrived" ? "arrived" : 
                    status === "In Progress" ? "started" : 
                    status === "CompletionRequested" ? "completion requested" : "updated";
      toast({ title: `Job ${label}` });
      
      // If completed, navigate to bookings
      if (status === "CompletionRequested") {
        setTimeout(() => navigate("/provider/bookings"), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update status";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const isEmergency = activeBooking ? isRoadsideCategory(activeBooking.serviceName) : false;
  const hasCustomerCoords = !!(activeBooking?.customerLatitude && activeBooking?.customerLongitude);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!activeBooking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Active Job</h2>
          <p className="text-muted-foreground mb-4">You don't have any active jobs at the moment</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/provider/requests")}>View Requests</Button>
            <Button variant="outline" onClick={() => navigate("/provider/bookings")}>View Bookings</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEmergency ? "Emergency Job" : "Active Job"}
            </h1>
            <p className="text-sm text-muted-foreground">Job ID: {activeBooking.id}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadActiveBooking} disabled={isLoading}>
            <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Emergency Banner */}
        {isEmergency && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-orange-900">Emergency Assistance</h2>
                <p className="text-sm text-orange-700">Customer needs immediate help - prioritize this job</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Service Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold text-foreground">{activeBooking.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Date</p>
                  <p className="font-semibold text-foreground">{activeBooking.bookingDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">{formatPrice(activeBooking.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={activeBooking.status} />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Customer Information</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{activeBooking.customerName}</p>
                  {activeBooking.customerCity && (
                    <p className="text-sm text-muted-foreground">{activeBooking.customerCity}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Customer Location</h2>
              {hasCustomerCoords ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Navigate to customer location</span>
                  </div>
                  <MiniMap
                    height={220}
                    pins={[
                      {
                        latitude: activeBooking.customerLatitude!,
                        longitude: activeBooking.customerLongitude!,
                        label: activeBooking.customerName,
                        type: "customer",
                      },
                    ]}
                  />
                </div>
              ) : (
                <LocationBadge label="Customer location not set" />
              )}
            </div>
          </div>

          {/* Right Column - Status Timeline & Actions */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <BookingStatusTimeline currentStatus={activeBooking.status} />
            </div>

            {/* Status Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Job Actions</h2>
              <div className="space-y-3">
                {activeBooking.status === "Accepted" && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => updateStatus("On The Way")}
                    disabled={isUpdating}
                  >
                    <Navigation className="w-4 h-4" />
                    {isUpdating ? "Processing..." : "Start Navigation"}
                  </Button>
                )}
                {activeBooking.status === "On The Way" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("Arrived")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Processing..." : "Mark Arrived"}
                  </Button>
                )}
                {activeBooking.status === "Arrived" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("In Progress")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Processing..." : "Start Service"}
                  </Button>
                )}
                {activeBooking.status === "In Progress" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("CompletionRequested")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Processing..." : "Request Completion"}
                  </Button>
                )}
                {activeBooking.status === "CompletionRequested" && (
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Waiting for customer to complete payment
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/provider/requests/${activeBooking.id}`)}
                >
                  View Full Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/provider/requests")}
                >
                  View All Requests
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/provider/bookings")}
                >
                  View Booking History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderActiveJobPage;
