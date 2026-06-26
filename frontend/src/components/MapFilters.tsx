import { useMemo } from 'react';
import { Coordinates } from '@/lib/geolocation';
import {
  sortByDistance,
  calculateDistance,
  formatDistance,
} from '@/lib/distance';
import { CATEGORIES } from '@/lib/markerIcons';

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
}

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
}: MapFiltersProps) {
  const filteredAndSortedServices = useMemo(() => {
    let filtered = services.filter((service) => {
      // Filter by category
      if (selectedCategory && service.category !== selectedCategory) {
        return false;
      }

      // Filter by distance
      if (selectedDistance && service.latitude && service.longitude) {
        const distance = calculateDistance(userCoordinates, {
          latitude: service.latitude,
          longitude: service.longitude,
        });
        if (distance > selectedDistance) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          service.providerName.toLowerCase().includes(query) ||
          service.serviceName.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Sort by distance
    return sortByDistance(filtered, userCoordinates);
  }, [services, selectedCategory, selectedDistance, searchQuery, userCoordinates]);

  return (
    <div className="bg-white h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold mb-4">Services Nearby</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search provider or service..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Category Filter */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Category</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onCategoryChange(null)}
              className={`text-left px-3 py-2 text-sm rounded-md transition ${
                selectedCategory === null
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Services
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`text-left px-3 py-2 text-sm rounded-md transition ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Filter */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Distance</p>
          <div className="flex flex-col gap-1">
            {[null, 1, 3, 5, 10].map((distance) => (
              <button
                key={distance || 'all'}
                onClick={() => onDistanceChange(distance)}
                className={`text-left px-3 py-2 text-sm rounded-md transition ${
                  selectedDistance === distance
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {distance ? `Within ${distance} km` : 'All distances'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 pt-3 text-xs text-gray-600">
        {filteredAndSortedServices.length} service{filteredAndSortedServices.length !== 1 ? 's' : ''} found
      </div>

      {/* Service List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedServices.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No services found matching your criteria.
          </div>
        ) : (
          filteredAndSortedServices.map((service) => {
            const distance = service.latitude && service.longitude
              ? calculateDistance(userCoordinates, {
                  latitude: service.latitude,
                  longitude: service.longitude,
                })
              : null;

            return (
              <button
                key={service.id}
                onClick={() => onServiceSelect(service.id)}
                className={`w-full text-left px-4 py-3 border-b transition ${
                  selectedService === service.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-3">
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {service.providerName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {service.serviceName}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-semibold text-gray-700">
                        ₹{service.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-xs">⭐ {service.rating.toFixed(1)}</span>
                        {distance && (
                          <span className="text-xs text-gray-500">
                            {formatDistance(distance)}
                          </span>
                        )}
                      </span>
                    </div>
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
