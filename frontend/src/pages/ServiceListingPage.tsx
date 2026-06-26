import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useGeolocation, Coordinates } from "@/lib/geolocation";
import { ServiceMap } from "@/components/ServiceMap";
import { MapFilters } from "@/components/MapFilters";

const ServiceListingPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const { isAuthenticated } = useAuth();
  const { coordinates, loading } = useGeolocation();

  // Update user coordinates when GPS loads or when manually located
  useEffect(() => {
    if (coordinates) {
      console.log('[v0] Setting initial GPS coordinates:', coordinates);
      setUserCoordinates(coordinates);
    }
  }, [coordinates]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await apiRequest<{ services: Service[] }>("/services");
        setServices(response.services);
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBookNow = (serviceId: string) => {
    // Navigate to service details page
    window.location.href = `/services/${serviceId}`;
  };

  const handleLocationUpdate = (newCoordinates: Coordinates) => {
    console.log('[v0] Location updated from map:', newCoordinates);
    setUserCoordinates(newCoordinates);
  };

  // Show map immediately even while loading coordinates
  if (!userCoordinates) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Map Container - Fixed, no scrolling */}
        <div className="hidden md:flex flex-1 relative h-full">
          <ServiceMap
            services={services}
            userCoordinates={userCoordinates}
            selectedService={selectedService || undefined}
            onMarkerClick={handleServiceSelect}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>

        {/* Filters and Service List - Only this scrolls */}
        <div className="w-full md:w-96 border-l bg-white flex flex-col h-full overflow-hidden">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceListingPage;
