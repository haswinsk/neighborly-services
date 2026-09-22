import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Phone,
  MessageSquare,
  Navigation,
  Clock
} from "lucide-react";
import { MiniMap, LocationBadge } from "@/components/MiniMap";
import { formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

const ProviderRequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!id) return;
      
      try {
        const res = await apiRequest<{ bookings: Booking[] }>("/bookings");
        const foundBooking = res.bookings.find((b) => b.id === id);
        
        if (!foundBooking) {
          setError("Request not found");
        } else {
          setBooking(foundBooking);
        }
      } catch (err) {
        console.error("Failed to load request:", err);
        setError("Failed to load request details");
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const updateStatus = async (status: BookingStatus) => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBooking(response.booking);
      
      const label = status === "Accepted" ? "accepted" : status === "Rejected" ? "rejected" : "updated";
      toast({ title: `Request ${label}` });
      
      // Navigate to appropriate page based on status
      if (status === "Accepted" || status === "On The Way") {
        navigate("/provider/active");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update request";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const isEmergency = booking ? isRoadsideCategory(booking.serviceName) : false;
  const hasCustomerCoords = !!(booking?.customerLatitude && booking?.customerLongitude);
  const isRequested = booking?.status === "Requested";
  const isActive = booking?.status === "Accepted" || 
                   booking?.status === "On The Way" || 
                   booking?.status === "Arrived" || 
                   booking?.status === "In Progress";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Clock className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error || "Request not found"}</p>
          <Button onClick={() => navigate("/provider/requests")}>Back to Requests</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEmergency ? "Emergency Request" : "Service Request"}
            </h1>
            <p className="text-sm text-muted-foreground">Request ID: {booking.id}</p>
          </div>
        </div>

        {/* Emergency Banner */}
        {isEmergency && isRequested && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-orange-900">Emergency Assistance Request</h2>
                <p className="text-sm text-orange-700">Customer needs immediate help</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Service Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold text-foreground">{booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Date</p>
                  <p className="font-semibold text-foreground">{booking.bookingDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">{formatPrice(booking.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={booking.status} />
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
                  <p className="font-semibold text-foreground">{booking.customerName}</p>
                  {booking.customerCity && (
                    <p className="text-sm text-muted-foreground">{booking.customerCity}</p>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              )}
            </div>

            {/* Location Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
              {hasCustomerCoords ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Customer location captured</span>
                  </div>
                  <MiniMap
                    height={220}
                    pins={[
                      {
                        latitude: booking.customerLatitude!,
                        longitude: booking.customerLongitude!,
                        label: booking.customerName,
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
              <BookingStatusTimeline currentStatus={booking.status} />
            </div>

            {/* Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
              <div className="space-y-2">
                {booking.status === "Requested" && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => updateStatus("Accepted")}
                      disabled={isUpdating}
                      variant={isEmergency ? "default" : "default"}
                      style={isEmergency ? { backgroundColor: "#ea580c", color: "white" } : undefined}
                    >
                      {isUpdating ? "Processing..." : isEmergency ? "Accept Emergency" : "Accept Request"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => updateStatus("Rejected")}
                      disabled={isUpdating}
                    >
                      Reject Request
                    </Button>
                  </>
                )}
                {booking.status === "Accepted" && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => updateStatus("On The Way")}
                    disabled={isUpdating}
                  >
                    <Navigation className="w-4 h-4" />
                    {isUpdating ? "Processing..." : "Start Navigation"}
                  </Button>
                )}
                {booking.status === "On The Way" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("Arrived")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Processing..." : "Mark Arrived"}
                  </Button>
                )}
                {booking.status === "Arrived" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("In Progress")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Processing..." : "Start Service"}
                  </Button>
                )}
                {booking.status === "In Progress" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("CompletionRequested")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Processing..." : "Request Completion"}
                  </Button>
                )}
                {booking.status === "CompletionRequested" && (
                  <div className="text-center text-sm text-muted-foreground">
                    Waiting for customer to complete payment
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/provider/requests")}
                >
                  View All Requests
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderRequestDetailsPage;
