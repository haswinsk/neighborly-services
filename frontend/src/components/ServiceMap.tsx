import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Coordinates } from '@/lib/geolocation';
import { calculateDistance, formatDistance } from '@/lib/distance';
import {
  createCategoryMarker,
  createUserMarker,
  createCustomerMarker,
  getCategoryColor,
} from '@/lib/markerIcons';
import { MapPin, Navigation, Star, IndianRupee, RefreshCw } from 'lucide-react';

export interface ServiceMapService {
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

interface ServiceMapProps {
  services: ServiceMapService[];
  userCoordinates: Coordinates;
  /** When set, shows a green "customer" marker at these coords (used in provider view) */
  customerCoordinates?: Coordinates | null;
  selectedService?: string;
  focusLocation?: Coordinates & { customerName?: string };
  onMarkerClick?: (serviceId: string) => void;
  onBookNow?: (serviceId: string) => void;
}

// ── Focus on customer location from booking ────────────────────────────────
function FocusLocationMarker({
  focusLocation,
}: {
  focusLocation?: Coordinates & { customerName?: string };
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusLocation) return;

    // Fly to customer location
    map.flyTo([focusLocation.latitude, focusLocation.longitude], 16, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [focusLocation, map]);

  return null;
}

// ── Focus on selected service marker with smooth animation ─────────────────
function FocusMarker({
  selectedService,
  services,
}: {
  selectedService?: string;
  services: ServiceMapService[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedService) return;

    const service = services.find((s) => s.id === selectedService);
    if (!service || !service.latitude || !service.longitude) return;

    // Smooth pan and zoom to selected marker
    map.flyTo([service.latitude, service.longitude], 16, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [selectedService, services, map]);

  return null;
}

// ── Routing polyline between customer and provider ─────────────────────────
function RoutingLine({
  customerCoords,
  providerCoords,
}: {
  customerCoords?: Coordinates | null;
  providerCoords?: Coordinates | null;
}) {
  if (!customerCoords || !providerCoords) return null;

  const positions: [number, number][] = [
    [customerCoords.latitude, customerCoords.longitude],
    [providerCoords.latitude, providerCoords.longitude],
  ];

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '8, 4',
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}

// ── Re-fit bounds whenever the visible service set changes ──────────────────
function FitBounds({
  userCoords,
  services,
  customerCoords,
}: {
  userCoords: Coordinates;
  services: ServiceMapService[];
  customerCoords?: Coordinates | null;
}) {
  const map = useMap();
  const prevKeyRef = useRef('');

  useEffect(() => {
    const ids = services
      .filter((s) => s.latitude && s.longitude)
      .map((s) => s.id)
      .sort()
      .join(',');
    const key = `${userCoords.latitude},${userCoords.longitude}|${ids}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    const positions: [number, number][] = [
      [userCoords.latitude, userCoords.longitude],
    ];
    if (customerCoords) {
      positions.push([customerCoords.latitude, customerCoords.longitude]);
    }
    services.forEach((s) => {
      if (s.latitude && s.longitude) positions.push([s.latitude, s.longitude]);
    });

    if (positions.length > 1) {
      // Show all markers - never zoom out beyond minZoom 12
      map.fitBounds(L.latLngBounds(positions), {
        animate: true,
        padding: [50, 50],
        maxZoom: 15,
        minZoom: 12,
      });
    } else {
      // Single location - zoom to street level
      map.setView([userCoords.latitude, userCoords.longitude], 14, {
        animate: true,
      });
    }
  }, [userCoords, services, customerCoords, map]);

  return null;
}

// ── Map controls: Locate Me + Reset ────────────────────────────────────────
function MapControls({
  userCoordinates,
  services,
}: {
  userCoordinates: Coordinates;
  services: ServiceMapService[];
}) {
  const map = useMap();

  const handleLocateMe = () => {
    map.setView([userCoordinates.latitude, userCoordinates.longitude], 15, {
      animate: true,
    });
  };

  const handleReset = () => {
    const positions: [number, number][] = [
      [userCoordinates.latitude, userCoordinates.longitude],
    ];
    services.forEach((s) => {
      if (s.latitude && s.longitude) positions.push([s.latitude, s.longitude]);
    });
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions).pad(0.2), {
        animate: true,
        maxZoom: 15,
      });
    }
  };

  return (
    <div className="absolute bottom-20 right-3 z-[400] flex flex-col gap-2">
      <button
        onClick={handleLocateMe}
        className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl p-2.5 shadow-lg transition-all"
        title="Centre on my location"
        aria-label="Centre on my location"
      >
        <Navigation className="w-5 h-5" />
      </button>
      <button
        onClick={handleReset}
        className="bg-slate-600 hover:bg-slate-700 active:scale-95 text-white rounded-xl p-2.5 shadow-lg transition-all"
        title="Fit all markers"
        aria-label="Fit all markers"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Professional provider popup ─────────────────────────────────────────────
function ServicePopup({
  service,
  userCoordinates,
  onBookNow,
}: {
  service: ServiceMapService;
  userCoordinates: Coordinates;
  onBookNow?: (id: string) => void;
}) {
  const distance =
    service.latitude && service.longitude
      ? calculateDistance(userCoordinates, {
          latitude: service.latitude,
          longitude: service.longitude,
        })
      : null;

  const color = getCategoryColor(service.category);
  const abbr = service.category.slice(0, 2).toUpperCase();

  return (
    <div className="w-64 font-sans">
      {/* Header */}
      <div
        className="rounded-t-lg px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: color }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">{abbr}</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">
            {service.providerName}
          </p>
          <p className="text-white/80 text-xs truncate">{service.serviceName}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5 bg-white rounded-b-lg">
        {/* Category + Rating */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {service.category}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            {service.rating.toFixed(1)}
            {service.reviewCount ? (
              <span className="text-gray-400 font-normal">({service.reviewCount})</span>
            ) : null}
          </span>
        </div>

        {/* Location + Distance */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{service.providerLocation || 'Location set'}</span>
          {distance !== null && (
            <span className="ml-auto shrink-0 font-semibold text-blue-600">
              {formatDistance(distance)}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-1 text-base font-bold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          {service.price}
          <span className="text-xs font-normal text-gray-500">/hr</span>
        </div>

        {/* Book Now */}
        <button
          onClick={() => onBookNow?.(service.id)}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-95 hover:brightness-110"
          style={{ backgroundColor: color }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function ServiceMap({
  services,
  userCoordinates,
  customerCoordinates,
  selectedService,
  focusLocation,
  onMarkerClick,
  onBookNow,
}: ServiceMapProps) {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[userCoordinates.latitude, userCoordinates.longitude]}
        zoom={14}
        className="h-full w-full"
        style={{ zIndex: 0 }}
        zoomControl={false}
        minZoom={12}
        maxZoom={19}
        maxBounds={[
          [10.5, 75.5],  // Southwest corner (Coimbatore region)
          [11.5, 77.0],  // Northeast corner (Coimbatore region)
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Re-fit whenever service set changes */}
        <FitBounds
          userCoords={userCoordinates}
          services={services}
          customerCoords={customerCoordinates}
        />

        {/* Focus on selected provider with smooth animation */}
        <FocusMarker selectedService={selectedService} services={services} />

        {/* Focus on customer location from booking (when provider clicks "See Location") */}
        <FocusLocationMarker focusLocation={focusLocation} />

        {/* Show routing line from customer to selected provider (provider view) */}
        {selectedService && customerCoordinates && (
          <RoutingLine
            customerCoords={customerCoordinates}
            providerCoords={
              services.find((s) => s.id === selectedService)?.latitude && 
              services.find((s) => s.id === selectedService)?.longitude
                ? {
                    latitude: services.find((s) => s.id === selectedService)?.latitude!,
                    longitude: services.find((s) => s.id === selectedService)?.longitude!,
                  }
                : undefined
            }
          />
        )}

        {/* My location (blue) */}
        <Marker
          position={[userCoordinates.latitude, userCoordinates.longitude]}
          icon={createUserMarker()}
        >
          <Popup>
            <div className="text-sm font-semibold text-gray-800">Your Location</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {userCoordinates.latitude.toFixed(4)}, {userCoordinates.longitude.toFixed(4)}
            </div>
          </Popup>
        </Marker>

        {/* Customer location (green) — shown when provider views the map */}
        {customerCoordinates && (
          <Marker
            position={[customerCoordinates.latitude, customerCoordinates.longitude]}
            icon={createCustomerMarker()}
          >
            <Popup>
              <div className="text-sm font-semibold text-gray-800">Customer Location</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {customerCoordinates.latitude.toFixed(4)}, {customerCoordinates.longitude.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Service provider markers */}
        {services.map((service) => {
          if (!service.latitude || !service.longitude) return null;

          return (
            <Marker
              key={service.id}
              position={[service.latitude, service.longitude]}
              icon={createCategoryMarker(
                service.category,
                selectedService === service.id ? 'selected' : undefined
              )}
              eventHandlers={{ click: () => onMarkerClick?.(service.id) }}
            >
              <Popup minWidth={256} maxWidth={280}>
                <ServicePopup
                  service={service}
                  userCoordinates={userCoordinates}
                  onBookNow={onBookNow}
                />
              </Popup>
            </Marker>
          );
        })}

        <MapControls userCoordinates={userCoordinates} services={services} />
      </MapContainer>
    </div>
  );
}
