import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Clock, IndianRupee, Loader2, MapPin, StickyNote, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Service } from "@/types";
import { CustomerFooter, ErrorState, LoadingState, formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

type FormErrors = Partial<Record<"date" | "time" | "location", string>>;

const BookServicePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState(user?.location || user?.address || "");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadService = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ service: Service }>(`/services/${id}`);
      setService(response.service);
    } catch {
      setError("Unable to load this service. Please try again.");
      setService(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [id]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!date) nextErrors.date = "Choose a service date.";
    if (!time) nextErrors.time = "Choose a service time.";
    if (!location.trim()) nextErrors.location = "Enter the service location.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!service || !validate()) return;

    setIsSubmitting(true);
    try {
      const bookingDate = new Date(`${date}T${time}`).toISOString();
      const response = await apiRequest<{ booking: { id: string } }>("/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId: service.id, bookingDate }),
      });

      toast({
        title: isRoadsideCategory(service.category) ? "Emergency request submitted" : "Booking requested",
        description: "You can track status from My Bookings.",
      });
      navigate(`/customer/bookings/${response.booking.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create booking.";
      toast({ title: "Booking failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Link to={id ? `/services/${id}` : "/services"} className="inline-flex">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to details
          </Button>
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Book Service</h1>
          <p className="mt-1 text-muted-foreground">Confirm the provider, schedule, location, and submit your request.</p>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <LoadingState label="Loading selected service..." />
          ) : error || !service ? (
            <ErrorState description={error || "Service not found."} onRetry={loadService} />
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <section className="space-y-5 rounded-lg border bg-white dark:bg-card p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="date" type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className="pl-9" />
                    </div>
                    {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="pl-9" />
                    </div>
                    {errors.time && <p className="mt-1 text-xs text-destructive">{errors.time}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Service location</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="House number, street, landmark, city"
                      className="min-h-24 pl-9"
                    />
                  </div>
                  {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    The current backend stores booking date and service. Location notes are kept in this confirmation UI until a booking-location API is added.
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes for provider</Label>
                  <div className="relative mt-2">
                    <StickyNote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Access instructions or issue details"
                      className="min-h-28 pl-9"
                    />
                  </div>
                </div>
              </section>

              <aside className="h-fit rounded-lg border bg-white dark:bg-card p-6 shadow-sm lg:sticky lg:top-24">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selected provider</p>
                    <h2 className="font-semibold text-foreground">{service.providerName}</h2>
                    <p className="text-sm text-muted-foreground">{service.serviceName}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">{service.category}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Provider area</span>
                    <span className="text-right font-medium text-foreground">{service.providerLocation || "Location available on map"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t pt-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      Price
                    </span>
                    <span className="text-lg font-bold text-foreground">{formatPrice(service.price)}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-800 dark:text-blue-200">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  You will be able to track status after the provider responds.
                </div>

                <Button type="submit" className="mt-5 w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Book Now
                </Button>
              </aside>
            </form>
          )}
        </div>
      </main>
      <CustomerFooter />
    </div>
  );
};

export default BookServicePage;
