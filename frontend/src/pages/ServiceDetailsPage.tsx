import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { Header } from "@/components/Header";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProviderBadge } from "@/components/ProviderBadge";
import { Button } from "@/components/ui/button";
import { Wrench, MapPin, ArrowLeft, Calendar, AlertTriangle, Clock, Shield, CheckCircle, User, Phone, MessageSquare } from "lucide-react";
import { getServiceImage } from "@/data/serviceImages";
import { Review, Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        // Load service data
        const serviceResponse = await apiRequest<{ service: Service }>(`/services/${id}`);
        setService(serviceResponse.service);

        // Load reviews separately so they don't block service display
        try {
          const reviewsResponse = await apiRequest<{ reviews: Review[] }>(`/reviews/provider/${serviceResponse.service.providerId}`);
          setReviews(reviewsResponse.reviews);
        } catch (reviewError) {
          console.log("[v0] Error loading reviews:", reviewError);
          // Reviews failing shouldn't block service display
          setReviews([]);
        }
      } catch (error) {
        console.log("[v0] Error loading service details:", error);
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Service not found.</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isRoadsideService = isRoadsideCategory(service.category);

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
          <div className="lg:col-span-1 space-y-4">
            {/* Emergency CTA for roadside services */}
            {isRoadsideService && (
              <div className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 dark:text-orange-200">Emergency Assistance</h3>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Need help right now?</p>
                  </div>
                </div>
                <Link to="/on-road-services/request">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2">
                    Get Emergency Help
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Booking card */}
            <div className="sticky top-24 rounded-xl border bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-block bg-primary/10 px-3 py-1 rounded-full mb-3">
                  <span className="text-xs font-semibold text-primary">PRICING</span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-foreground">{formatPrice(service.price)}</span>
                  <span className="text-sm text-muted-foreground"> / service</span>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Verified Professional</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Fast Response Time</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Quality Guaranteed</span>
                </div>
              </div>

              <Link to={`/book/${service.id}`}>
                <Button 
                  className="w-full h-11 gap-2 shadow-md hover:shadow-lg transition-smooth" 
                >
                  <Calendar className="h-4 w-4" /> 
                  Book Service
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your booking is secure and you can cancel anytime
              </p>
            </div>

            {/* Provider contact */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Contact Provider
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{service.providerName}</p>
                    <p className="text-xs text-muted-foreground">{service.providerLocation}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Phone className="w-3 h-3" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
