import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useGeolocation, DEFAULT_COORDINATES, Coordinates } from "@/lib/geolocation";
import { ServiceMap } from "@/components/ServiceMap";
import { MapFilters } from "@/components/MapFilters";
import { ChevronUp, ChevronDown } from "lucide-react";
import { calculateDistance } from "@/lib/distance";

const ServiceListingPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  // Start immediately with default coords — GPS updates will arrive later
  const [userCoordinates, setUserCoordinates] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { coordinates, loading: gpsLoading } = useGeolocation();

  // Update coordinates once GPS resolves
  useEffect(() => {
    if (coordinates) {
      setUserCoordinates(coordinates);
    }
  }, [coordinates]);

  // Compute filtered services whenever filters or services change
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      // 1. Category filter
      if (selectedCategory && service.category !== selectedCategory) return false;

      // 2. Distance filter
      if (selectedDistance !== null) {
        if (!service.latitude || !service.longitude) return false;
        const dist = calculateDistance(userCoordinates, {
          latitude: service.latitude,
          longitude: service.longitude,
        });
        if (dist > selectedDistance) return false;
      }

      // 3. Search filter
      if (q) {
        const match =
          service.providerName?.toLowerCase().includes(q) ||
          service.serviceName?.toLowerCase().includes(q) ||
          service.category?.toLowerCase().includes(q) ||
          service.providerLocation?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [services, selectedCategory, selectedDistance, searchQuery, userCoordinates]);

  useEffect(() => {
    apiRequest<{ services: Service[] }>("/services")
      .then((res) => setServices(res.services))
      .catch(() => setServices([]));
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    // On mobile close the sheet after selection so user can see marker
    setMobileSidebarOpen(false);
  };

  const handleLocationUpdate = (newCoords: Coordinates) => {
    setUserCoordinates(newCoords);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />

      {/* GPS detecting banner */}
      {gpsLoading && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-600 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Detecting your location...
        </div>
      )}

      {/* Main layout: map left, sidebar right on desktop */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── MAP (always visible, full area on mobile) ── */}
        <div className="flex-1 h-full relative">
          <ServiceMap
            services={filteredServices}
            userCoordinates={userCoordinates}
            selectedService={selectedService || undefined}
            onMarkerClick={handleServiceSelect}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:flex flex-col w-[360px] lg:w-[400px] border-l border-border bg-white h-full overflow-hidden shadow-xl">
          <MapFilters
            services={services}
            selectedCategory={selectedCategory}
            selectedDistance={selectedDistance}
            searchQuery={searchQuery}
            userCoordinates={userCoordinates}
            onCategoryChange={setSelectedCategory}
            onDistanceChange={setSelectedDistance}
            onSearchChange={setSearchQuery}
            onServiceSelect={handleServiceSelect}
            selectedService={selectedService || undefined}
          />
        </aside>

        {/* ── MOBILE BOTTOM SHEET ── */}
        <div
          className={`md:hidden absolute inset-x-0 bottom-0 z-[1000] flex flex-col bg-white rounded-t-2xl shadow-2xl border-t border-border transition-transform duration-300 ease-out ${
            mobileSidebarOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'
          }`}
          style={{ maxHeight: '75vh' }}
        >
          {/* Drag handle + toggle */}
          <button
            className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 w-full"
            onClick={() => setMobileSidebarOpen((o) => !o)}
            aria-expanded={mobileSidebarOpen}
            aria-label="Toggle service list"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full bg-gray-300 mx-auto" />
              <span className="text-sm font-semibold text-foreground ml-1">
                {filteredServices.length} services nearby
              </span>
            </div>
            {mobileSidebarOpen ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <MapFilters
              services={services}
              selectedCategory={selectedCategory}
              selectedDistance={selectedDistance}
              searchQuery={searchQuery}
              userCoordinates={userCoordinates}
              onCategoryChange={setSelectedCategory}
              onDistanceChange={setSelectedDistance}
              onSearchChange={setSearchQuery}
              onServiceSelect={handleServiceSelect}
              selectedService={selectedService || undefined}
              compact
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceListingPage;
