import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Bike,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Fuel,
  MapPin,
  Paintbrush,
  Navigation,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { calculateDistance, formatDistance } from "@/lib/distance";
import { useGeolocation, type Coordinates, DEFAULT_COORDINATES } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import { Service } from "@/types";
import { CustomerFooter, EmptyState, SectionHeader, formatPrice } from "@/components/customer/CustomerUI";
import { ServiceMap, type ServiceMapService } from "@/components/ServiceMap";

type PreviewSource = "nearby" | "services";

interface NearbyProviderService {
  id: string;
  serviceName: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  image?: string;
  isActive?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface NearbyProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  city?: string;
  state?: string;
  avatar?: string;
  distance?: string;
  servicesProvided: NearbyProviderService[];
}

interface PreviewProviderCard {
  id: string;
  providerName: string;
  serviceName: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: number;
  locationLabel: string;
  distanceLabel?: string;
  distanceValue?: number;
  latitude?: number | null;
  longitude?: number | null;
  avatar?: string;
  isAvailable: boolean;
  detailsHref: string;
}

const HOME_CATEGORIES = [
  { name: "Plumbing", icon: Droplets, description: "Pipe fixes, leak repairs, and drain support." },
  { name: "Electrical", icon: Zap, description: "Safe electrical help for homes and offices." },
  { name: "Cleaning", icon: Sparkles, description: "Trusted deep cleaning and maintenance help." },
  { name: "Painting", icon: Paintbrush, description: "Fresh finishes for walls, trims, and spaces." },
  { name: "Appliance Repair", icon: Wrench, description: "Repair support for everyday home appliances." },
];

const ROADSIDE_CATEGORIES = [
  { name: "Bike Puncture", icon: Bike, description: "Fast tyre support for two-wheelers." },
  { name: "Car Puncture", icon: Car, description: "Roadside puncture help for four-wheelers." },
  { name: "Battery Jump Start", icon: BatteryCharging, description: "Get back on the road when the battery dies." },
  { name: "Fuel Assistance", icon: Fuel, description: "Emergency fuel support when you run low." },
  { name: "Breakdown Repair", icon: Wrench, description: "Quick mechanical help for breakdowns." },
  { name: "Towing", icon: Truck, description: "Move your vehicle safely when it cannot continue." },
];

const ROADSIDE_NAMES = new Set(ROADSIDE_CATEGORIES.map((category) => category.name));

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { coordinates, loading: isLocationLoading } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [previewProviders, setPreviewProviders] = useState<PreviewProviderCard[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      setIsServicesLoading(true);
      try {
        const response = await apiRequest<{ services: Service[] }>("/services");
        if (active) {
          setServices(response.services);
        }
      } catch {
        if (active) {
          setServices([]);
        }
      } finally {
        if (active) {
          setIsServicesLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const buildFromServices = () => {
      const providers = new Map<string, PreviewProviderCard>();

      [...services]
        .sort((left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount)
        .forEach((service) => {
          if (providers.has(service.providerId)) {
            return;
          }

          const distanceValue =
            coordinates && service.latitude != null && service.longitude != null
              ? calculateDistance(coordinates, { latitude: service.latitude, longitude: service.longitude })
              : undefined;

          providers.set(service.providerId, {
            id: service.providerId,
            providerName: service.providerName,
            serviceName: service.serviceName,
            category: service.category,
            rating: service.rating,
            reviewCount: service.reviewCount,
            price: service.price,
            locationLabel: service.providerLocation,
            distanceLabel: distanceValue !== undefined ? formatDistance(distanceValue) : undefined,
            distanceValue,
            latitude: service.latitude,
            longitude: service.longitude,
            isAvailable: service.isActive !== false,
            detailsHref: `/services/${service.id}`,
          });
        });

      return Array.from(providers.values()).slice(0, 5);
    };

    const loadPreviewProviders = async () => {
      if (isAuthLoading) {
        return;
      }

      setIsPreviewLoading(true);

      try {
        if (isAuthenticated && coordinates) {
          const response = await apiRequest<{ providers: NearbyProvider[] }>(
            `/users/nearby-providers?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&radius=15`,
          );

          if (!active) {
            return;
          }

          const normalizedNearby = response.providers
            .map((provider) => {
              const topService = [...provider.servicesProvided].sort(
                (left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount,
              )[0];

              if (!topService) {
                return null;
              }

              return {
                id: provider.id,
                providerName: provider.name,
                serviceName: topService.serviceName,
                category: topService.category,
                rating: topService.rating,
                reviewCount: topService.reviewCount,
                price: topService.price,
                locationLabel: [provider.address, provider.city, provider.state].filter(Boolean).join(", ") || topService.category,
                distanceLabel: provider.distance,
                latitude: provider.latitude,
                longitude: provider.longitude,
                avatar: provider.avatar,
                isAvailable: true,
                detailsHref: `/services/${topService.id}`,
              } satisfies PreviewProviderCard;
            })
            .filter(Boolean) as PreviewProviderCard[];

          setPreviewProviders(normalizedNearby.slice(0, 5));
          return;
        }

        setPreviewProviders(buildFromServices());
      } catch {
        if (active) {
          setPreviewProviders(buildFromServices());
        }
      } finally {
        if (active) {
          setIsPreviewLoading(false);
        }
      }
    };

    loadPreviewProviders();

    return () => {
      active = false;
    };
  }, [coordinates, isAuthenticated, isAuthLoading, services]);

  const topServicesByCategory = useMemo(() => {
    return services.reduce<Record<string, Service[]>>((accumulator, service) => {
      if (!accumulator[service.category]) {
        accumulator[service.category] = [];
      }

      accumulator[service.category].push(service);
      return accumulator;
    }, {});
  }, [services]);

  const heroProviderSummary = useMemo(() => {
    const availableProviders = previewProviders.filter((provider) => provider.isAvailable).length;
    return `${availableProviders || previewProviders.length} available nearby`;
  }, [previewProviders]);

  const mapServices = useMemo(() => {
    const servicesWithCoords = previewProviders.filter(
      (provider) => provider.latitude != null && provider.longitude != null
    );

    return servicesWithCoords.map((provider) => ({
      id: provider.id,
      serviceName: provider.serviceName,
      providerName: provider.providerName,
      category: provider.category,
      price: provider.price,
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      latitude: provider.latitude,
      longitude: provider.longitude,
      providerLocation: provider.locationLabel,
    })) satisfies ServiceMapService[];
  }, [previewProviders]);

  const userCoordinates = coordinates || DEFAULT_COORDINATES;

  const currentLocationLabel =
    user?.location || user?.city || (selectedCoordinates || coordinates ? "Current location" : "Location unavailable");

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    if (selectedCoordinates) {
      sessionStorage.setItem(
        "focusLocation",
        JSON.stringify({
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude,
          customerName: locationQuery.trim() || currentLocationLabel,
          showNearbyServices: true,
          searchRadius: 15,
        }),
      );
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (locationQuery.trim()) {
      params.set("location", locationQuery.trim());
    }

    navigate(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleUseMyLocation = () => {
    const currentCoordinates = coordinates;
    if (!currentCoordinates) {
      return;
    }

    setSelectedCoordinates(currentCoordinates);
    setLocationQuery(user?.location || user?.city || "Current location");
    setMapError(null);
  };

  const handleMarkerClick = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBookNow = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const renderCategoryCard = (category: { name: string; icon: typeof Droplets; description: string }) => {
    const Icon = category.icon;
    const isEmergency = ROADSIDE_NAMES.has(category.name);
    const categoryServices = topServicesByCategory[category.name] || [];
    const bestService = [...categoryServices].sort((left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount)[0];
    const startingPrice = bestService ? formatPrice(bestService.price) : "Price on request";
    const href = isEmergency ? "/on-road-services" : `/services?category=${encodeURIComponent(category.name)}`;

    return (
      <Link
        key={category.name}
        to={href}
        className={cn(
          "group flex h-full flex-col rounded-2xl border bg-white dark:bg-card p-4 shadow-sm transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
          isEmergency && "border-orange-200 bg-orange-50/30 hover:border-orange-300",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
              isEmergency ? "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" : "bg-blue-50 dark:bg-blue-950/30 text-primary",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 flex-1">
          <h3 className="font-semibold text-foreground">{category.name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{category.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 text-xs">
          <span className={cn("rounded-full px-2.5 py-1 font-semibold", isEmergency ? "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400" : "bg-blue-50 dark:bg-blue-950/30 text-primary")}> 
            {isEmergency ? "Emergency" : "Home service"}
          </span>
          <span className="font-semibold text-foreground">{startingPrice}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b bg-white dark:bg-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.08),_transparent_28%)]" />
          <div className="container relative grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 text-xs font-semibold text-primary">
                <MapPin className="h-3.5 w-3.5" />
                NEED HELP NEARBY?
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Find {" "}
                  <span className="text-gradient">trusted local help</span>
                  {" "}
                  without the guesswork.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Neighbourly Services connects customers with nearby home-service providers and emergency on-road assistance from one clean, reliable experience.
                </p>
              </div>

              <form onSubmit={handleSearch} className="rounded-[24px] border bg-white dark:bg-card p-4 shadow-soft">
                <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                  <label className="relative block">
                    <span className="sr-only">Location</span>
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={locationQuery}
                      onChange={(event) => setLocationQuery(event.target.value)}
                      placeholder="Location / Use my location"
                      className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-32 shadow-none transition-smooth placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:bg-white dark:focus-visible:bg-slate-800 focus-visible:ring-4 focus-visible:ring-primary/10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUseMyLocation}
                      disabled={isLocationLoading}
                      className="absolute right-2 top-1/2 h-8 -translate-y-1/2 gap-1 rounded-full px-3 text-xs text-primary hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Use my location
                    </Button>
                  </label>

                  <label className="relative block">
                    <span className="sr-only">Search services</span>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search plumbing, cleaning, puncture repair..."
                      className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 shadow-none transition-smooth placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:bg-white dark:focus-visible:bg-slate-800 focus-visible:ring-4 focus-visible:ring-primary/10"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" className="h-12 flex-1 gap-2 text-base shadow-sm">
                    Find Services Near You
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Link to="/on-road-services/request" className="sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full gap-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-800 dark:hover:text-orange-300 sm:px-5"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Get Emergency Help
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {[
                  "Verified Providers",
                  "Nearby Matching",
                  "Secure Booking",
                  "Fast Assistance",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border bg-white dark:bg-card px-3 py-1.5 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border bg-white dark:bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Nearby providers</p>
                  <p className="text-sm text-muted-foreground">{heroProviderSummary}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
                  Live data
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-[24px] border bg-slate-50 dark:bg-slate-900" style={{ height: "400px" }}>
                {isPreviewLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="rounded-full border bg-white/95 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                      Loading nearby providers...
                    </div>
                  </div>
                ) : mapError ? (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    <p className="mt-3 font-semibold text-foreground">Unable to load map</p>
                    <p className="mt-1 text-sm text-muted-foreground">{mapError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMapError(null)}
                      className="mt-4 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <ServiceMap
                    services={mapServices}
                    userCoordinates={userCoordinates}
                    selectedService={selectedService}
                    onMarkerClick={handleMarkerClick}
                    onBookNow={handleBookNow}
                  />
                )}
              </div>

              <div className="mt-4 space-y-3">
                {isPreviewLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border bg-white dark:bg-card p-4 shadow-sm">
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
                    </div>
                  ))
                ) : previewProviders.length > 0 ? (
                  previewProviders.slice(0, 3).map((provider) => (
                    <article key={provider.id} className="rounded-2xl border bg-white dark:bg-card p-4 shadow-sm transition-smooth hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">
                          {provider.avatar ? (
                            <img src={provider.avatar} alt={provider.providerName} className="h-full w-full rounded-2xl object-cover" />
                          ) : (
                            provider.providerName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-foreground">{provider.providerName}</h3>
                              <p className="truncate text-sm text-muted-foreground">{provider.category}</p>
                            </div>
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", provider.isAvailable ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400")}>
                              <span className={cn("h-2 w-2 rounded-full", provider.isAvailable ? "bg-emerald-500" : "bg-amber-500")} />
                              {provider.isAvailable ? "Available" : "Busy"}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                              <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                              {provider.rating.toFixed(1)} ({provider.reviewCount})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {provider.distanceLabel || provider.locationLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed bg-slate-50 dark:bg-slate-900 p-8 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold text-foreground">No nearby providers yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Approved providers will appear here when nearby locations are available.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="mt-4 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-14">
          <SectionHeader
            eyebrow="Popular Services"
            title="Book everyday help near you"
            description="Browse home services from verified nearby providers."
          />

          <div className="mt-6 space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Home services</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {HOME_CATEGORIES.map(renderCategoryCard)}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">On-road assistance</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {ROADSIDE_CATEGORIES.map(renderCategoryCard)}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-orange-100 dark:border-orange-800 bg-orange-50/60 dark:bg-orange-950/30">
          <div className="container grid gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Stuck on the road?
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Get help nearby. Request assistance for punctures, battery jump starts, fuel assistance, breakdown repair and towing.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/on-road-services/request">
                  <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                    Get Emergency Help
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Clock,
                  title: "Fast Matching",
                  detail: "Nearby providers are prioritized when location is available.",
                },
                {
                  icon: ShieldCheck,
                  title: "Verified Providers",
                  detail: "Only approved providers are shown in discovery.",
                },
                {
                  icon: Fuel,
                  title: "Roadside Ready",
                  detail: "Emergency categories are available through a dedicated customer flow.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-2xl border border-orange-100 dark:border-orange-800 bg-white dark:bg-card p-5 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-14">
          <SectionHeader
            eyebrow="Top rated providers"
            title="Top Rated Service Providers Near You"
            action={
              <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
                View all providers
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {previewProviders.slice(0, 4).map((provider) => (
              <article key={provider.id} className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary">
                    {provider.avatar ? (
                      <img src={provider.avatar} alt={provider.providerName} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      provider.providerName.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground">{provider.providerName}</h3>
                        <p className="truncate text-sm text-muted-foreground">{provider.category}</p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", provider.isAvailable ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400")}>
                        <span className={cn("h-2 w-2 rounded-full", provider.isAvailable ? "bg-emerald-500" : "bg-amber-500")} />
                        {provider.isAvailable ? "Available" : "Busy"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">
                          {provider.rating.toFixed(1)} <span className="font-normal text-muted-foreground">({provider.reviewCount})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.distanceLabel || provider.locationLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {!isPreviewLoading && previewProviders.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed bg-slate-50 dark:bg-slate-900 p-8 text-center lg:col-span-4">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-semibold text-foreground">No providers available yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Approved provider services will appear here as soon as they are available.
                </p>
                <Link to="/services">
                  <Button variant="outline" className="mt-4">
                    Browse Services
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="container py-12 md:py-14">
          <SectionHeader eyebrow="How it works" title="A simple path from search to completed service" />

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "SEARCH",
                text: "Tell us what you need",
              },
              {
                step: "02",
                title: "MATCH",
                text: "Find suitable nearby providers",
                highlight: true,
              },
              {
                step: "03",
                title: "BOOK",
                text: "Choose and confirm",
              },
              {
                step: "04",
                title: "COMPLETE",
                text: "Get the service",
              },
            ].map((step) => (
              <article
                key={step.step}
                className={cn(
                  "rounded-2xl border bg-white dark:bg-card p-5 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-md",
                  step.highlight && "border-primary/30 bg-blue-50/30 dark:bg-blue-950/20"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                  step.highlight ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800 text-foreground"
                )}>
                  {step.step}
                </div>
                <h3 className={cn("mt-4 font-semibold text-foreground", step.highlight && "text-primary")}>{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container py-12 md:py-14">
          <SectionHeader eyebrow="Why Neighbourly" title="The right choice for local services" />

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "TRUSTED", text: "Verified provider ecosystem" },
              { icon: MapPin, title: "HYPERLOCAL", text: "Nearby service discovery" },
              { icon: Star, title: "SMART MATCHING", text: "Capability + availability + location" },
              { icon: CheckCircle2, title: "RELIABLE", text: "Booking to completion" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border bg-white dark:bg-card p-5 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y bg-slate-50 dark:bg-slate-900">
          <div className="container py-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Are you a service professional?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Grow your local business with Neighbourly.
              </p>
              <Link to="/register?role=provider" className="mt-6 inline-block">
                <Button className="gap-2">
                  Become a Provider
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-blue-50/60 dark:bg-blue-950/20">
          <div className="container py-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { icon: CheckCircle2, label: "Approved providers only" },
                { icon: Star, label: "Ratings and reviews visible" },
                { icon: MapPin, label: "Map-first local discovery" },
                { icon: Clock, label: "Fast response" },
                { icon: ShieldCheck, label: "Secure booking" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-blue-100 dark:border-blue-800 bg-white dark:bg-card px-4 py-3 shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="rounded-[28px] border bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-8 shadow-soft md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Need help nearby?</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Find the right local provider for your service.
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Trusted home services and emergency roadside assistance from verified nearby providers.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link to="/services">
                  <Button className="h-12 gap-2 px-6">
                    Find a Service
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/on-road-services/request">
                  <Button className="h-12 gap-2 bg-orange-600 px-6 hover:bg-orange-700">
                    Emergency Help
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default HomePage;
