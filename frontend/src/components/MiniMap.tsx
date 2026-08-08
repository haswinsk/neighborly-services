/**
 * MiniMap — a small non-interactive map that shows one or two pins.
 * Used in booking cards so providers see the customer location
 * and customers see the provider location.
 */
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createUserMarker, createCustomerMarker } from '@/lib/markerIcons';
import { MapPin } from 'lucide-react';

export interface MiniMapPin {
  latitude: number;
  longitude: number;
  label: string;
  type: 'user' | 'customer';
}

interface MiniMapProps {
  pins: MiniMapPin[];
  /** height in pixels — default 160 */
  height?: number;
}

export function MiniMap({ pins, height = 160 }: MiniMapProps) {
  if (pins.length === 0) return null;

  const center: [number, number] = [pins[0].latitude, pins[0].longitude];
  const zoom = 14;

  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pins.map((pin, i) => (
          <Marker
            key={i}
            position={[pin.latitude, pin.longitude]}
            icon={pin.type === 'customer' ? createCustomerMarker() : createUserMarker()}
          >
            <Popup>{pin.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/** Inline location badge — shown when no coordinates are available */
export function LocationBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
      <MapPin className="w-3.5 h-3.5 text-gray-400" />
      <span>{label}</span>
    </div>
  );
}
