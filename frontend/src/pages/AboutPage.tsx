import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Users, Zap, Globe } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-indigo-50" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About LocalServ
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connecting verified professionals with customers who need reliable, local services at transparent prices.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 border-t">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We believe everyone deserves access to trusted, professional services at fair prices. LocalServ empowers independent service providers and connects them with customers who value quality and reliability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By leveraging technology and community trust, we eliminate intermediaries and create direct, transparent relationships between professionals and customers.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 border">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Verified professionals</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Transparent pricing</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">Community-driven reviews</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Community First</h3>
              <p className="text-sm text-muted-foreground">
                We build a community where professionals and customers trust each other through transparency and accountability.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Innovation</h3>
              <p className="text-sm text-muted-foreground">
                We use cutting-edge technology to make finding and booking services fast, easy, and intuitive.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Accessibility</h3>
              <p className="text-sm text-muted-foreground">
                Everyone should have access to professional services, regardless of location or background.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Quality</h3>
              <p className="text-sm text-muted-foreground">
                We ensure every professional on our platform meets rigorous quality standards and customer expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Active Professionals</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100K+</div>
              <p className="text-muted-foreground">Services Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Join the LocalServ Community</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're looking for professional services or want to grow your business, LocalServ is the platform for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/services">
              <Button size="lg" variant="secondary">Browse Services</Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">Get Started</Button>
            </Link>
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
                <li><Link to="/" className="hover:text-foreground">How it Works</Link></li>
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

export default AboutPage;
