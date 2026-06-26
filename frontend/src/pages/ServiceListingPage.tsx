import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  if (loading || !coordinates) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card">
          <div className="container flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">LocalServ</span>
            </Link>
            {isAuthenticated ? (
              <Link to="/customer"><Button variant="ghost" size="sm">Dashboard</Button></Link>
            ) : (
              <Link to="/login"><Button size="sm">Sign In</Button></Link>
            )}
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card z-50">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">LocalServ</span>
          </Link>
          {isAuthenticated ? (
            <Link to="/customer"><Button variant="ghost" size="sm">Dashboard</Button></Link>
          ) : (
            <Link to="/login"><Button size="sm">Sign In</Button></Link>
          )}
        </div>
      </header>

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
          className="rounded-full h-14 w-14 shadow-lg"
        >
          🗺️
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
