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

const ServiceListingPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const { isAuthenticated } = useAuth();
  const { coordinates, loading } = useGeolocation();
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest<{ services: Service[] }>("/services")
      .then((res) => setServices(res.services))
      .catch(() => setServices([]));
  }, []);

  // Filter services client-side
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      if (selectedCategory && service.category !== selectedCategory) return false;

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

  if (loading || !coordinates) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main content: Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── DESKTOP MAP ── */}
        <div className="hidden md:flex flex-1 relative">
          <ServiceMap
            services={filteredServices}
            userCoordinates={coordinates as Coordinates}
            selectedService={selectedService || undefined}
            onMarkerClick={handleServiceSelect}
            onBookNow={handleBookNow}
          />
        </div>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-[360px] lg:w-[400px] border-l border-border bg-white h-full overflow-hidden shadow-xl">
          <MapFilters
            services={filteredServices}
            allServices={services}
            selectedCategory={selectedCategory}
            selectedDistance={selectedDistance}
            searchQuery={searchQuery}
            userCoordinates={coordinates as Coordinates}
            onCategoryChange={setSelectedCategory}
            onDistanceChange={setSelectedDistance}
            onSearchChange={setSearchQuery}
            onServiceSelect={handleServiceSelect}
            selectedService={selectedService || undefined}
          />
        </aside>

        {/* ── MOBILE MAP (full screen overlay) ── */}
        {showMobileMap && (
          <div className="md:hidden absolute inset-0 z-[500] bg-white">
            <ServiceMap
              services={filteredServices}
              userCoordinates={coordinates as Coordinates}
              selectedService={selectedService || undefined}
              onMarkerClick={handleServiceSelect}
              onBookNow={handleBookNow}
            />
            <button
              onClick={() => setShowMobileMap(false)}
              className="absolute top-4 right-4 z-[600] bg-white text-gray-800 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg border border-gray-200"
            >
              Close Map
            </button>
          </div>
        )}

        {/* ── MOBILE: full-screen service list ── */}
        {!showMobileMap && (
          <div className="md:hidden flex flex-col w-full h-full overflow-hidden bg-white">
            <MapFilters
              services={filteredServices}
              allServices={services}
              selectedCategory={selectedCategory}
              selectedDistance={selectedDistance}
              searchQuery={searchQuery}
              userCoordinates={coordinates as Coordinates}
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
