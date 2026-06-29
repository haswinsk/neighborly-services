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
    coordinates: DEFAULT_COORDINATES,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('[v0] Geolocation not supported, using default location');
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[v0] Geolocation success:', position.coords);
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
        console.log('[v0] Geolocation error:', error.code, error.message);
        let errorMessage = 'Permission denied';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timeout';
        }

        // Always fall back to default location on error
        setState({
          coordinates: DEFAULT_COORDINATES,
          loading: false,
          error: errorMessage,
        });

        if (error.code === error.PERMISSION_DENIED) {
          toast.info('Using default location - enable permission for nearby services');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 0,
      }
    );
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
