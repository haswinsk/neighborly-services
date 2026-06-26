import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, ChevronUp, ChevronDown, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useGeolocation, Coordinates } from "@/lib/geolocation";
import { ServiceMap } from "@/components/ServiceMap";
import { MapFilters } from "@/components/MapFilters";
import { calculateDistance } from "@/lib/distance";
import { Header } from "@/components/Header";

// Default to Coimbatore for testing/fallback
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [useDefaultLocation, setUseDefaultLocation] = useState(false);
  const { isAuthenticated } = useAuth();
  const { coordinates, loading } = useGeolocation();
  const navigate = useNavigate();

  // Use GPS coordinates if available, fallback to Coimbatore if user opts in
  const displayCoordinates = coordinates || (useDefaultLocation ? DEFAULT_LOCATION : null);

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

      {/* Show location detection indicator while loading */}
      {loading && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-sm text-blue-700">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Detecting your location...</span>
        </div>
      )}

      {/* Main content: Sidebar (left) + Map (right) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── DESKTOP SIDEBAR (LEFT) ── */}
        <aside className="hidden md:flex flex-col w-[360px] lg:w-[400px] border-r border-border bg-white h-full overflow-hidden shadow-lg">
          {displayCoordinates ? (
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
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              {loading ? (
                <>
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground text-center">Detecting your location...</p>
                  <p className="text-xs text-gray-500 text-center">Please enable location access</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">Unable to detect your location</p>
                  <Button
                    onClick={() => setUseDefaultLocation(true)}
                    className="w-full"
                  >
                    Use Coimbatore
                  </Button>
                  <p className="text-xs text-gray-500 text-center">Or enable location permission and refresh</p>
                </>
              )}
            </div>
          )}
        </aside>

        {/* ── DESKTOP MAP (RIGHT, FULL) ── */}
        {displayCoordinates && (
          <div className="hidden md:flex flex-1 relative">
            <ServiceMap
              services={filteredServices}
              userCoordinates={displayCoordinates}
              selectedService={selectedService || undefined}
              onMarkerClick={handleServiceSelect}
              onBookNow={handleBookNow}
            />
          </div>
        )}

        {/* ── MOBILE: Single view (either map or list) ── */}
        <div className="md:hidden flex-1 flex flex-col w-full overflow-hidden">
          {displayCoordinates ? (
            <>
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              {loading ? (
                <>
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Detecting location...</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground text-center">Unable to detect your location</p>
                  <Button
                    onClick={() => setUseDefaultLocation(true)}
                    className="w-full"
                  >
                    Use Coimbatore
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FAB: Toggle Map ── */}
      <div className="md:hidden fixed bottom-6 right-6 z-[450]">
        <Button
          onClick={() => setShowMobileMap((v) => !v)}
          className="rounded-full h-14 w-14 shadow-xl"
          aria-label="Toggle map"
        >
          <MapIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ServiceListingPage;
