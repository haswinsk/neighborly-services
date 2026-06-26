import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useGeolocation, Coordinates } from "@/lib/geolocation";
import { ServiceMap } from "@/components/ServiceMap";
import { MapFilters } from "@/components/MapFilters";
import { calculateDistance } from "@/lib/distance";
import { Header } from "@/components/Header";

// Default to Coimbatore — shown immediately so the map is never blank
const DEFAULT_LOCATION: Coordinates = {
  latitude: 11.0126,
  longitude: 76.9558,
};

const ServiceListingPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const { coordinates, loading } = useGeolocation();
  const navigate = useNavigate();

  // Always show the map immediately using default location; upgrade to GPS when ready
  const displayCoordinates = coordinates ?? DEFAULT_LOCATION;

  useEffect(() => {
    apiRequest<{ services: Service[] }>("/services")
      .then((res) => setServices(res.services))
      .catch(() => setServices([]));
  }, []);

  // Filter services client-side based on category, distance, and search
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      if (selectedCategory && service.category !== selectedCategory) return false;

      // Apply distance filter only if user has coordinates
      if (selectedDistance && coordinates) {
        if (!service.latitude || !service.longitude) return false;
        const dist = calculateDistance(coordinates as Coordinates, {
          latitude: service.latitude,
          longitude: service.longitude,
        });
        if (dist > selectedDistance) return false;
      }

      if (q) {
        const haystack =
          `${service.serviceName} ${service.providerName} ${service.category} ${service.providerLocation || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [services, selectedCategory, selectedDistance, searchQuery, coordinates]);

  const handleServiceSelect = useCallback((serviceId: string) => {
    setSelectedService(serviceId);
  }, []);

  const handleBookNow = useCallback((serviceId: string) => {
    navigate(`/services/${serviceId}`);
  }, [navigate]);



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Location detection strip — only shown while GPS is loading */}
      {loading && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 flex items-center gap-2 text-xs text-blue-600 shrink-0">
          <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Detecting your GPS location&hellip;
        </div>
      )}

      {/* Main content: Sidebar (left, scrollable) + Map (right, fixed) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* DESKTOP SIDEBAR (LEFT) — Scrollable */}
        <aside className="hidden md:flex flex-col w-[360px] lg:w-[400px] border-r border-border bg-white overflow-y-auto shadow-lg">
          <MapFilters
            services={filteredServices}
            allServices={services}
            selectedCategory={selectedCategory}
            selectedDistance={selectedDistance}
            searchQuery={searchQuery}
            userCoordinates={displayCoordinates}
            onCategoryChange={setSelectedCategory}
            onDistanceChange={setSelectedDistance}
            onSearchChange={setSearchQuery}
            onServiceSelect={handleServiceSelect}
            selectedService={selectedService || undefined}
          />
        </aside>

        {/* DESKTOP MAP (RIGHT) — Fixed position, doesn't scroll */}
        <div className="hidden md:flex flex-1 relative h-[calc(100vh-var(--header-height,80px))]">
          <ServiceMap
            services={filteredServices}
            userCoordinates={displayCoordinates}
            selectedService={selectedService || undefined}
            onMarkerClick={handleServiceSelect}
            onBookNow={handleBookNow}
          />
        </div>

        {/* MOBILE: Single view (either map or list) — Full page scrollable */}
        <div className="md:hidden flex-1 flex flex-col w-full overflow-hidden">
          {showMobileMap ? (
            <div className="flex-1 relative">
              <ServiceMap
                services={filteredServices}
                userCoordinates={displayCoordinates}
                selectedService={selectedService || undefined}
                onMarkerClick={handleServiceSelect}
                onBookNow={handleBookNow}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <MapFilters
                services={filteredServices}
                allServices={services}
                selectedCategory={selectedCategory}
                selectedDistance={selectedDistance}
                searchQuery={searchQuery}
                userCoordinates={displayCoordinates}
                onCategoryChange={setSelectedCategory}
                onDistanceChange={setSelectedDistance}
                onSearchChange={setSearchQuery}
                onServiceSelect={handleServiceSelect}
                selectedService={selectedService || undefined}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* MOBILE: Bottom FAB with toggle label */}
      <div className="md:hidden fixed bottom-6 right-6 z-[450] flex flex-col items-end gap-2">
        <div className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
          {showMobileMap ? "Tap for List" : "Tap for Map"}
        </div>
        <Button
          onClick={() => setShowMobileMap((v) => !v)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-2xl hover:scale-110 transition-transform"
          aria-label={showMobileMap ? "Show provider list" : "Show map"}
        >
          <MapIcon className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceListingPage;
