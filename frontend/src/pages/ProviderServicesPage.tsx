import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SERVICE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, MapPin, AlertCircle, Loader2, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { reverseGeocode } from "@/lib/geocoding";
import { createCategoryMarker } from "@/lib/markerIcons";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  state: string;
}

// Add native Leaflet zoom control to the map
function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const ctrl = L.control.zoom({ position: 'bottomright' });
    ctrl.addTo(map);
    return () => { ctrl.remove(); };
  }, [map]);
  return null;
}

// Click-to-place / drag-to-move marker component inside the map
function DraggableMarker({
  position,
  onMove,
}: {
  position: [number, number] | null;
  onMove: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  // Allow clicking anywhere on the map to place the marker
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable
      ref={markerRef}
      icon={L.divIcon({
        html: `<div style="
          width:32px;height:32px;background:#f97316;border:3px solid white;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) {
            const { lat, lng } = m.getLatLng();
            onMove(lat, lng);
          }
        },
      }}
    >
      <Popup>Drag me to adjust your service location</Popup>
    </Marker>
  );
}

const DEFAULT_MAP_CENTER: [number, number] = [11.0126, 76.9558]; // Coimbatore

const ProviderServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: "",
    city: "",
    state: "",
  });
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest<{ services: Service[] }>("/services");
        setServices(res.services);
      } catch {
        setServices([]);
      }
    };
    load();
  }, []);

  // Pre-fill location with provider's stored coordinates when form opens
  useEffect(() => {
    if (showForm && user?.latitude && user?.longitude) {
      setLocation({
        latitude: user.latitude,
        longitude: user.longitude,
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
      });
    }
  }, [showForm, user]);

  const myServices = useMemo(
    () => services.filter((s) => s.providerId === user?.id),
    [services, user?.id]
  );

  const mapCenter: [number, number] =
    location.latitude && location.longitude
      ? [location.latitude, location.longitude]
      : user?.latitude && user?.longitude
      ? [user.latitude, user.longitude]
      : DEFAULT_MAP_CENTER;

  // When user drops / clicks the map — reverse geocode the coords
  const handleMarkerMove = async (lat: number, lng: number) => {
    setLocation((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setIsReverseGeocoding(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      if (addr) {
        setLocation((prev) => ({
          ...prev,
          address: addr.address || prev.address,
          city: addr.city || prev.city,
          state: addr.state || prev.state,
        }));
      }
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Use device GPS to snap to current location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleMarkerMove(pos.coords.latitude, pos.coords.longitude).finally(() =>
          setIsLocating(false)
        );
      },
      () => {
        setIsLocating(false);
        toast({ title: "Could not detect location", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !category || !description.trim() || !price) {
      toast({
        title: "Missing fields",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const body: Record<string, unknown> = {
        serviceName,
        category,
        description,
        price: Number(price),
        address: location.address || user?.address || "",
        city: location.city || user?.city || "",
        state: location.state || user?.state || "",
      };

      if (location.latitude !== null && location.longitude !== null) {
        body.latitude = location.latitude;
        body.longitude = location.longitude;
      }

      const response = await apiRequest<{ service: Service }>("/services", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setServices((prev) => [response.service, ...prev]);
      resetForm();
      toast({ title: "Service saved!", description: "Your service is now visible on the map." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to save service";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await apiRequest<unknown>(`/services/${serviceId}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast({ title: "Service removed" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to remove service";
      toast({ title: "Delete failed", description: msg, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setServiceName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setLocation({ latitude: null, longitude: null, address: "", city: "", state: "" });
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Services</h1>
          <p className="mt-1 text-muted-foreground">Manage your service offerings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-xl border bg-card p-6 space-y-6 shadow-sm"
        >
          {/* Service details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Service Name</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Emergency Plumbing"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-1"
              placeholder="Describe your service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Price (&#8377; per hour)</Label>
            <Input
              type="number"
              min={0}
              className="mt-1 w-40"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Location section */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Service Location</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Click on the map or drag the pin to set your exact service location. The address will fill automatically.
            </p>

            {/* Address fields (auto-filled by reverse geocoding) */}
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              <div className="sm:col-span-3">
                <Label className="text-xs">Address</Label>
                <div className="relative mt-1">
                  <Input
                    placeholder="Click the map to auto-fill"
                    value={location.address}
                    onChange={(e) =>
                      setLocation((p) => ({ ...p, address: e.target.value }))
                    }
                    className="pr-8"
                  />
                  {isReverseGeocoding && (
                    <Loader2 className="absolute right-2 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs">City</Label>
                <Input
                  className="mt-1"
                  placeholder="City"
                  value={location.city}
                  onChange={(e) => setLocation((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">State</Label>
                <Input
                  className="mt-1"
                  placeholder="State"
                  value={location.state}
                  onChange={(e) => setLocation((p) => ({ ...p, state: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="w-full gap-1.5"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  {isLocating ? "Locating..." : "Use My GPS"}
                </Button>
              </div>
            </div>

            {/* Coordinates badge */}
            {location.latitude !== null && location.longitude !== null && (
              <p className="text-xs text-muted-foreground mb-3">
                Coordinates:{" "}
                <span className="font-mono text-primary">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </span>
              </p>
            )}

            {/* Interactive map */}
            <div className="h-56 sm:h-72 rounded-lg overflow-hidden border border-border shadow-sm">
              <MapContainer
                center={mapCenter}
                zoom={14}
                zoomControl={false}
                style={{ height: "100%", width: "100%", background: "#e8f4f8" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                  noWrap
                />
                <ZoomControl />
                <DraggableMarker
                  position={
                    location.latitude !== null && location.longitude !== null
                      ? [location.latitude, location.longitude]
                      : null
                  }
                  onMove={handleMarkerMove}
                />
              </MapContainer>
            </div>

            {/* No-location warning */}
            {location.latitude === null && !user?.latitude && (
              <div className="mt-3 flex gap-2 items-start p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Click the map above or use GPS to set your service location so customers can find you.</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button type="submit">Save Service</Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Services list */}
      <div className="mt-6 space-y-3">
        {myServices.length === 0 && !showForm && (
          <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No services yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &ldquo;Add Service&rdquo; to create your first listing
            </p>
          </div>
        )}
        {myServices.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="min-w-0 flex-1 pr-4">
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-1">
                {s.category}
              </span>
              <p className="font-semibold text-foreground">{s.serviceName}</p>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
              {(s.latitude || s.city) && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  {s.city || "Location set"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg font-bold text-foreground">&#8377;{s.price}</span>
              <Button variant="ghost" size="icon" disabled aria-label="Edit service">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(s.id)}
                aria-label="Delete service"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProviderServicesPage;
