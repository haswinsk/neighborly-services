export interface AddressComponents {
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface LocationData extends AddressComponents {
  latitude: number;
  longitude: number;
}

/**
 * Reverse geocode coordinates to get address using Nominatim (OpenStreetMap)
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<AddressComponents | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      address: data.name || data.address.road || data.address.hamlet || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      country: address.country || 'India',
    };
  } catch (error) {
    console.error('[v0] Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Forward geocode address to get coordinates using Nominatim
 */
export const forwardGeocode = async (
  address: string
): Promise<LocationData | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    const addressData = await reverseGeocode(
      parseFloat(result.lat),
      parseFloat(result.lon)
    );

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      ...(addressData || { address: '', city: '', state: '', country: 'India' }),
    };
  } catch (error) {
    console.error('[v0] Forward geocoding error:', error);
    return null;
  }
};

/**
 * Get current position with enhanced accuracy and optional reverse geocoding
 */
export const getCurrentLocationWithAddress = async (
  reverseGeocode: boolean = true
): Promise<LocationData | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      resolve(null);
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;

        if (reverseGeocode) {
          const addressData = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            ...(addressData || { address: '', city: '', state: '', country: 'India' }),
          });
        } else {
          resolve({
            latitude,
            longitude,
            address: '',
            city: '',
            state: '',
            country: 'India',
          });
        }
      },
      () => {
        clearTimeout(timeoutId);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};
