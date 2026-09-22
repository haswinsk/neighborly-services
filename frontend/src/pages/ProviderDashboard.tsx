import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  MapPin,
  Navigation,
  ClipboardList,
  Wrench,
  User,
  RefreshCw,
  Power,
  Loader2
} from "lucide-react";
import { formatPrice, isRoadsideCategory } from "@/components/customer/CustomerUI";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState({
    grossEarnings: 0,
    adminCommissionRate: 0,
    adminCommissionTotal: 0,
    netEarnings: 0,
    completedJobsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, earningsRes] = await Promise.all([
        apiRequest<{ bookings: Booking[] }>("/bookings"),
        apiRequest<{
          grossEarnings: number;
          adminCommissionRate: number;
          adminCommissionTotal: number;
          netEarnings: number;
          completedJobsCount: number;
        }>("/bookings/earnings/summary"),
      ]);
      setBookings(bookingsRes.bookings);
      setEarnings(earningsRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleAvailability = async () => {
    if (!user) return;
    setTogglingAvailability(true);
    try {
      const res = await apiRequest<{ user: any }>(`/users/${user.id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: !user.isAvailable }),
      });
      // Reflect the change immediately in auth context
      updateUser({ isAvailable: res.user?.isAvailable ?? !user.isAvailable });
      toast({
        title: !user.isAvailable ? "You're now available" : "You're now offline",
        description: !user.isAvailable
          ? "You'll receive new service requests"
          : "You won't receive new service requests",
      });
    } catch (err) {
      toast({
        title: "Failed to update availability",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setTogglingAvailability(false);
    }
  };

  // Calculate stats
  const today = new Date().toDateString();
  const todayBookings = bookings.filter(b => new Date(b.createdAt).toDateString() === today);
  const activeBookings = bookings.filter(b => 
    b.status === "Accepted" || 
    b.status === "On The Way" || 
    b.status === "Arrived" || 
    b.status === "In Progress"
  );
  const completedBookings = bookings.filter(b => b.status === "Completed");
  const todayCompleted = completedBookings.filter(b => new Date(b.createdAt).toDateString() === today);
  const todayEarnings = todayCompleted.reduce((sum, b) => sum + b.price, 0);

  // Get active job (most recent active booking)
  const activeJob = activeBookings.length > 0 ? activeBookings[0] : null;

  // Get recent requests (Requested status)
  const recentRequests = bookings.filter(b => b.status === "Requested").slice(0, 3);

  // Get recent completed jobs
  const recentCompleted = completedBookings.slice(0, 3);

  // Calculate average rating from completed bookings
  const providerRating = user?.rating || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Provider'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {user?.isAvailable ? (
                <span className="flex items-center gap-1.5 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Available for new requests
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Offline - not receiving requests
                </span>
              )}
            </p>
          </div>
          
          {/* Availability Toggle */}
          <Button
            onClick={toggleAvailability}
            disabled={togglingAvailability}
            variant={user?.isAvailable ? "default" : "outline"}
            className={user?.isAvailable ? "bg-green-600 hover:bg-green-700" : ""}
            size="lg"
          >
            {togglingAvailability ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.isAvailable ? (
              <>
                <Power className="w-4 h-4 mr-2" />
                Available
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Go Online
              </>
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Today's Jobs" value={todayBookings.length} icon={Calendar} />
          <StatCard title="Active Jobs" value={activeBookings.length} icon={Clock} />
          <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
          <StatCard 
            title="Today's Earnings" 
            value={formatPrice(todayEarnings)} 
            icon={DollarSign} 
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard 
            title="Total Earnings" 
            value={formatPrice(earnings.netEarnings)} 
            icon={DollarSign} 
          />
          <StatCard 
            title="Average Rating" 
            value={providerRating.toFixed(1)} 
            icon={TrendingUp} 
          />
          <StatCard 
            title="Total Jobs" 
            value={earnings.completedJobsCount} 
            icon={ClipboardList} 
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/provider/requests")}
          >
            <ClipboardList className="w-5 h-5" />
            <span>View Requests</span>
          </Button>
          {activeJob ? (
            <Button
              className="h-auto py-4 flex-col gap-2 bg-primary"
              onClick={() => navigate("/provider/active")}
            >
              <Navigation className="w-5 h-5" />
              <span>Active Job</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 opacity-50"
              disabled
            >
              <Navigation className="w-5 h-5" />
              <span>No Active Job</span>
            </Button>
          )}
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/provider/services")}
          >
            <Wrench className="w-5 h-5" />
            <span>My Services</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/provider/earnings")}
          >
            <DollarSign className="w-5 h-5" />
            <span>Earnings</span>
          </Button>
        </div>

        {/* Active Job Section */}
        {activeJob && (
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Active Job</h2>
              <Button
                size="sm"
                onClick={() => navigate("/provider/active")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Details
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">{activeJob.customerName}</p>
                  <p className="text-sm text-blue-700">{activeJob.serviceName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <MapPin className="w-4 h-4" />
                <span>{activeJob.customerCity || "Customer location"}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeJob.status} />
                <span className="text-sm text-blue-700">{formatPrice(activeJob.price)}</span>
              </div>
              {isRoadsideCategory(activeJob.serviceName) && (
                <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Emergency Request</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Requests */}
        {recentRequests.length > 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">New Requests</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/provider/requests")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentRequests.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/provider/requests/${booking.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isRoadsideCategory(booking.serviceName) && (
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-sm font-semibold text-foreground">{formatPrice(booking.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Completed Jobs */}
        {recentCompleted.length > 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recently Completed</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/provider/bookings")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentCompleted.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatPrice(booking.price)}</p>
                    <p className="text-xs text-muted-foreground">{booking.bookingDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">No bookings yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              When customers book your services, they'll appear here
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
