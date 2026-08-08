import { formatDistance, calculateDistance } from '@/lib/distance';
import { Coordinates } from '@/lib/geolocation';

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
  reviewCount?: number;
}

interface ProviderPopupProps {
  service: Service;
  userCoordinates: Coordinates;
  onBookClick?: (serviceId: string) => void;
}

export function ProviderPopup({
  service,
  userCoordinates,
  onBookClick,
}: ProviderPopupProps) {
  const distance = service.latitude && service.longitude
    ? calculateDistance(userCoordinates, {
        latitude: service.latitude,
        longitude: service.longitude,
      })
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      {service.image && (
        <img
          src={service.image}
          alt={service.serviceName}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}

      <div className="space-y-2">
        <h3 className="font-bold text-lg text-gray-900">{service.providerName}</h3>

        <p className="text-sm text-gray-600">{service.serviceName}</p>

        <div className="flex items-center justify-between">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            {service.category}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold">
            ⭐ {service.rating.toFixed(1)}
            {service.reviewCount && (
              <span className="text-gray-500 font-normal">({service.reviewCount})</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
          <span className="text-sm text-gray-700">
            {service.providerLocation}
          </span>
          {distance && (
            <span className="text-sm font-semibold text-blue-600">
              {formatDistance(distance)}
            </span>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-2 my-2">
          <p className="text-lg font-bold text-gray-900">₹{service.price}</p>
          <p className="text-xs text-gray-600">Starting price per hour</p>
        </div>

        <button
          onClick={() => onBookClick?.(service.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
