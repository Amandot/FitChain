/**
 * Mumbai geo-fence utility.
 * Bounding box covers Greater Mumbai + suburbs (Bandra, Juhu, Powai, Thane border).
 */

const MUMBAI_BOUNDS = {
  minLat: 18.8900,
  maxLat: 19.2700,
  minLng: 72.7700,
  maxLng: 73.0500,
};

export const isInMumbai = (lat, lng) =>
  lat >= MUMBAI_BOUNDS.minLat &&
  lat <= MUMBAI_BOUNDS.maxLat &&
  lng >= MUMBAI_BOUNDS.minLng &&
  lng <= MUMBAI_BOUNDS.maxLng;

export const MUMBAI_CENTER = [19.0760, 72.8777];

export { MUMBAI_BOUNDS };
