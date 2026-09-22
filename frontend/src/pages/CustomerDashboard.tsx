import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActionCard } from "@/components/QuickActionCard";
import { BookingStatusTimeline } from "@/components/BookingStatusTimeline";
import { Calendar, CheckCircle, Clock, Search, MapPin, AlertCircle, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [locationSet, setLocationSet] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    // If user already has coordinates saved in profile, no need to prompt
    if (user?.latitude && user?.longitude) {
      setLocationSet(true);
      setLoadingLocation(false);
      return;
    }

    if (!user?.id) {
      setLoadingLocation(false);
      return;
    }

    const saveLocation = (latitude: number, longitude: number) => {
      apiRequest(`/users/${user.id}/location`, {
        method: "PUT",
        body: JSON.stringify({ latitude, longitude }),
      })
        .then(() => setLocationSet(true))
        .catch(() => setLocationSet(false))
        .finally(() => setLoadingLocation(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => saveLocation(pos.coords.latitude, pos.coords.longitude),
        () => {
          setLocationSet(false);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } else {
      setLoadingLocation(false);
    }
  }, [user?.id, user?.latitude, user?.longitude]);

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
  const emergencyBookings = myBookings.filter((b) => isRoadsideCategory(b.serviceName));
  
  // Check for active On-Road booking
  const activeRoadsideBooking = activeBookings.find((b) => isRoadsideCategory(b.serviceName));

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
                if (!user?.id) return;
                if (!navigator.geolocation) {
                  toast({ title: "Geolocation not supported by your browser", variant: "destructive" });
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  ({ coords }) => {
                    apiRequest(`/users/${user.id}/location`, {
                      method: "PUT",
                      body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
                    })
                      .then(() => {
                        setLocationSet(true);
                        toast({ title: "Location saved", description: "Providers can now see your location." });
                      })
                      .catch(() => {
                        toast({ title: "Failed to save location", variant: "destructive" });
                      });
                  },
                  () => {
                    toast({
                      title: "Location permission denied",
                      description: "Enable location in your browser settings and try again.",
                      variant: "destructive",
                    });
                  },
                  { enableHighAccuracy: false, timeout: 8000 }
                );
              }}
            >
              <MapPin className="w-4 h-4 mr-1" /> Enable Location
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={myBookings.length} icon={Calendar} />
        <StatCard title="Active" value={activeBookings.length} icon={Clock} />
        <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
        <StatCard title="Emergency Requests" value={emergencyBookings.length} icon={AlertTriangle} />
      </div>

      {/* Active Roadside Request */}
      {activeRoadsideBooking && (
        <div className="mt-8 rounded-xl border-2 border-orange-200 bg-orange-50 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-orange-900">Active Roadside Request</h2>
              <p className="text-sm text-orange-700">Help is on the way!</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-orange-700">Service</p>
                <p className="font-semibold text-orange-900">{activeRoadsideBooking.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Provider</p>
                <p className="font-semibold text-orange-900">{activeRoadsideBooking.providerName}</p>
              </div>
              <div>
                <p className="text-sm text-orange-700">Status</p>
                <StatusBadge status={activeRoadsideBooking.status} />
              </div>
            </div>
            
            <div className="space-y-3">
              <BookingStatusTimeline currentStatus={activeRoadsideBooking.status} />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-orange-200">
            <Link to={`/customer/bookings/${activeRoadsideBooking.id}`}>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <MapPin className="w-4 h-4" />
                Track Request
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={AlertTriangle}
            title="Emergency Help"
            description="Get immediate roadside assistance"
            onClick={() => navigate("/on-road-services")}
            variant="emergency"
          />
          <QuickActionCard
            icon={Search}
            title="Browse Services"
            description="Find home and on-road services"
            onClick={() => navigate("/services")}
          />
          <QuickActionCard
            icon={Calendar}
            title="My Bookings"
            description="View and manage your bookings"
            onClick={() => navigate("/customer/bookings")}
          />
        </div>
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
            <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
              <div>
                <p className="font-medium text-foreground">{b.serviceName}</p>
                <p className="text-sm text-muted-foreground">by {b.providerName} · {b.bookingDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{formatPrice(b.price)}</span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
          {myBookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No bookings yet. Start by browsing services!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
