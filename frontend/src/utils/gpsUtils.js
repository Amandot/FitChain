// GPS and Distance Tracking Utilities

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Determine if movement should be detected based on GPS data
 * @param {Object} params - GPS parameters
 * @param {number} params.distanceFromLast - Distance from last valid position
 * @param {number} params.speed - GPS reported speed in m/s
 * @param {number} params.accuracy - GPS accuracy in meters
 * @returns {boolean} Whether movement is detected
 */
export const detectMovement = ({ distanceFromLast, speed, accuracy }) => {
  const minMovementThreshold = Math.max(accuracy * 0.5, 3); // 50% of accuracy or minimum 3m
  const minWalkingSpeed = 0.5; // 0.5 m/s = 1.8 km/h
  const maxAccuracy = 100; // Only trust movement if accuracy is reasonable

  const speedBasedMovement = speed > minWalkingSpeed;
  const distanceBasedMovement = distanceFromLast > minMovementThreshold;
  const accuracyIsGood = accuracy < maxAccuracy;

  return (speedBasedMovement || distanceBasedMovement) && accuracyIsGood;
};

/**
 * Validate if a distance measurement should be added to total
 * @param {number} distance - Distance to validate
 * @param {number} accuracy - GPS accuracy
 * @returns {boolean} Whether distance should be added
 */
export const shouldAddDistance = (distance, accuracy) => {
  const maxReasonableDistance = 200; // Maximum reasonable distance between GPS points
  const minDistance = 0.5; // Minimum distance to consider

  // Add distance if it's reasonable and we have good accuracy
  if (distance > minDistance && distance < maxReasonableDistance) {
    return true;
  }

  // For very small movements with high accuracy, still add distance
  if (distance > 0 && distance < 5 && accuracy < 20) {
    return true;
  }

  return false;
};

/**
 * Get GPS accuracy description
 * @param {number} accuracy - GPS accuracy in meters
 * @returns {string} Human readable accuracy description
 */
export const getAccuracyDescription = (accuracy) => {
  if (accuracy < 5) return "🟢 Excellent";
  if (accuracy < 10) return "🟢 Very Good";
  if (accuracy < 20) return "🟡 Good";
  if (accuracy < 50) return "🟠 Fair";
  return "🔴 Poor";
};

/**
 * Enhanced GPS options for better tracking
 */
export const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 second timeout
  maximumAge: 2000, // Allow 2 second old positions
};

/**
 * Calculate pace in min/km
 * @param {number} distance - Distance in meters
 * @param {number} time - Time in seconds
 * @returns {number} Pace in minutes per kilometer
 */
export const calculatePace = (distance, time) => {
  if (distance <= 0 || time <= 0) return 0;
  const distanceKm = distance / 1000;
  const timeMin = time / 60;
  return timeMin / distanceKm;
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
