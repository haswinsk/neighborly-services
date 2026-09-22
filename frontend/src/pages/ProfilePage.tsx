import { FormEvent, useState } from "react";
import { Bell, Loader2, LogOut, MapPin, Shield, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest<{ user: User }>(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
        }),
      });
      toast({ title: "Profile updated", description: "Your account details were saved." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update profile.";
      setError(message);
      toast({ title: "Profile update failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="mt-1 text-muted-foreground">Manage your personal details, saved location, and account preferences.</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Profile information</h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" className="mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" className="mt-2" value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" className="mt-2" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
                </div>
                <div>
                  <Label htmlFor="location">Saved location</Label>
                  <Input id="location" className="mt-2" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Area or locality" />
                </div>
              </div>
            </section>

            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Address</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" className="mt-2" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, landmark, house number" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="mt-2" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" className="mt-2" value={state} onChange={(event) => setState(event.target.value)} placeholder="State" />
                </div>
              </div>
            </section>

            {error && <p className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>

          <aside className="space-y-6">
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Notification preferences</h2>
              </div>
              <div className="mt-5 space-y-4">
                {["Booking updates", "Emergency alerts", "Provider messages"].map((label) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">{label}</span>
                    <Switch checked disabled aria-label={label} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Preference persistence needs a backend settings endpoint.</p>
            </section>

            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Security</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Password changes are not exposed by the current backend routes.</p>
              <Button variant="outline" className="mt-5 w-full" disabled>
                Change Password
              </Button>
            </section>

            <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
