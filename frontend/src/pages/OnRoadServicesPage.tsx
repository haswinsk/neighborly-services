import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { OnRoadHero } from "@/components/OnRoadHero";
import { RoadsideServiceCard } from "@/components/RoadsideServiceCard";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { EmptyState } from "@/components/customer/CustomerUI";
import { 
  AlertTriangle,
  Bike, 
  Car, 
  BatteryCharging, 
  Fuel, 
  Wrench, 
  Truck
} from "lucide-react";

const ON_ROAD_SERVICES = [
  {
    name: "Bike Puncture",
    description: "Quick roadside puncture assistance for bikes.",
    icon: Bike,
    estimatedTime: "15-20 min",
    startingPrice: 150,
  },
  {
    name: "Car Puncture",
    description: "Get roadside tyre puncture assistance for your car.",
    icon: Car,
    estimatedTime: "20-30 min",
    startingPrice: 300,
  },
  {
    name: "Battery Jump Start",
    description: "Get help starting your vehicle when the battery is dead.",
    icon: BatteryCharging,
    estimatedTime: "10-15 min",
    startingPrice: 400,
  },
  {
    name: "Fuel Assistance",
    description: "Request emergency fuel assistance when you run out of fuel.",
    icon: Fuel,
    estimatedTime: "20-30 min",
    startingPrice: 500,
  },
  {
    name: "Breakdown Repair",
    description: "Get roadside mechanical assistance for vehicle breakdowns.",
    icon: Wrench,
    estimatedTime: "30-45 min",
    startingPrice: 600,
  },
  {
    name: "Towing",
    description: "Request towing assistance when your vehicle cannot continue.",
    icon: Truck,
    estimatedTime: "45-60 min",
    startingPrice: 1000,
  },
];

const OnRoadServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await apiRequest<{ services: Service[] }>("/services");
        const onRoadServices = res.services.filter(
          (service) => 
            service.category === "Bike Puncture" ||
            service.category === "Car Puncture" ||
            service.category === "Battery Jump Start" ||
            service.category === "Fuel Assistance" ||
            service.category === "Breakdown Repair" ||
            service.category === "Towing"
        );
        setServices(onRoadServices);
      } catch (error) {
        console.error("Failed to load services:", error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleServiceClick = (serviceName: string) => {
    navigate("/on-road-services/request", { state: { serviceName } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <OnRoadHero />

      {/* Services Grid */}
      <div className="container py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          Our Roadside Services
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ON_ROAD_SERVICES.map((service) => {
              const hasProvider = services.some(s => s.category === service.name);
              
              return (
                <RoadsideServiceCard
                  key={service.name}
                  name={service.name}
                  description={service.description}
                  icon={service.icon}
                  estimatedTime={service.estimatedTime}
                  startingPrice={service.startingPrice}
                  hasProvider={hasProvider}
                  onClick={() => handleServiceClick(service.name)}
                />
              );
            })}
          </div>
        )}

        {services.length === 0 && !isLoading && (
          <EmptyState
            icon={AlertTriangle}
            title="No on-road providers available yet"
            description="The request flow is ready, but the backend currently has no approved providers for on-road categories in this area."
          />
        )}
      </div>

      <div className="container pb-12">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Nearby assistance availability</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {services.length > 0
                ? `${services.length} approved on-road service listing${services.length === 1 ? "" : "s"} are available from the existing provider network.`
                : "Availability depends on approved providers adding on-road services in the backend."}
            </p>
          </section>
          <section className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 p-6">
            <h2 className="text-lg font-semibold text-orange-950 dark:text-orange-200">Safety information</h2>
            <ul className="mt-3 space-y-2 text-sm text-orange-900 dark:text-orange-300">
              <li>Move to a safe shoulder or visible public area when possible.</li>
              <li>Share your location through the emergency request flow.</li>
              <li>Keep your phone reachable so the assigned provider can contact you if supported.</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-muted/50 border-t">
        <div className="container py-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-foreground mb-2">24/7 Availability</h3>
              <p className="text-sm text-muted-foreground">
                Our roadside assistance is available round the clock for your emergencies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Verified Providers</h3>
              <p className="text-sm text-muted-foreground">
                All our service providers are verified and trained professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                Get fast assistance from nearby providers to minimize your wait time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnRoadServicesPage;
