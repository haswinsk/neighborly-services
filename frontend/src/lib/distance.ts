import { Coordinates } from './geolocation';

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export const calculateDistance = (
  from: Coordinates,
  to: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Formats distance for display (e.g., "500 m", "1.4 km", "12 km")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
};

/**
 * Filters services by distance from user coordinates
 */
export const filterByDistance = (
  services: any[],
  userCoordinates: Coordinates,
  maxDistanceKm: number
): any[] => {
  return services.filter((service) => {
    if (!service.latitude || !service.longitude) {
      return false;
    }

    const distance = calculateDistance(userCoordinates, {
      latitude: service.latitude,
      longitude: service.longitude,
    });

    return distance <= maxDistanceKm;
  });
};

/**
 * Sorts services by distance from user coordinates
 */
export const sortByDistance = (
  services: any[],
  userCoordinates: Coordinates
): any[] => {
  const withDistance = services.map((service) => {
    if (!service.latitude || !service.longitude) {
      return { ...service, distance: Infinity };
    }

    return {
      ...service,
      distance: calculateDistance(userCoordinates, {
        latitude: service.latitude,
        longitude: service.longitude,
      }),
    };
  });

  return withDistance.sort((a, b) => a.distance - b.distance);
};
