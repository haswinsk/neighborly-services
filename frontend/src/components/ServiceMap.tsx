import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Coordinates } from '@/lib/geolocation';
import { calculateDistance, formatDistance } from '@/lib/distance';
import { createCategoryMarker, createUserMarker } from '@/lib/markerIcons';
import { Navigation, RotateCcw } from 'lucide-react';

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
}

interface ServiceMapProps {
  services: Service[];
  userCoordinates: Coordinates;
  selectedService?: string;
  onMarkerClick?: (serviceId: string) => void;
  onLocationUpdate?: (coordinates: Coordinates) => void;
}

// Keeps the map view synced when userCoordinates prop changes (e.g. after locate-me)
function SyncView({ coords }: { coords: Coordinates }) {
  const map = useMap();
  const prevRef = useRef<Coordinates | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    // Only pan when the coordinates actually changed
    if (
      !prev ||
      prev.latitude !== coords.latitude ||
      prev.longitude !== coords.longitude
    ) {
      map.setView([coords.latitude, coords.longitude], map.getZoom(), { animate: true });
      prevRef.current = coords;
    }
  }, [coords, map]);

  return null;
}

// Fit map to show both user and all visible provider markers
function FitBounds({ userCoords, services }: { userCoords: Coordinates; services: Service[] }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (fittedRef.current) return;

    const positions: [number, number][] = [
      [userCoords.latitude, userCoords.longitude],
    ];

    services.forEach((s) => {
      if (s.latitude && s.longitude) {
        positions.push([s.latitude, s.longitude]);
      }
    });

    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds.pad(0.2), { animate: true, maxZoom: 14 });
      fittedRef.current = true;
    }
  }, [userCoords, services, map]);

  return null;
}

// Map control buttons: Locate Me + Reset View
function MapControls({
  userCoordinates,
  services,
  onLocationUpdate,
}: {
  userCoordinates: Coordinates;
  services: Service[];
  onLocationUpdate?: (coords: Coordinates) => void;
}) {
  const map = useMap();

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      map.setView([userCoordinates.latitude, userCoordinates.longitude], 14, { animate: true });
      return;
    }

    const succeed = (lat: number, lng: number) => {
      map.setView([lat, lng], 14, { animate: true });
      onLocationUpdate?.({ latitude: lat, longitude: lng });
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => succeed(pos.coords.latitude, pos.coords.longitude),
      () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => succeed(pos.coords.latitude, pos.coords.longitude),
          () => map.setView([userCoordinates.latitude, userCoordinates.longitude], 14, { animate: true }),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  const handleResetView = () => {
    const positions: [number, number][] = [
      [userCoordinates.latitude, userCoordinates.longitude],
    ];
    services.forEach((s) => {
      if (s.latitude && s.longitude) positions.push([s.latitude, s.longitude]);
    });

    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions).pad(0.2), { animate: true, maxZoom: 14 });
    } else {
      map.setView([userCoordinates.latitude, userCoordinates.longitude], 13, { animate: true });
    }
  };

  return (
    <div className="absolute bottom-8 right-3 z-[999] flex flex-col gap-2">
      <button
        onClick={handleLocateMe}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200 active:scale-95"
        title="Locate me"
        aria-label="Locate me"
      >
        <Navigation className="w-4 h-4" />
      </button>
      <button
        onClick={handleResetView}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200 transition-all duration-200 active:scale-95"
        title="Reset view"
        aria-label="Reset view"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ServiceMap({
  services,
  userCoordinates,
  selectedService,
  onMarkerClick,
  onLocationUpdate,
}: ServiceMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-none md:rounded-none">
      <MapContainer
        center={[userCoordinates.latitude, userCoordinates.longitude]}
        zoom={13}
        minZoom={3}
        maxZoom={18}
        zoomControl={false}
        className="h-full w-full"
        style={{ zIndex: 0, background: '#e8f4f8' }}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />

        {/* Keep view synced with live GPS updates */}
        <SyncView coords={userCoordinates} />

        {/* Auto-fit bounds on first load */}
        <FitBounds userCoords={userCoordinates} services={services} />

        {/* Blue pulse dot — customer location */}
        <Marker
          key="user-location"
          position={[userCoordinates.latitude, userCoordinates.longitude]}
          icon={createUserMarker()}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="text-center px-1">
              <p className="font-semibold text-sm text-gray-900">Your Location</p>
            </div>
          </Popup>
        </Marker>

        {/* Orange provider markers */}
        {services.map((service) => {
          if (!service.latitude || !service.longitude) return null;

          const distance = calculateDistance(userCoordinates, {
            latitude: service.latitude,
            longitude: service.longitude,
          });

          const isSelected = selectedService === service.id;

          return (
            <Marker
              key={service.id}
              position={[service.latitude, service.longitude]}
              icon={createCategoryMarker(service.category, isSelected ? 'selected' : undefined)}
              zIndexOffset={isSelected ? 500 : 0}
              eventHandlers={{ click: () => onMarkerClick?.(service.id) }}
            >
              <Popup maxWidth={240}>
                <div className="w-52">
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="w-full h-28 object-cover rounded-md mb-2"
                    />
                  )}
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{service.providerName}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{service.serviceName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{service.category}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600">
                      <strong>{formatDistance(distance)}</strong> away
                    </span>
                    <span className="text-xs font-medium text-amber-600">
                      &#9733; {service.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1">&#8377;{service.price}<span className="text-xs font-normal text-gray-500">/hr</span></p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapControls
          userCoordinates={userCoordinates}
          services={services}
          onLocationUpdate={onLocationUpdate}
        />
      </MapContainer>
    </div>
  );
}
