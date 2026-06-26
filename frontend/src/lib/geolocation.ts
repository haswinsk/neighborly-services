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
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: 'Geolocation not supported',
      });
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isAborted = false;

    const handleTimeout = () => {
      if (!isAborted) {
        setState({
          coordinates: DEFAULT_COORDINATES,
          loading: false,
          error: 'Location request timed out',
        });
        isAborted = true;
      }
    };

    // Single timeout: 10 seconds for high accuracy GPS
    timeoutId = setTimeout(handleTimeout, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        if (!isAborted) {
          setState({
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            loading: false,
            error: null,
          });
          isAborted = true;
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        if (!isAborted) {
          // Immediately use default on any error
          setState({
            coordinates: DEFAULT_COORDINATES,
            loading: false,
            error: `Location unavailable: ${error.message}`,
          });
          isAborted = true;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    return () => {
      clearTimeout(timeoutId);
      isAborted = true;
    };
  }, []);

  return state;
};

export const getCurrentCoordinates = async (): Promise<Coordinates> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDINATES);
      return;
    }

    const timeoutId = setTimeout(() => {
      resolve(DEFAULT_COORDINATES);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(timeoutId);
        resolve(DEFAULT_COORDINATES);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
};
