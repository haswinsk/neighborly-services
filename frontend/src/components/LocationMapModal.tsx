import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X, AlertCircle } from "lucide-react";
import { calculateDistance } from "@/lib/distance";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationMapModalProps {
  open: boolean;
  onClose: () => void;
  customerLocation?: Coordinates;
  providerLocation?: Coordinates;
  customerName?: string;
  serviceName?: string;
  customerCity?: string;
}

export function LocationMapModal({
  open,
  onClose,
  customerLocation,
  providerLocation,
  customerName,
  serviceName,
  customerCity,
}: LocationMapModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  const distance =
    customerLocation && providerLocation
      ? calculateDistance(providerLocation, customerLocation)
      : null;

  useEffect(() => {
    if (!open || !mapContainer.current) return;

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
      }).addTo(map.current);
    }

    // Clear existing markers and polylines
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current?.removeLayer(layer);
      }
    });

    const markers: L.LatLng[] = [];

    // Add provider location marker if available
    if (providerLocation && Number.isFinite(providerLocation.latitude) && Number.isFinite(providerLocation.longitude)) {
      const providerIcon = L.icon({
        iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%233B82F6' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(L.latLng(providerLocation.latitude, providerLocation.longitude), {
        icon: providerIcon,
      })
        .bindPopup("<strong>Your Location</strong>")
        .addTo(map.current);

      markers.push(L.latLng(providerLocation.latitude, providerLocation.longitude));
    }

    // Add customer location marker if available
    if (customerLocation && Number.isFinite(customerLocation.latitude) && Number.isFinite(customerLocation.longitude)) {
      const customerIcon = L.icon({
        iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23EF4444' stroke='white' stroke-width='2'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const popup = `
        <div class="text-sm font-semibold">${customerName || "Customer"}</div>
        ${serviceName ? `<div class="text-xs text-gray-600 dark:text-gray-300">${serviceName}</div>` : ""}
        ${customerCity ? `<div class="text-xs text-gray-600 dark:text-gray-300">${customerCity}</div>` : ""}
      `;

      L.marker(L.latLng(customerLocation.latitude, customerLocation.longitude), { icon: customerIcon })
        .bindPopup(popup)
        .addTo(map.current);

      markers.push(L.latLng(customerLocation.latitude, customerLocation.longitude));
    }

    // Add route line if both locations available
    if (markers.length === 2) {
      const polyline = L.polyline(markers, {
        color: "#3B82F6",
        weight: 3,
        opacity: 0.7,
        dashArray: "10, 10",
      }).addTo(map.current);
    }

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, customerLocation, providerLocation, customerName, serviceName, customerCity]);

  const openInMaps = () => {
    if (customerLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.latitude},${customerLocation.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">Customer & Provider Location</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {customerName && `Customer: ${customerName}`}
                {serviceName && ` · Service: ${serviceName}`}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative">
          <div ref={mapContainer} className="h-[400px] w-full" />

          {/* Location info overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {customerLocation ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium">Customer Location</p>
                      <p className="text-xs text-muted-foreground">
                        {customerName || "Customer"}
                        {customerCity && ` · ${customerCity}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">Customer location unavailable</p>
                  </div>
                )}

                {providerLocation ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Your Location</p>
                      <p className="text-xs text-muted-foreground">
                        {providerLocation.latitude.toFixed(4)}, {providerLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">Your location unavailable</p>
                  </div>
                )}

                {distance !== null && (
                  <div className="flex items-center gap-2 pt-1">
                    <Navigation className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-primary">{distance.toFixed(1)} km away</p>
                  </div>
                )}
              </div>

              {customerLocation && (
                <Button size="sm" variant="outline" onClick={openInMaps} className="gap-2 shrink-0">
                  <MapPin className="w-4 h-4" />
                  Open in Maps
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
