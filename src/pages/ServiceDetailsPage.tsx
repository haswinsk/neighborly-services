import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { mockServices, mockReviews } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceImage } from "@/data/serviceImages";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [bookingDate, setBookingDate] = useState("");
  const [showBooking, setShowBooking] = useState(false);

  const service = mockServices.find((s) => s.id === id);
  const reviews = mockReviews.filter((r) => r.providerId === service?.providerId);

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!bookingDate) {
      toast({ title: "Please select a date", variant: "destructive" });
      return;
    }
    toast({ title: "Booking Confirmed!", description: `Your booking for ${service.serviceName} on ${bookingDate} has been submitted.` });
    setShowBooking(false);
    navigate("/customer/bookings");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">LocalServ</span>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <img src={getServiceImage(service.category)} alt={service.serviceName} className="h-48 w-full rounded-lg object-cover lg:h-64" />
            <div className="mt-6">
              <span className="text-sm font-medium text-primary">{service.category}</span>
              <h1 className="mt-1 text-3xl font-bold text-foreground">{service.serviceName}</h1>
              <p className="mt-1 text-muted-foreground">by {service.providerName}</p>
              <div className="mt-4 flex items-center gap-4">
                <StarRating rating={service.rating} />
                <span className="text-sm text-muted-foreground">({service.reviewCount} reviews)</span>
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
            <div className="sticky top-8 rounded-lg border bg-card p-6 shadow-sm">
              <div className="text-center">
                <span className="text-3xl font-bold text-foreground">₹{service.price}</span>
                <span className="text-muted-foreground"> / service</span>
              </div>

              {!showBooking ? (
                <Button className="mt-6 w-full" onClick={() => setShowBooking(true)}>
                  <Calendar className="mr-2 h-4 w-4" /> Book Now
                </Button>
              ) : (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label>Select Date</Label>
                    <Input type="date" className="mt-1" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleBook}>Confirm Booking</Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowBooking(false)}>Cancel</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
