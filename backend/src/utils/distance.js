/**
 * Haversine formula to calculate distance between two coordinates
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Get providers near a location within a radius
 * @param {number} latitude - Customer latitude
 * @param {number} longitude - Customer longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 15km)
 * @param {Array} providers - Array of provider objects with latitude/longitude
 * @returns {Array} Sorted array of providers with distance
 */
export const getNearbyProviders = (latitude, longitude, radiusKm = 15, providers = []) => {
  return providers
    .filter((provider) => provider.latitude && provider.longitude)
    .map((provider) => ({
      ...provider,
      distance: calculateDistance(latitude, longitude, provider.latitude, provider.longitude),
    }))
    .filter((provider) => provider.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Format distance for display
 * @param {number} distance - Distance in km
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance}km away`;
};
