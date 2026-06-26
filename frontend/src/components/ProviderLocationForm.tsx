import { useState } from 'react';
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocationWithAddress, forwardGeocode, LocationData } from '@/lib/geocoding';

interface ProviderLocationFormProps {
  onLocationSaved?: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export const ProviderLocationForm = ({
  onLocationSaved,
  initialLocation,
}: ProviderLocationFormProps) => {
  const [location, setLocation] = useState<LocationData>(
    initialLocation || {
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      state: '',
      country: 'India',
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleDetectLocation = async () => {
    setIsLoading(true);
    try {
      const locationData = await getCurrentLocationWithAddress(true);
      if (locationData) {
        setLocation(locationData);
        setErrors({});
        toast({
          title: 'Location detected',
          description: `${locationData.city}, ${locationData.state}`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Location detection failed',
          description: 'Please enter your location manually',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to detect location',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = async (address: string) => {
    setLocation({ ...location, address });
    
    if (address.length > 3) {
      try {
        const result = await forwardGeocode(address);
        if (result) {
          setLocation(result);
          setErrors({});
        }
      } catch (error) {
        console.error('[v0] Geocoding error:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!location.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!location.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!location.latitude || !location.longitude) {
      newErrors.coordinates = 'Valid coordinates are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${localStorage.getItem('userId')}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      toast({
        title: 'Location saved successfully',
        description: 'Your service location has been updated',
        variant: 'default',
      });

      onLocationSaved?.(location);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save location',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Service Location
      </h2>

      <div className="space-y-5">
        {/* Address Field */}
        <div>
          <Label htmlFor="address" className="text-sm font-semibold">
            Address
          </Label>
          <div className="relative mt-2">
            <Input
              id="address"
              placeholder="Enter your service address"
              value={location.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={`input-modern w-full ${
                errors.address ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              aria-invalid={!!errors.address}
            />
            {!errors.address && location.address && (
              <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
            )}
          </div>
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.address}
            </p>
          )}
        </div>

        {/* City Field */}
        <div>
          <Label htmlFor="city" className="text-sm font-semibold">
            City
          </Label>
          <div className="relative mt-2">
            <Input
              id="city"
              placeholder="City"
              value={location.city}
              onChange={(e) => setLocation({ ...location, city: e.target.value })}
              className={`input-modern w-full ${
                errors.city ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              aria-invalid={!!errors.city}
            />
            {!errors.city && location.city && (
              <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
            )}
          </div>
          {errors.city && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.city}
            </p>
          )}
        </div>

        {/* State Field */}
        <div>
          <Label htmlFor="state" className="text-sm font-semibold">
            State
          </Label>
          <Input
            id="state"
            placeholder="State"
            value={location.state}
            onChange={(e) => setLocation({ ...location, state: e.target.value })}
            className="mt-2 input-modern"
          />
        </div>

        {/* Coordinates Display */}
        {location.latitude && location.longitude && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Coordinates</p>
            <p className="text-xs text-blue-600">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          </div>
        )}

        {errors.coordinates && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.coordinates}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDetectLocation}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Detect Location
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !location.latitude}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Location'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
