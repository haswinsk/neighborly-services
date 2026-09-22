import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BookingStatusTimeline } from "@/components/BookingStatusTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, MapPin, Clock, AlertTriangle, ArrowLeft, User, Star, Loader2 } from "lucide-react";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MiniMap, LocationBadge } from "@/components/MiniMap";
import { formatPrice } from "@/components/customer/CustomerUI";

const BookingTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!id) return;
      
      try {
        const res = await apiRequest<{ bookings: Booking[] }>("/bookings");
        const foundBooking = res.bookings.find((b) => b.id === id);
        
        if (!foundBooking) {
          setError("Booking not found");
        } else {
          setBooking(foundBooking);
        }
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const completePayment = async () => {
    if (!booking) return;
    try {
      const response = await apiRequest<{ booking: Booking }>(`/bookings/${booking.id}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "Completed" }),
      });
      setBooking(response.booking);
      toast({ title: "Payment completed. Contact details unlocked." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not complete payment";
      toast({ title: "Payment failed", description: message, variant: "destructive" });
    }
  };

  const isRoadsideService = booking?.serviceName === "Bike Puncture" ||
    booking?.serviceName === "Car Puncture" ||
    booking?.serviceName === "Battery Jump Start" ||
    booking?.serviceName === "Fuel Assistance" ||
    booking?.serviceName === "Breakdown Repair" ||
    booking?.serviceName === "Towing";

  const isActive = booking?.status !== "Completed" && booking?.status !== "Rejected";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error || "Booking not found"}</p>
          <Link to="/customer/bookings">
            <Button>Back to My Bookings</Button>
          </Link>
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
              {isRoadsideService ? "Roadside Assistance" : "Service Booking"}
            </h1>
            <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
          </div>
        </div>

        {/* Active Booking Banner */}
        {isActive && isRoadsideService && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-orange-900">Help is on the way!</h2>
                <p className="text-sm text-orange-700">Your roadside assistance is being processed</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Information */}
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
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

            {/* Provider Information */}
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Provider Information</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{booking.providerName}</p>
                  {booking.providerLocation && (
                    <p className="text-sm text-muted-foreground">{booking.providerLocation}</p>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="flex gap-3 pt-4 border-t">
                  {booking.providerPhone && (
                    <Button variant="outline" className="flex-1 gap-2">
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              )}
            </div>

            {/* Location Information */}
            {(booking.customerLatitude || booking.providerLatitude || booking.providerLocation) && (
              <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
                {user?.role === "customer" && booking.providerLatitude && booking.providerLongitude ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Provider location from the existing booking API</span>
                    </div>
                    <MiniMap
                      height={220}
                      pins={[{ latitude: booking.providerLatitude, longitude: booking.providerLongitude, label: booking.providerName, type: "user" }]}
                    />
                  </div>
                ) : user?.role === "customer" ? (
                  <LocationBadge label={booking.providerLocation || "Provider location will appear when available"} />
                ) : null}
                {user?.role === "provider" && booking.customerLatitude && booking.customerLongitude && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Customer is located at {booking.customerCity || "your destination"}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Status Timeline */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
              <BookingStatusTimeline currentStatus={booking.status} />
            </div>

            {/* Payment Status */}
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment</h2>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-semibold ${
                  booking.paymentStatus === "Completed" ? "text-green-600" : "text-orange-600"
                }`}>
                  {booking.paymentStatus}
                </span>
              </div>
              {booking.paymentStatus === "Pending" && booking.status === "CompletionRequested" && (
                <Button className="w-full mt-4" size="sm" onClick={completePayment}>
                  Complete Payment
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
              <div className="space-y-2">
                <Link to="/customer/bookings">
                  <Button variant="outline" className="w-full">
                    View All Bookings
                  </Button>
                </Link>
                {isActive && user?.role === "customer" && (
                  <Link to="/services">
                    <Button variant="outline" className="w-full">
                      Book Another Service
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingTrackingPage;
