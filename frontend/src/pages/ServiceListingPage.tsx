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
  const { isAuthenticated } = useAuth();
  const { coordinates, loading } = useGeolocation();

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

  // Show map immediately even while loading coordinates
  if (!coordinates) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Map Container - Hidden on mobile */}
        <div className="hidden md:flex flex-1 relative">
          <ServiceMap
            services={services}
            userCoordinates={coordinates as Coordinates}
            selectedService={selectedService || undefined}
            onMarkerClick={handleServiceSelect}
          />
        </div>

        {/* Filters and Service List */}
        <div className="w-full md:w-96 border-l bg-white flex flex-col">
          <MapFilters
            services={services}
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
        </div>
      </div>

      {/* Mobile Map Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => {
            const mapElement = document.querySelector("[data-map-mobile]");
            if (mapElement) {
              mapElement.classList.toggle("hidden");
            }
          }}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
          title="View Map"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6.553 3.276A1 1 0 0118 20.382V9.618a1 1 0 00-1.447-.894L9 11m0 13V7m6-4l5.447-2.724A1 1 0 0121 3.618v10.764a1 1 0 01-1.447.894L15 10m0 7v6m0-13V5"
            />
          </svg>
        </Button>
      </div>

      {/* Mobile Map Modal */}
      <div
        data-map-mobile
        className="hidden md:hidden fixed inset-0 z-30 bg-black/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.classList.add("hidden");
          }
        }}
      >
        <div className="bg-white h-full w-full">
          <ServiceMap
            services={services}
            userCoordinates={coordinates as Coordinates}
            selectedService={selectedService || undefined}
            onMarkerClick={handleServiceSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceListingPage;
