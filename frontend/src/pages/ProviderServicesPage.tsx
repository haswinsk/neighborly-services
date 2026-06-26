import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SERVICE_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const ProviderServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [serviceCity, setServiceCity] = useState("");
  const [serviceState, setServiceState] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await apiRequest<{ services: Service[] }>("/services");
        setServices(response.services);
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, []);

  const myServices = useMemo(() => services.filter((service) => service.providerId === user?.id), [services, user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !category || !description.trim() || !price) {
      toast({ title: "Missing fields", description: "Please complete all service fields", variant: "destructive" });
      return;
    }

    try {
      const response = await apiRequest<{ service: Service }>("/services", {
        method: "POST",
        body: JSON.stringify({
          serviceName,
          category,
          description,
          price: Number(price),
          address: serviceAddress || user?.address || "",
          city: serviceCity || user?.city || "",
          state: serviceState || user?.state || "",
          latitude: user?.latitude,
          longitude: user?.longitude,
        }),
      });

      setServices((prev) => [response.service, ...prev]);
      setServiceName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setServiceAddress("");
      setServiceCity("");
      setServiceState("");
      setShowForm(false);
      toast({ title: "Service saved and visible on map!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save service";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await apiRequest<unknown>(`/services/${serviceId}`, { method: "DELETE" });
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      toast({ title: "Service removed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove service";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Services</h1>
          <p className="mt-1 text-muted-foreground">Manage your service offerings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mt-6 rounded-lg border bg-card p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Service Name</Label>
              <Input className="mt-1" placeholder="e.g. Emergency Plumbing" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" placeholder="Describe your service..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" className="mt-1 w-40" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          {/* Service Location */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Service Location</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Service location will use your provider location by default. Customize if serving a specific area.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Address</Label>
                <Input className="mt-1" placeholder={user?.address || "Your address"} value={serviceAddress} onChange={(e) => setServiceAddress(e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input className="mt-1" placeholder={user?.city || "City"} value={serviceCity} onChange={(e) => setServiceCity(e.target.value)} />
              </div>
              <div>
                <Label>State</Label>
                <Input className="mt-1" placeholder={user?.state || "State"} value={serviceState} onChange={(e) => setServiceState(e.target.value)} />
              </div>
            </div>

            {/* Location Map Preview */}
            {user?.latitude && user?.longitude && (
              <div className="mt-4">
                <Label className="mb-2 block">Your Service Location Preview</Label>
                <div className="h-48 rounded-lg border overflow-hidden bg-background">
                  <MapContainer center={[user.latitude, user.longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                    <Marker position={[user.latitude, user.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{serviceAddress || user.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {!user?.latitude || !user?.longitude ? (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">No location set</p>
                  <p className="text-xs">Please set your provider location in your profile to show services on the map.</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button type="submit">Save Service</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {myServices.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card p-5">
            <div>
              <span className="text-xs font-medium text-primary">{s.category}</span>
              <p className="font-semibold text-foreground">{s.serviceName}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{s.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-foreground">₹{s.price}</span>
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProviderServicesPage;
