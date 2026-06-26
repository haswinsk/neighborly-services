import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Default to Coimbatore, Tamil Nadu, India
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 11.0126,
  longitude: 76.9558,
};

export interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: 'Geolocation not supported',
      });
      toast.error('Geolocation not supported. Using default location.');
      return;
    }

    const timeout = setTimeout(() => {
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: 'Geolocation timeout',
      });
      toast.error('Location detection timed out.');
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        clearTimeout(timeout);
        let errorMessage = 'Permission denied';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timeout';
        }

        // Don't use default location immediately — wait for user action
        setState({
          coordinates: null,
          loading: false,
          error: errorMessage,
        });

        if (error.code === error.PERMISSION_DENIED) {
          toast.info('Enable location permission to see nearby services');
        } else {
          toast.error(`Location error: ${errorMessage}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => clearTimeout(timeout);
  }, []);

  return state;
};

export const getCurrentCoordinates = async (): Promise<Coordinates> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDINATES);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(DEFAULT_COORDINATES);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  });
};
