import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Wrench, Zap, Droplets, Wind, Paintbrush, Sparkles, Bug, BookOpen, ArrowRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/StarRating";
import { useEffect, useState } from "react";
import { getServiceImage } from "@/data/serviceImages";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";

const categories = [
  { name: "Plumbing", icon: Droplets },
  { name: "Electrical", icon: Zap },
  { name: "AC Repair", icon: Wind },
  { name: "Cleaning", icon: Sparkles },
  { name: "Carpentry", icon: Wrench },
  { name: "Painting", icon: Paintbrush },
  { name: "Pest Control", icon: Bug },
  { name: "Tutoring", icon: BookOpen },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [topServices, setTopServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadTopServices = async () => {
      try {
        const response = await apiRequest<{ services: Service[] }>("/services");
        setTopServices(response.services.slice(0, 6));
      } catch {
        setTopServices([]);
      }
    };

    loadTopServices();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">LocalServ</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated && user?.role === "customer" && (
              <Link to="/map">
                <Button variant="ghost" size="sm" className="rounded-lg gap-1">
                  <MapPin className="h-4 w-4" />
                  Map
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <Link to={user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider" : "/customer"}>
                <Button className="rounded-lg" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm" className="rounded-lg">Sign In</Button></Link>
                <Link to="/register"><Button size="sm" className="rounded-lg">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-slate-50 to-background py-20 lg:py-32">
        <div className="container text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            <span className="text-sm font-medium text-primary">Trusted by 10,000+ users</span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
            Find Trusted Local Services
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Connect with verified professionals for plumbing, electrical, cleaning, and more. Book instantly and track in real-time.
          </p>
          <div className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-white p-2 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plumbing, electrical, cleaning..."
                className="border-0 bg-transparent pl-11 text-base placeholder:text-muted-foreground focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to={`/services${searchQuery ? `?q=${searchQuery}` : ""}`}>
              <Button className="rounded-lg px-6">Search</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container">
          <div className="mb-2">
            <h2 className="text-3xl font-bold text-foreground">Browse Categories</h2>
            <p className="mt-2 text-muted-foreground">Find the perfect professional for your needs</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/services?category=${cat.name}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-white p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/10">
                    <cat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Services */}
      <section className="border-t border-border py-20">
        <div className="container">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Top Rated Services</h2>
              <p className="mt-2 text-muted-foreground">Verified professionals highly rated by our community</p>
            </div>
            <Link to="/services">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/5">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topServices.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`} className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <img src={getServiceImage(service.category)} alt={service.serviceName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="badge-primary">{service.category}</span>
                      <h3 className="mt-2 font-semibold text-foreground line-clamp-2">{service.serviceName}</h3>
                    </div>
                    <span className="font-bold text-foreground text-lg whitespace-nowrap">₹{service.price}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={service.rating} size={14} />
                        <span className="text-xs font-medium text-muted-foreground">({service.reviewCount})</span>
                      </div>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Wrench className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">LocalServ</span>
              </div>
              <p className="text-sm text-muted-foreground">Trusted local services at your fingertips.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About</a></li>
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2026 LocalServ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
