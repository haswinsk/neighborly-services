import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapBox } from '../components/MapBox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { Star, MapPin, Phone, Calendar } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  service: string;
  category: string;
  latitude: number;
  longitude: number;
  rating: number;
  price: number;
  availability: string;
  distance?: number;
}

interface BookingData {
  serviceId: string;
  bookingDate: string;
}

export const MapPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({ serviceId: '', bookingDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location and fetch providers
  useEffect(() => {
    const getLocationAndProviders = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            fetchProviders(latitude, longitude);
          },
          () => {
            // Default location if permission denied
            fetchProviders(40.7128, -74.006);
          }
        );
      } else {
        fetchProviders(40.7128, -74.006);
      }
    };

    getLocationAndProviders();
  }, []);

  const fetchProviders = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await apiRequest<{ providers: Provider[] }>('/providers', {
        params: {
          userLat: lat,
          userLon: lng,
          maxDistance: 10,
          sortBy: 'distance',
        },
      });
      setProviders(response.providers);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedProvider || !bookingData.bookingDate || !isAuthenticated) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest('/bookings', {
        method: 'POST',
        body: {
          serviceId: selectedProvider.id,
          bookingDate: bookingData.bookingDate,
        },
      });

      alert('Booking successful!');
      setSelectedProvider(null);
      setBookingData({ serviceId: '', bookingDate: '' });
      navigate('/customer/bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign in to book services</h1>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      ) : (
        <MapBox providers={providers} onProviderSelect={setSelectedProvider} />
      )}

      <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
        <DialogContent className="max-w-md">
          {selectedProvider && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProvider.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedProvider.service}</p>
                  <p className="text-xs text-muted-foreground">{selectedProvider.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{selectedProvider.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₹{selectedProvider.price}</span>
                  </div>
                </div>

                {selectedProvider.distance && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedProvider.distance.toFixed(1)} km away</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold block mb-2">Booking Date</label>
                  <Input
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, bookingDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs font-semibold mb-1">Total Price</p>
                  <p className="text-lg font-bold">₹{selectedProvider.price}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProvider(null)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={submitting || !bookingData.bookingDate}
                    className="flex-1"
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
