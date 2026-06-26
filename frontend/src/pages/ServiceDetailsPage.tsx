import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StarRating } from "@/components/StarRating";
import { Header } from "@/components/Header";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProviderBadge } from "@/components/ProviderBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceImage } from "@/data/serviceImages";
import { Review, Service } from "@/types";
import { apiRequest } from "@/lib/api";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [bookingDate, setBookingDate] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const serviceResponse = await apiRequest<{ service: Service }>(`/services/${id}`);
        setService(serviceResponse.service);

        const reviewsResponse = await apiRequest<{ reviews: Review[] }>(`/reviews/provider/${serviceResponse.service.providerId}`);
        setReviews(reviewsResponse.reviews);
      } catch {
        setService(null);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-4 text-muted-foreground">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!bookingDate) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }
    try {
      await apiRequest<{ booking: unknown }>("/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId: service.id, bookingDate }),
      });

      toast({ title: "Booking Confirmed!", description: `Your booking for ${service.serviceName} on ${bookingDate} has been submitted.` });
      setShowBooking(false);
      navigate("/customer/bookings");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create booking";
      toast({ title: "Booking failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden">
              <img src={getServiceImage(service.category)} alt={service.serviceName} className="h-48 w-full object-cover lg:h-64" />
              <div className="absolute top-3 right-3">
                <FavoriteButton serviceId={service.id} />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-primary">{service.category}</span>
                  <h1 className="mt-1 text-3xl font-bold text-foreground">{service.serviceName}</h1>
                  <p className="mt-1 text-muted-foreground">by {service.providerName}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{service.providerLocation}</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                  <StarRating rating={service.rating} />
                  <span className="text-sm text-muted-foreground">({service.reviewCount} reviews)</span>
                </div>
                <ProviderBadge rating={service.rating} reviewCount={service.reviewCount} />
              </div>
              <p className="mt-6 text-foreground leading-relaxed">{service.description}</p>
            </div>

            {/* Reviews */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground">Reviews</h2>
              <div className="mt-4 space-y-4">
                {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.customerName}</span>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <StarRating rating={r.rating} size={14} />
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border bg-gradient-to-br from-white to-gray-50 p-6 shadow-elevated card-hover">
              <div className="text-center mb-6">
                <div className="inline-block bg-primary/10 px-3 py-1 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary">PRICING</span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-foreground">₹{service.price}</span>
                  <span className="text-sm text-muted-foreground"> / service</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Verified Professional</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Fast & Reliable</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">24/7 Support</span>
                </div>
              </div>

              {!showBooking ? (
                <Button 
                  className="w-full h-11 gap-2 shadow-md hover:shadow-lg transition-smooth" 
                  onClick={() => setShowBooking(true)}
                >
                  <Calendar className="h-4 w-4" /> 
                  Book Now
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">Select Date</Label>
                    <Input 
                      type="date" 
                      className="mt-2 input-modern" 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full h-11 shadow-md hover:shadow-lg transition-smooth" 
                    onClick={handleBook}
                  >
                    Confirm Booking
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-11" 
                    onClick={() => setShowBooking(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your booking is secure and you can cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
