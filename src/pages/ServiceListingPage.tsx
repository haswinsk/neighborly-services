import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { mockServices } from "@/data/mockData";
import { SERVICE_CATEGORIES } from "@/types";
import { Search, Wrench, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { getServiceImage } from "@/data/serviceImages";

const ServiceListingPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const { isAuthenticated } = useAuth();

  const filtered = mockServices.filter((s) => {
    const matchQ = !query || s.serviceName.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
    const matchCat = !category || s.category === category;
    return matchQ && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground">Browse Services</h1>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search services..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={category === "" ? "default" : "outline"} size="sm" onClick={() => setCategory("")}>All</Button>
            {SERVICE_CATEGORIES.map((cat) => (
              <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Link key={service.id} to={`/services/${service.id}`} className="service-card overflow-hidden">
              <img src={getServiceImage(service.category)} alt={service.serviceName} className="h-28 w-full object-cover" />
              <div className="p-5">
                <span className="text-xs font-medium text-primary">{service.category}</span>
                <h3 className="mt-1 font-semibold text-foreground">{service.serviceName}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <StarRating rating={service.rating} size={14} />
                  <span className="text-lg font-bold text-foreground">₹{service.price}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">by {service.providerName} · {service.reviewCount} reviews</p>
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
