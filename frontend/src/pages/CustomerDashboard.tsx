import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, CheckCircle, Clock, Search, MapPin, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [locationSet, setLocationSet] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        // Use geolocation to detect if customer has set a location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // Auto-save customer location
              apiRequest(`/users/${user?.id}/location`, {
                method: "PUT",
                body: JSON.stringify({ latitude, longitude }),
              }).then(() => {
                setLocationSet(true);
              }).catch(() => {
                setLocationSet(false);
              }).finally(() => {
                setLoadingLocation(false);
              });
            },
            () => {
              // No geolocation permission
              setLocationSet(false);
              setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          setLoadingLocation(false);
        }
      } catch {
        setLoadingLocation(false);
      }
    };

    checkLocation();
  }, [user?.id]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await apiRequest<{ bookings: Booking[] }>("/bookings");
        setMyBookings(response.bookings);
      } catch {
        setMyBookings([]);
      }
    };

    loadBookings();
  }, []);

  const activeBookings = myBookings.filter((b) => b.status !== "Completed" && b.status !== "Rejected");
  const completedBookings = myBookings.filter((b) => b.status === "Completed");

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your bookings</p>
      </div>

      {!loadingLocation && !locationSet && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Enable location to help providers find you</p>
            <p className="text-sm text-amber-800 mt-1">Grant location permission so providers can see your address when they accept your booking.</p>
            <Button 
              size="sm" 
              className="mt-2"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      apiRequest(`/users/${user?.id}/location`, {
                        method: "PUT",
                        body: JSON.stringify({ latitude, longitude }),
                      }).then(() => {
                        setLocationSet(true);
                        toast({ title: "Location saved successfully" });
                      }).catch(() => {
                        toast({ title: "Failed to save location", variant: "destructive" });
                      });
                    },
                    () => {
                      toast({ title: "Location permission denied", description: "Please enable location in your browser settings", variant: "destructive" });
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                  );
                }
              }}
            >
              <MapPin className="w-4 h-4 mr-1" /> Enable Location
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Bookings" value={myBookings.length} icon={Calendar} />
        <StatCard title="Active" value={activeBookings.length} icon={Clock} />
        <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
          <Link to="/customer/bookings">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {myBookings.slice(0, 3).map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">by {b.providerName} · {b.bookingDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">₹{b.price}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/services">
          <Button className="gap-2"><Search className="h-4 w-4" /> Browse Services</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
