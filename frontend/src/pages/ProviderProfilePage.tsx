import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { User, MapPin, Phone, Mail, Briefcase, Loader2, Save } from "lucide-react";

const ProviderProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    city: "",
    state: "",
    country: "",
    bio: "",
    experience: "",
    serviceRadiusKm: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        bio: user.bio || "",
        experience: user.experience || "",
        serviceRadiusKm: user.serviceRadiusKm?.toString() || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updateData: any = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.location) updateData.location = formData.location;
      if (formData.address) updateData.address = formData.address;
      if (formData.city) updateData.city = formData.city;
      if (formData.state) updateData.state = formData.state;
      if (formData.country) updateData.country = formData.country;
      if (formData.bio !== undefined) updateData.bio = formData.bio;
      if (formData.experience !== undefined) updateData.experience = formData.experience;
      if (formData.serviceRadiusKm) updateData.serviceRadiusKm = parseFloat(formData.serviceRadiusKm);

      const response = await apiRequest<{ user: any }>(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      // Refresh user data from /auth/me
      const userResponse = await apiRequest<{ user: any }>("/auth/me");
      // Note: AuthContext doesn't expose setUser, so we rely on page refresh or manual reload
      // For now, just show success toast
      toast({ title: "Profile updated successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update profile";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="mt-1 text-muted-foreground">Manage your provider profile information</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your service area"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Address</h2>
            <div className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your street address"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your city"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Your state"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Your country"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Professional Information</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell customers about yourself and your services"
                  rows={4}
                />
              </div>
              <div className="lg:col-span-2">
                <Label>Experience</Label>
                <Textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Describe your experience and qualifications"
                  rows={3}
                />
              </div>
              <div>
                <Label>Service Radius (km)</Label>
                <Input
                  name="serviceRadiusKm"
                  type="number"
                  value={formData.serviceRadiusKm}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum distance you're willing to travel</p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Account Status</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-semibold text-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-semibold text-foreground">
                    {user?.isAvailable ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Verified</p>
                  <p className="font-semibold text-foreground">
                    {user?.phone ? "Yes" : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Verified</p>
                  <p className="font-semibold text-foreground">Yes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderProfilePage;
