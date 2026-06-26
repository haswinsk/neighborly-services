import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Coordinates } from '@/lib/geolocation';
import { calculateDistance } from '@/lib/distance';
import {
  createCategoryMarker,
  createUserMarker,
} from '@/lib/markerIcons';

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

// Map controls component
function MapControls({ userCoordinates, onLocationUpdate }: { userCoordinates: Coordinates; onLocationUpdate?: (coordinates: Coordinates) => void }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add scale control
    L.control.scale({ position: 'bottomleft' }).addTo(map);
  }, [map]);

  const handleLocateMe = async () => {
    if (isLocating) return;
    
    setIsLocating(true);
    try {
      if (navigator.geolocation) {
        // Try high accuracy first
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLat = position.coords.latitude;
            const newLng = position.coords.longitude;
            console.log('[v0] Locate me found GPS:', newLat, newLng);
            
            map.setView([newLat, newLng], 13, {
              animate: true,
              duration: 0.5,
            });
            
            // Notify parent component of new location
            if (onLocationUpdate) {
              onLocationUpdate({ latitude: newLat, longitude: newLng });
            }
            
            setIsLocating(false);
          },
          (error) => {
            console.log('[v0] Locate me GPS error:', error.code);
            // Fallback to lower accuracy
            navigator.geolocation.getCurrentPosition(
              (fallbackPosition) => {
                const newLat = fallbackPosition.coords.latitude;
                const newLng = fallbackPosition.coords.longitude;
                console.log('[v0] Locate me fallback GPS:', newLat, newLng);
                
                map.setView([newLat, newLng], 13, {
                  animate: true,
                  duration: 0.5,
                });
                
                // Notify parent component of new location
                if (onLocationUpdate) {
                  onLocationUpdate({ latitude: newLat, longitude: newLng });
                }
                
                setIsLocating(false);
              },
              () => {
                console.log('[v0] All locate me attempts failed');
                // Use stored coordinates
                map.setView([userCoordinates.latitude, userCoordinates.longitude], 13, {
                  animate: true,
                  duration: 0.5,
                });
                setIsLocating(false);
              },
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
            );
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        map.setView([userCoordinates.latitude, userCoordinates.longitude], 13, {
          animate: true,
          duration: 0.5,
        });
        setIsLocating(false);
      }
    } catch (error) {
      console.log('[v0] Locate me error:', error);
      setIsLocating(false);
    }
  };

  const handleResetView = () => {
    const allLocations = [
      [userCoordinates.latitude, userCoordinates.longitude] as [number, number],
    ];
    
    // Add all service locations to bounds
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer !== map) {
        const latLng = layer.getLatLng();
        allLocations.push([latLng.lat, latLng.lng] as [number, number]);
      }
    });

    if (allLocations.length > 0) {
      const bounds = L.latLngBounds(allLocations);
      map.fitBounds(bounds.pad(0.1), { animate: true, duration: 0.5 });
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-400 flex flex-col gap-2">
      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className={`rounded-lg p-2 shadow-lg transition ${
          isLocating
            ? 'bg-blue-400 cursor-not-allowed opacity-75'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        title={isLocating ? 'Finding your location...' : 'Locate me'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-6 h-6 ${isLocating ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19l-7-7m0 0a9 9 0 1118 0m0 0a9 9 0 01-18 0m0 0l7 7m4-7h-7v7m0-11V5m0 0h7"
          />
        </svg>
      </button>
      <button
        onClick={handleResetView}
        className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-2 shadow-lg transition"
        title="Reset view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
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
  const [centerCoords, setCenterCoords] = useState<[number, number]>([
    userCoordinates.latitude,
    userCoordinates.longitude,
  ]);

  useEffect(() => {
    setCenterCoords([userCoordinates.latitude, userCoordinates.longitude]);
  }, [userCoordinates]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={centerCoords}
        zoom={13}
        minZoom={2}
        maxZoom={18}
        className="h-full w-full"
        style={{ zIndex: 0 }}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />

        {/* User Location Marker - uniquely keyed to prevent duplication */}
        <Marker key="user-marker" position={centerCoords} icon={createUserMarker()}>
          <Popup>Your Location</Popup>
        </Marker>

        {/* Service Provider Markers */}
        {services.map((service) => {
          if (!service.latitude || !service.longitude) {
            return null;
          }

          const distance = calculateDistance(userCoordinates, {
            latitude: service.latitude,
            longitude: service.longitude,
          });

          return (
            <Marker
              key={service.id}
              position={[service.latitude, service.longitude]}
              icon={createCategoryMarker(
                service.category,
                selectedService === service.id ? 'selected' : undefined
              )}
              eventHandlers={{
                click: () => onMarkerClick?.(service.id),
              }}
            >
              <Popup>
                <div className="w-60">
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-sm">{service.providerName}</h3>
                  <p className="text-xs text-gray-600">{service.serviceName}</p>
                  <p className="text-xs text-gray-500">{service.category}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs">
                      <strong>{distance.toFixed(1)} km</strong> away
                    </span>
                    <span className="text-xs font-semibold">⭐ {service.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs mt-2 font-semibold">₹{service.price}/hr</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapControls userCoordinates={userCoordinates} onLocationUpdate={onLocationUpdate} />
      </MapContainer>
    </div>
  );
}
