import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProviderCustomerMap } from "@/components/ProviderCustomerMap";
import { calculateDistance } from "@/lib/distance";
import { apiRequest } from "@/lib/api";
import { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProviderCustomerMapPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerLocation, setProviderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const selectedBookingId = searchParams.get("bookingId") || undefined;

  // Prepare customer pins for map
  const customerPins = useMemo(() => {
    return bookings
      .filter((b) => b.customerLatitude && b.customerLongitude)
      .map((b) => ({
        latitude: b.customerLatitude!,
        longitude: b.customerLongitude!,
        customerName: b.customerName,
        bookingId: b.id,
        serviceName: b.serviceName,
        distance: providerLocation
          ? calculateDistance(providerLocation, {
              latitude: b.customerLatitude!,
              longitude: b.customerLongitude!,
            })
          : undefined,
      }));
  }, [bookings, providerLocation]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load bookings
        const bookingsRes = await apiRequest<{ bookings: Booking[] }>("/bookings");
        setBookings(bookingsRes.bookings);

        // Load provider location
        const userRes = await apiRequest<{ user: any }>("/auth/me");
        if (userRes.user?.latitude && userRes.user?.longitude) {
          setProviderLocation({
            latitude: userRes.user.latitude,
            longitude: userRes.user.longitude,
          });
        }
      } catch (err) {
        console.error("Failed to load map data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/provider/bookings")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customer Locations</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {customerPins.length} customers on map
              </p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-hidden">
          {customerPins.length > 0 ? (
            <ProviderCustomerMap
              customerPins={customerPins}
              providerLocation={providerLocation || undefined}
              selectedBooking={selectedBookingId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">No customers on the map yet</p>
                <p className="text-sm mt-2">Bookings with customer locations will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderCustomerMapPage;
