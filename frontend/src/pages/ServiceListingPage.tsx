import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SERVICE_CATEGORIES } from "@/types";
import { Search, Wrench, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { getServiceImage } from "@/data/serviceImages";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";

const ServiceListingPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [services, setServices] = useState<Service[]>([]);
  const { isAuthenticated } = useAuth();

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

  const filtered = services.filter((s) => {
    const matchQ = !query || s.serviceName.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
    const matchCat = !category || s.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">LocalServ</span>
          </Link>
          {isAuthenticated ? (
            <Link to="/customer"><Button variant="ghost" size="sm" className="rounded-lg">Dashboard</Button></Link>
          ) : (
            <Link to="/login"><Button size="sm" className="rounded-lg">Sign In</Button></Link>
          )}
        </div>
      </header>

      <div className="container py-12">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-foreground">Browse Services</h1>
          <p className="mt-2 text-muted-foreground">Discover verified local professionals</p>
        </div>

        {/* Filters */}
        <div className="mt-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by service name or description..." 
              className="border-border bg-white pl-12 py-2.5 rounded-lg text-base" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={category === "" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setCategory("")}
              className="rounded-lg"
            >
              All Categories
            </Button>
            {SERVICE_CATEGORIES.map((cat) => (
              <Button 
                key={cat} 
                variant={category === cat ? "default" : "outline"} 
                size="sm" 
                onClick={() => setCategory(cat)}
                className="rounded-lg"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Link key={service.id} to={`/services/${service.id}`} className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img src={getServiceImage(service.category)} alt={service.serviceName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-5">
                <span className="badge-primary">{service.category}</span>
                <h3 className="mt-2 font-semibold text-foreground line-clamp-2">{service.serviceName}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={service.rating} size={14} />
                      <span className="text-xs font-medium text-muted-foreground">({service.reviewCount})</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">₹{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{service.providerLocation}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">by {service.providerName}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">
            <p>No services found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceListingPage;
