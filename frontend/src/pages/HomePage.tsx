import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Wrench, Zap, Droplets, Wind, Paintbrush, Sparkles, Bug, BookOpen, ArrowRight, Star, MapPin, CheckCircle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/StarRating";
import { Header } from "@/components/Header";
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
      <Header />

      {/* Hero */}
      <section className="border-b bg-card py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            Find Trusted Local Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Connect with verified local professionals for plumbing, electrical, cleaning, and more. Book instantly and track your service in real-time.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for a service..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to={`/services${searchQuery ? `?q=${searchQuery}` : ""}`}>
              <Button>Search</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
          <p className="mt-1 text-muted-foreground">Find the right professional for your needs</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/services?category=${cat.name}`}
                className="service-card flex flex-col items-center gap-3 p-6 text-center"
              >
                <div className="rounded-lg bg-primary/10 p-3">
                  <cat.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Services */}
      <section className="border-t py-16">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Top Rated Services</h2>
              <p className="mt-1 text-muted-foreground">Highly rated by our community</p>
            </div>
            <Link to="/services">
              <Button variant="ghost" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topServices.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`} className="service-card overflow-hidden">
                <img src={getServiceImage(service.category)} alt={service.serviceName} className="h-32 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary">{service.category}</span>
                      <h3 className="mt-1 font-semibold text-foreground">{service.serviceName}</h3>
                    </div>
                    <span className="text-lg font-bold text-foreground">₹{service.price}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <StarRating rating={service.rating} size={14} />
                    <span className="text-xs text-muted-foreground">{service.reviewCount} reviews</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{service.providerLocation}</span>
                    <span className="ml-1">· by {service.providerName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose LocalServ</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">The most trusted platform for finding verified professionals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-soft card-hover">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Verified Professionals</h3>
              <p className="text-sm text-muted-foreground">All professionals are background-checked and reviewed by our community</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-soft card-hover">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Best Prices</h3>
              <p className="text-sm text-muted-foreground">Competitive pricing with no hidden charges. Compare and book instantly</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-soft card-hover">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Customer support available round the clock for any assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who have found their perfect professional on LocalServ</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/services">
                <Button size="lg" variant="secondary">Browse Services</Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">Create Account</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">About LocalServ</h3>
              <p className="text-sm text-muted-foreground">Connecting verified professionals with customers for trusted local services</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/services" className="hover:text-foreground">Browse Services</Link></li>
                <li><Link to="/services" className="hover:text-foreground">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">For Professionals</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/register" className="hover:text-foreground">Register as Provider</Link></li>
                <li><Link to="/register" className="hover:text-foreground">Earn More</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 LocalServ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
