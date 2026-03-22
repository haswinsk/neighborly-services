import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Wrench, Zap, Droplets, Wind, Paintbrush, Sparkles, Bug, BookOpen, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockServices, mockReviews } from "@/data/mockData";
import { StarRating } from "@/components/StarRating";
import { useState } from "react";
import { getServiceImage } from "@/data/serviceImages";

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

  const topServices = mockServices.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LocalServ</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider" : "/customer"}>
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Sign In</Button></Link>
                <Link to="/register"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

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
                <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10" />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary">{service.category}</span>
                      <h3 className="mt-1 font-semibold text-foreground">{service.serviceName}</h3>
                    </div>
                    <span className="text-lg font-bold text-foreground">${service.price}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <StarRating rating={service.rating} size={14} />
                    <span className="text-xs text-muted-foreground">{service.reviewCount} reviews</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">by {service.providerName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 LocalServ. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
