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
      console.log('[v0] Geolocation not supported');
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
        console.log('[v0] Geolocation timeout - using default');
        setState({
          coordinates: DEFAULT_COORDINATES,
          loading: false,
          error: 'Location request timed out',
        });
        isAborted = true;
      }
    };

    // Try high accuracy first, then fallback to lower accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        if (!isAborted) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('[v0] GPS location found:', lat, lng);
          setState({
            coordinates: {
              latitude: lat,
              longitude: lng,
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
          console.log('[v0] GPS error:', error.code, error.message);
          // Try again with lower accuracy
          navigator.geolocation.getCurrentPosition(
            (fallbackPosition) => {
              if (!isAborted) {
                const lat = fallbackPosition.coords.latitude;
                const lng = fallbackPosition.coords.longitude;
                console.log('[v0] Fallback GPS location found:', lat, lng);
                setState({
                  coordinates: {
                    latitude: lat,
                    longitude: lng,
                  },
                  loading: false,
                  error: null,
                });
                isAborted = true;
              }
            },
            () => {
              if (!isAborted) {
                console.log('[v0] Fallback GPS also failed - using default');
                setState({
                  coordinates: DEFAULT_COORDINATES,
                  loading: false,
                  error: 'Location unavailable',
                });
                isAborted = true;
              }
            },
            {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 600000,
            }
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    // Set fallback timeout
    timeoutId = setTimeout(handleTimeout, 8000);

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
