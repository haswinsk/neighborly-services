import { Link } from "react-router-dom";
import type React from "react";
import { LucideIcon, AlertCircle, ArrowRight, Inbox, Loader2, MapPin, Star, ShieldCheck, Wrench, HelpCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ROADSIDE_CATEGORIES = [
  "Bike Puncture",
  "Car Puncture",
  "Battery Jump Start",
  "Fuel Assistance",
  "Breakdown Repair",
  "Towing",
] as const;

export const isRoadsideCategory = (name?: string) =>
  !!name && ROADSIDE_CATEGORIES.includes(name as (typeof ROADSIDE_CATEGORIES)[number]);

export const formatPrice = (price?: number | null) =>
  typeof price === "number" ? `Rs. ${price.toLocaleString("en-IN")}` : "Price on request";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
        <Wrench className="h-5 w-5" />
      </span>
      {!compact && <span className="text-lg font-bold text-foreground">Neighbourly Services</span>}
    </span>
  );
}

export function CustomerFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-8 py-10 text-sm lg:grid-cols-[1.3fr_0.9fr_0.9fr_1fr]">
        <div>
          <Link to="/" className="inline-flex">
            <BrandMark />
          </Link>
          <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
            Trusted local home services and on-road assistance from nearby verified providers.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">Customers</h3>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <Link to="/services" className="block transition-colors hover:text-foreground">Find Services</Link>
            <Link to="/on-road-services" className="block transition-colors hover:text-foreground">On-Road Assistance</Link>
            <Link to="/customer/bookings" className="block transition-colors hover:text-foreground">My Bookings</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">Company</h3>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <Link to="/about" className="block transition-colors hover:text-foreground">About</Link>
            <Link to="/register" className="block transition-colors hover:text-foreground">Become a Provider</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">Support</h3>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <Link to="/about" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
              <HelpCircle className="h-4 w-4" />
              Help Center
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
              <Phone className="h-4 w-4" />
              Contact
            </Link>
            <Link to="/on-road-services/request">
              <Button className="mt-2 bg-orange-600 hover:bg-orange-700">Emergency Assistance</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t bg-muted/50 py-4 text-center text-xs text-muted-foreground">
        © 2026 Neighbourly Services. All rights reserved.
      </div>
    </footer>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Unable to load this page",
  description = "Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-200">{title}</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{description}</p>
          {onRetry && (
            <Button size="sm" variant="outline" className="mt-3 bg-card" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border bg-card p-8 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ProviderSummaryCard({
  providerName,
  serviceName,
  category,
  rating,
  reviewCount,
  price,
  location,
  distance,
  isActive,
  onSelect,
  detailsHref,
}: {
  providerName: string;
  serviceName: string;
  category: string;
  rating: number;
  reviewCount?: number;
  price: number;
  location?: string;
  distance?: string;
  isActive?: boolean;
  onSelect?: () => void;
  detailsHref: string;
}) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md",
        isActive && "border-primary bg-blue-50/60 dark:bg-blue-950/30",
      )}
    >
      <button type="button" className="w-full text-left" onClick={onSelect}>
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
            {providerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">{providerName}</h3>
                <p className="truncate text-sm text-muted-foreground">{serviceName}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-foreground">{formatPrice(price)}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-1 font-medium text-primary">{category}</span>
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                {rating.toFixed(1)} {reviewCount ? `(${reviewCount})` : ""}
              </span>
              {location && (
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{distance ? `${distance} away` : location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
      <Link to={detailsHref} className="mt-4 inline-flex w-full">
        <Button variant="outline" size="sm" className="w-full justify-between">
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </article>
  );
}
