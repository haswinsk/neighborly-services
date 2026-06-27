import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface CustomerPin {
  latitude: number;
  longitude: number;
  customerName: string;
  bookingId: string;
  serviceName: string;
  distance?: number;
}

interface ProviderCustomerMapProps {
  customerPins: CustomerPin[];
  providerLocation?: Coordinates;
  selectedBooking?: string;
}

export function ProviderCustomerMap({
  customerPins,
  providerLocation,
  selectedBooking,
}: ProviderCustomerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if not already initialized
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [providerLocation?.latitude || 11.0, providerLocation?.longitude || 76.9],
        13
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 4,
        maxBounds: [
          [5.0, 65.0],
          [35.0, 100.0],
        ],
        maxBoundsViscosity: 1.0,
      }).addTo(map.current);
    }

    // Clear existing markers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

    // Add provider location marker if available
    if (providerLocation) {
      const providerIcon = L.icon({
        iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%233B82F6' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/svg%3E",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([providerLocation.latitude, providerLocation.longitude], {
        icon: providerIcon,
      })
        .bindPopup("<strong>Your Location</strong>")
        .addTo(map.current);
    }

    // Add customer location markers
    customerPins.forEach((pin) => {
      const isSelected = selectedBooking === pin.bookingId;
      const customerIcon = L.icon({
        iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23${isSelected ? '10B981' : 'EF4444'}' stroke='white' stroke-width='2'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const popup = `
        <div class="text-sm font-semibold">${pin.customerName}</div>
        <div class="text-xs text-gray-600">${pin.serviceName}</div>
        ${pin.distance ? `<div class="text-xs text-gray-600">${pin.distance.toFixed(1)} km away</div>` : ""}
      `;

      L.marker([pin.latitude, pin.longitude], { icon: customerIcon })
        .bindPopup(popup)
        .addTo(map.current);
    });

    // Fit bounds to show all markers
    if (customerPins.length > 0) {
      const bounds = L.latLngBounds(
        customerPins.map((pin) => [pin.latitude, pin.longitude])
      );

      if (providerLocation) {
        bounds.extend([providerLocation.latitude, providerLocation.longitude]);
      }

      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (providerLocation) {
      map.current.setView(
        [providerLocation.latitude, providerLocation.longitude],
        14
      );
    }
  }, [customerPins, providerLocation, selectedBooking]);

  return (
    <div
      ref={mapContainer}
      className="h-full w-full rounded-lg border border-border shadow-sm"
      style={{ minHeight: "400px" }}
    />
  );
}
