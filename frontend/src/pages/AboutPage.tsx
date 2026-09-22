import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, MapPin, ShieldCheck, Users, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CustomerFooter, SectionHeader } from "@/components/customer/CustomerUI";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="border-b bg-white dark:bg-card">
          <div className="container py-14 text-center md:py-20">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Built for nearby help
            </div>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              About Neighbourly Services
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We connect customers with approved local providers for home services and emergency on-road assistance, with clear discovery, map-first context, and booking status in one place.
            </p>
          </div>
        </section>

        <section className="container py-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Our mission"
                title="Make local services feel reliable, transparent, and close by."
                description="Neighbourly Services is designed around trust: approved providers, visible service details, status tracking, and urgent road support that is visually distinct when customers need fast help."
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/services">
                  <Button>Browse Services</Button>
                </Link>
                <Link to="/on-road-services">
                  <Button variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
                    <AlertTriangle className="h-4 w-4" />
                    On-Road Assistance
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Verified network", text: "Customer discovery shows approved providers from the existing backend." },
                { icon: MapPin, title: "Location aware", text: "Map-based service discovery helps customers compare nearby options." },
                { icon: Zap, title: "Emergency ready", text: "Roadside requests use clear orange/red actions for urgent scenarios." },
                { icon: Users, title: "Community trust", text: "Ratings, provider details, and booking history create confidence." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-lg border bg-white dark:bg-card p-5 shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="mt-4 font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y bg-white dark:bg-card">
          <div className="container grid gap-4 py-10 sm:grid-cols-3">
            {["Approved providers", "Transparent booking status", "Roadside assistance flow"].map((label) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border bg-slate-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default AboutPage;
