import { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from '@/lib/geocoding';

interface Service {
  id: string;
  serviceName: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
}

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  avatar: string;
  distance: string;
  servicesProvided: Service[];
}

interface NearbyProvidersProps {
  latitude: number;
  longitude: number;
  radius?: number;
  category?: string;
  onProviderSelect?: (provider: Provider) => void;
}

export const NearbyProviders = ({
  latitude,
  longitude,
  radius = 15,
  category,
  onProviderSelect,
}: NearbyProvidersProps) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNearbyProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          radius: radius.toString(),
        });

        if (category) {
          params.append('category', category);
        }

        const response = await fetch(`/api/users/nearby-providers?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch nearby providers');
        }

        const data = await response.json();
        setProviders(data.providers || []);

        if (data.providers.length === 0) {
          toast({
            title: 'No providers found',
            description: `No providers found within ${radius}km radius`,
            variant: 'default',
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch providers';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyProviders();
  }, [latitude, longitude, radius, category, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Finding nearby providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-900">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center p-8">
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">No providers found in this area</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Nearby Providers ({providers.length})
      </h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Provider Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                  {provider.avatar ? (
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {provider.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{provider.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium text-primary">{provider.distance}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">
                  {provider.address}, {provider.city}
                </span>
              </div>
            </div>

            {/* Services */}
            <div className="p-4 border-b border-gray-200 max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold text-foreground mb-2">Services</p>
              <div className="space-y-2">
                {provider.servicesProvided.slice(0, 2).map((service) => (
                  <div key={service.id} className="text-xs">
                    <p className="font-medium text-foreground line-clamp-1">
                      {service.serviceName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-semibold">₹{service.price}</span>
                      {service.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="text-foreground">{service.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({service.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {provider.servicesProvided.length > 2 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{provider.servicesProvided.length - 2} more services
                </p>
              )}
            </div>

            {/* Contact */}
            <div className="p-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${provider.phone}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {provider.phone}
              </a>
            </div>

            {/* Action Button */}
            <div className="p-4 border-t border-gray-200">
              <Button
                size="sm"
                className="w-full"
                onClick={() => onProviderSelect?.(provider)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
