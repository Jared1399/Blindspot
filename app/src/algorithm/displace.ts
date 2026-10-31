const EARTH_RADIUS = 6371000;

export function displaceLocation(
  initialLat: number,
  initialLng: number,
  distanceMeters: number,
  bearingDeg: number,
): { lat: number; lng: number } {
  const angularDist = distanceMeters / EARTH_RADIUS;
  const bearingRad = bearingDeg * Math.PI / 180;

  const latRad = initialLat * Math.PI / 180;
  const lngRad = initialLng * Math.PI / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDist) +
    Math.cos(latRad) * Math.sin(angularDist) * Math.cos(bearingRad)
  );

  const newLngRad = lngRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(latRad),
    Math.cos(angularDist) - Math.sin(latRad) * Math.sin(newLatRad)
  );

  return {
    lat: newLatRad * 180 / Math.PI,
    lng: newLngRad * 180 / Math.PI,
  };
}
