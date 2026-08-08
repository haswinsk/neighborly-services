import { useMemo } from 'react';
import { Search, MapPin, Star, IndianRupee } from 'lucide-react';
import { Coordinates } from '@/lib/geolocation';
import { sortByDistance, calculateDistance, formatDistance } from '@/lib/distance';
import { getCategoryColor } from '@/lib/markerIcons';

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
  allServices,
  selectedCategory,
  selectedDistance,
  searchQuery,
  userCoordinates,
  onCategoryChange,
  onDistanceChange,
  onSearchChange,
  onServiceSelect,
  selectedService,
}: MapFiltersProps) {
  // Derive unique categories from the full set so chips never disappear
  const categories = useMemo(() => {
    const source = allServices ?? services;
    return Array.from(new Set(source.map((s) => s.category))).sort();
  }, [allServices, services]);

  // Sort visible services by distance
  const sortedServices = useMemo(
    () => sortByDistance(services, userCoordinates),
    [services, userCoordinates]
  );

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0 space-y-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Services Nearby</h2>
          <p className="text-xs text-gray-500">Find providers around your location</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search provider or service..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            aria-label="Search services"
          />
        </div>

        {/* Category chips */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => onCategoryChange(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-gray-800 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Distance</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DISTANCE_OPTIONS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => onDistanceChange(value)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDistance === value
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Count ── */}
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 shrink-0">
        {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} found
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {sortedServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">No services found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters or expanding the distance</p>
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
              <button
                key={service.id}
                onClick={() => {
                  console.log('[v0] Service selected in MapFilters:', service.id, service);
                  onServiceSelect(service.id);
                }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: color }}
                >
                  {abbr}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{service.providerName}</p>
                  <p className="text-xs text-gray-500 truncate" style={{ color }}>{service.serviceName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-800">
                      <IndianRupee className="w-3 h-3" />
                      {service.price}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      {service.rating.toFixed(1)}
                    </span>
                    {distance !== null && (
                      <span className="text-xs text-gray-400 ml-auto">{formatDistance(distance)}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
