import { useState, useEffect } from 'react';

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
    // Start with default so the map shows immediately — GPS will update when ready
    coordinates: DEFAULT_COORDINATES,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coordinates: DEFAULT_COORDINATES, loading: false, error: 'Geolocation not supported' });
      return;
    }

    let done = false;

    const succeed = (lat: number, lng: number) => {
      if (done) return;
      done = true;
      setState({ coordinates: { latitude: lat, longitude: lng }, loading: false, error: null });
    };

    const fail = () => {
      if (done) return;
      done = true;
      setState({ coordinates: DEFAULT_COORDINATES, loading: false, error: 'Location unavailable' });
    };

    // High accuracy first — browser API timeout handles the wait
    navigator.geolocation.getCurrentPosition(
      (pos) => succeed(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Fallback: low accuracy, accept cached position
        navigator.geolocation.getCurrentPosition(
          (pos) => succeed(pos.coords.latitude, pos.coords.longitude),
          fail,
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );

    return () => { done = true; };
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
