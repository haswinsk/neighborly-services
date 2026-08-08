/**
 * ProviderLocationForm
 * Allows the provider to set their service location via:
 *  1. Browser GPS "Detect Location" button
 *  2. Clicking anywhere on the Leaflet map
 *  3. Dragging the marker to the correct spot
 *  4. Manually typing the address (forward-geocoded via Nominatim)
 */
import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader2, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocationWithAddress, forwardGeocode, LocationData } from '@/lib/geocoding';
import { createUserMarker } from '@/lib/markerIcons';
import { DEFAULT_COORDINATES } from '@/lib/geolocation';
import { apiRequest } from '@/lib/api';

interface ProviderLocationFormProps {
  onLocationSaved?: (location: LocationData) => void;
  initialLocation?: LocationData;
}

// Sub-component: handles map click + draggable marker
function DraggableMarker({
  position,
  onMove,
}: {
  position: [number, number];
  onMove: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  const markerRef = useCallback(
    (marker: L.Marker | null) => {
      if (!marker) return;
      marker.on('dragend', () => {
        const latlng = marker.getLatLng();
        onMove(latlng.lat, latlng.lng);
      });
    },
    [onMove]
  );

  return (
    <Marker
      position={position}
      icon={createUserMarker()}
      draggable
      ref={markerRef}
    />
  );
}

export const ProviderLocationForm = ({
  onLocationSaved,
  initialLocation,
}: ProviderLocationFormProps) => {
  const [location, setLocation] = useState<LocationData>(
    initialLocation || {
      latitude: DEFAULT_COORDINATES.latitude,
      longitude: DEFAULT_COORDINATES.longitude,
      address: '',
      city: '',
      state: '',
      country: 'India',
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const hasCoords = !!(location.latitude && location.longitude);

  // ── GPS Detect ──────────────────────────────────────────────
  const handleDetectLocation = async () => {
    setIsLoading(true);
    try {
      const locationData = await getCurrentLocationWithAddress(true);
      if (locationData) {
        setLocation(locationData);
        setErrors({});
        toast({ title: 'Location detected', description: `${locationData.city}, ${locationData.state}` });
      } else {
        toast({ title: 'Location detection failed', description: 'Please set it on the map manually', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to detect location', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Map click / drag ─────────────────────────────────────────
  const handleMapMove = useCallback(async (lat: number, lng: number) => {
    // Reverse-geocode to get address from coordinates
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        setLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: data.display_name?.split(',').slice(0, 3).join(',').trim() || prev.address,
          city: addr.city || addr.town || addr.village || addr.county || prev.city,
          state: addr.state || prev.state,
          country: addr.country || prev.country,
        }));
      } else {
        setLocation((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } catch {
      setLocation((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    }
  }, []);

  // ── Address text change ───────────────────────────────────────
  const handleAddressChange = async (address: string) => {
    setLocation((prev) => ({ ...prev, address }));
    if (address.length > 5) {
      try {
        const result = await forwardGeocode(address);
        if (result) {
          setLocation(result);
          setErrors({});
        }
      } catch {
        // silent
      }
    }
  };

  // ── Validation ────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!location.address.trim()) newErrors.address = 'Address is required';
    if (!location.city.trim()) newErrors.city = 'City is required';
    if (!location.latitude || !location.longitude) newErrors.coordinates = 'Please pin your location on the map';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Save to backend ───────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await apiRequest(`/users/${localStorage.getItem('userId')}/location`, {
        method: 'PUT',
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
        }),
      });
      toast({ title: 'Location saved', description: 'Your service location has been updated' });
      onLocationSaved?.(location);
    } catch {
      toast({ title: 'Error', description: 'Failed to save location', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const markerPosition: [number, number] = hasCoords
    ? [location.latitude, location.longitude]
    : [DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Service Location
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {isLoading ? 'Detecting...' : 'Detect GPS'}
        </Button>
      </div>

      {/* Interactive Map */}
      <div className="h-64 w-full relative">
        <MapContainer
          center={markerPosition}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <DraggableMarker position={markerPosition} onMove={handleMapMove} />
        </MapContainer>
        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-600 shadow">
          Click on the map or drag the pin to set your location
        </div>
      </div>

      {/* Form fields */}
      <div className="px-6 py-5 space-y-4">
        {/* Coordinates pill */}
        {hasCoords && (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            <MapPin className="w-3 h-3" />
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </div>
        )}

        {errors.coordinates && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {errors.coordinates}
          </p>
        )}

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
          <div className="relative mt-1.5">
            <Input
              id="address"
              placeholder="Enter your service address"
              value={location.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={errors.address ? 'border-red-500' : ''}
              aria-invalid={!!errors.address}
            />
            {!errors.address && location.address && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
          </div>
          {errors.address && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />{errors.address}
            </p>
          )}
        </div>

        {/* City + State row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city" className="text-sm font-semibold">City</Label>
            <div className="relative mt-1.5">
              <Input
                id="city"
                placeholder="City"
                value={location.city}
                onChange={(e) => setLocation((p) => ({ ...p, city: e.target.value }))}
                className={errors.city ? 'border-red-500' : ''}
              />
              {!errors.city && location.city && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            {errors.city && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />{errors.city}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="state" className="text-sm font-semibold">State</Label>
            <Input
              id="state"
              placeholder="State"
              value={location.state}
              onChange={(e) => setLocation((p) => ({ ...p, state: e.target.value }))}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Save Button */}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving || !hasCoords}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Location
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
