import { useMemo } from 'react';
import { Coordinates } from '@/lib/geolocation';
import { sortByDistance, formatDistance, calculateDistance } from '@/lib/distance';
import { CATEGORIES } from '@/lib/markerIcons';
import { Search, MapPin, Star } from 'lucide-react';

interface Service {
  id: string;
  serviceName: string;
  providerName: string;
  category: string;
  price: number;
  rating: number;
  latitude?: number;
  longitude?: number;
  providerLocation: string;
  image?: string;
  distance?: number;
}

interface MapFiltersProps {
  services: Service[];
  selectedCategory: string | null;
  selectedDistance: number | null;
  searchQuery: string;
  userCoordinates: Coordinates;
  onCategoryChange: (category: string | null) => void;
  onDistanceChange: (distance: number | null) => void;
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

export function MapFilters({
  services,
  selectedCategory,
  selectedDistance,
  searchQuery,
  userCoordinates,
  onCategoryChange,
  onDistanceChange,
  onSearchChange,
  onServiceSelect,
  selectedService,
  compact = false,
}: MapFiltersProps) {
  // Services are already filtered by parent — just sort by distance
  const sortedServices = useMemo(() => {
    return sortByDistance(services, userCoordinates);
  }, [services, userCoordinates]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header / Filters ── */}
      <div className="shrink-0 border-b border-border">
        {/* Title */}
        {!compact && (
          <div className="px-4 pt-4 pb-3 border-b border-border/60">
            <h2 className="text-base font-bold text-foreground">Services Nearby</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Find providers around your location</p>
          </div>
        )}

        <div className="px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search provider or service..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          {/* Category chips — horizontal scroll */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => onCategoryChange(null)}
                className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat === selectedCategory ? null : cat)}
                  className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Distance chips */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Distance</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DISTANCE_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => onDistanceChange(value)}
                  className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    selectedDistance === value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="px-4 py-2 bg-muted/40 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{sortedServices.length}</span>
            {' '}service{sortedServices.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* ── Service list ── */}
      <div className="flex-1 overflow-y-auto">
        {sortedServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No services found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filters or expanding the distance
            </p>
          </div>
        ) : (
          <ul>
            {sortedServices.map((service) => {
              const distance =
                service.latitude && service.longitude
                  ? calculateDistance(userCoordinates, {
                      latitude: service.latitude,
                      longitude: service.longitude,
                    })
                  : null;

              const isSelected = selectedService === service.id;

              return (
                <li key={service.id}>
                  <button
                    onClick={() => onServiceSelect(service.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/60 transition-all duration-150 ${
                      isSelected
                        ? 'bg-primary/5 border-l-[3px] border-l-primary'
                        : 'hover:bg-muted/40 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Provider image or category fallback */}
                      <div className="shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-muted flex items-center justify-center text-lg">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.serviceName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">
                            {getCategoryEmoji(service.category)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-tight truncate">
                          {service.providerName}
                        </p>
                        <p className="text-xs text-primary font-medium truncate mt-0.5">
                          {service.serviceName}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-sm font-bold text-foreground">
                            &#8377;{service.price}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-amber-600">
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Plumbing: '🔧',
    Electrical: '⚡',
    Carpentry: '🔨',
    'AC Repair': '❄️',
    Cleaning: '🧹',
    Tutoring: '📚',
    Painting: '🎨',
    'Pest Control': '🐛',
  };
  return map[category] ?? '📍';
}
