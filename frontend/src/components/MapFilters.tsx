import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, IndianRupee, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Coordinates } from '@/lib/geolocation';
import { sortByDistance, calculateDistance, formatDistance } from '@/lib/distance';
import { getCategoryColor } from '@/lib/markerIcons';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  serviceName: string;
  providerName: string;
  category: string;
  price: number;
  rating: number;
  reviewCount?: number;
  latitude?: number | null;
  longitude?: number | null;
  providerLocation?: string;
  image?: string;
}

interface MapFiltersProps {
  /** Already-filtered services to display */
  services: Service[];
  /** Full unfiltered set — used to derive category chips so they never disappear */
  allServices?: Service[];
  selectedCategory: string | null;
  selectedDistance: number | null;
  selectedRating?: number | null;
  selectedPrice?: number | null;
  sortBy?: string;
  searchQuery: string;
  userCoordinates: Coordinates;
  onCategoryChange: (category: string | null) => void;
  onDistanceChange: (distance: number | null) => void;
  onRatingChange?: (rating: number | null) => void;
  onPriceChange?: (price: number | null) => void;
  onSortChange?: (sort: string) => void;
  onSearchChange: (query: string) => void;
  onServiceSelect: (serviceId: string) => void;
  selectedService?: string;
  compact?: boolean;
}

const DISTANCE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'All distances', value: null },
  { label: 'Within 1 km', value: 1 },
  { label: 'Within 3 km', value: 3 },
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
];

const RATING_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any rating', value: null },
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4 },
  { label: '3.5+', value: 3.5 },
];

const PRICE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any price', value: null },
  { label: 'Under Rs. 300', value: 300 },
  { label: 'Under Rs. 600', value: 600 },
  { label: 'Under Rs. 1000', value: 1000 },
];

export function MapFilters({
  services,
  allServices,
  selectedCategory,
  selectedDistance,
  selectedRating,
  selectedPrice,
  sortBy = 'distance',
  searchQuery,
  userCoordinates,
  onCategoryChange,
  onDistanceChange,
  onRatingChange,
  onPriceChange,
  onSortChange,
  onSearchChange,
  onServiceSelect,
  selectedService,
}: MapFiltersProps) {
  // Derive unique categories from the full set so chips never disappear
  const categories = useMemo(() => {
    const source = allServices ?? services;
    return Array.from(new Set(source.map((s) => s.category))).sort();
  }, [allServices, services]);

  const sortedServices = useMemo(() => {
    const byDistance = sortByDistance(services, userCoordinates);
    if (sortBy === 'rating') return [...byDistance].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'price-low') return [...byDistance].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return [...byDistance].sort((a, b) => b.price - a.price);
    return byDistance;
  }, [services, userCoordinates, sortBy]);

  return (
    <div className="bg-card h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0 space-y-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Services Nearby</h2>
          <p className="text-xs text-muted-foreground">Find providers around your location</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search provider or service..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            aria-label="Search services"
          />
        </div>

        {/* Category chips */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Category</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => onCategoryChange(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-muted-foreground text-white shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const color = getCategoryColor(cat);
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(active ? null : cat)}
                  className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={
                    active
                      ? { backgroundColor: color, color: 'white', boxShadow: `0 2px 8px ${color}55` }
                      : { backgroundColor: `${color}18`, color }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance chips */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Distance</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DISTANCE_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onDistanceChange(value)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDistance === value
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Rating</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {RATING_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => onRatingChange?.(value)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedRating === value
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRICE_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => onPriceChange?.(value)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedPrice === value
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Sort
          </span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange?.(event.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Sort services"
          >
            <option value="distance">Nearest first</option>
            <option value="rating">Highest rated</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
          </select>
        </label>
      </div>

      {/* ── Count ── */}
      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border shrink-0">
        {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} found
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {sortedServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No services found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or expanding the distance</p>
          </div>
        ) : (
          sortedServices.map((service) => {
            const distance =
              service.latitude && service.longitude
                ? calculateDistance(userCoordinates, {
                    latitude: service.latitude,
                    longitude: service.longitude,
                  })
                : null;
            const color = getCategoryColor(service.category);
            const abbr = service.category.slice(0, 2).toUpperCase();
            const isSelected = selectedService === service.id;

            return (
              <article
                key={service.id}
                className={`w-full text-left p-4 border-b border-border transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500'
                    : 'hover:bg-muted border-l-4 border-l-transparent'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    console.log('[v0] Service selected in MapFilters:', service.id, service);
                    onServiceSelect(service.id);
                  }}
                  className="w-full text-left"
                >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {abbr}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{service.providerName}</p>
                    <p className="text-xs text-muted-foreground truncate mb-2" style={{ color }}>{service.serviceName}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-foreground">
                    <IndianRupee className="w-3 h-3" />
                    {service.price}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                        {service.rating.toFixed(1)}
                      </span>
                      {distance !== null && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {formatDistance(distance)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                </button>

                {/* View Details Button */}
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="w-full justify-between text-xs font-medium text-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Link to={`/services/${service.id}`}>
                      View Details
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
