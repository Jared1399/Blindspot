export interface UserContext {
  lat: number;
  lng: number;
  heading: number;
  batteryPct: number;
  deviceId: string;
}

export interface GenerationInput extends UserContext {
  radiusMeters: number;
  timestamp: number;
}

export interface PointResult {
  lat: number;
  lng: number;
  distanceMeters: number;
  bearingDeg: number;
}

export interface GenerationResult {
  attractor: PointResult;
  void: PointResult;
}

export interface Session {
  id: number;
  createdAt: string;
  userLat: number;
  userLng: number;
  radiusM: number;
  locationName: string | null;
  attractorLat: number;
  attractorLng: number;
  attractorDistanceM: number;
  attractorBearing: number;
  voidLat: number;
  voidLng: number;
  voidDistanceM: number;
  voidBearing: number;
}
