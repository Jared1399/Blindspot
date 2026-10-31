import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { GenerationInput, GenerationResult, PointResult } from '../types';
import { hashToInt } from './seed';
import { displaceLocation } from './displace';

const GRID_SIZE = 100;

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateSpiralPoints(
  radiusMeters: number,
  cellSize: number,
  headingDeg: number,
  seedJitter: number,
): Array<{ dx: number; dy: number; distanceMeters: number; bearingDeg: number }> {
  const maxRadiusCells = radiusMeters / cellSize;
  const phi = (1 + Math.sqrt(5)) / 2;
  const b = Math.log(phi) / (Math.PI / 2);

  const spiralRotationDeg = (((90 - headingDeg) % 360) + 360) % 360 + seedJitter;
  const spiralRotationRad = (spiralRotationDeg * Math.PI) / 180;

  const points: Array<{
    dx: number;
    dy: number;
    distanceMeters: number;
    bearingDeg: number;
  }> = [];

  let theta = 0;
  while (true) {
    const r = Math.exp(b * theta);
    if (r > maxRadiusCells) break;

    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    const xRot = x * Math.cos(spiralRotationRad) - y * Math.sin(spiralRotationRad);
    const yRot = x * Math.sin(spiralRotationRad) + y * Math.cos(spiralRotationRad);

    const dist = Math.hypot(xRot, yRot) * cellSize;
    const bearing = ((Math.atan2(xRot, yRot) * 180) / Math.PI + 360) % 360;

    points.push({ dx: xRot, dy: yRot, distanceMeters: dist, bearingDeg: bearing });
    theta += 0.1;
  }

  const minDist = radiusMeters * 0.05;
  return points.filter((p) => p.distanceMeters >= minDist);
}

function compute3x3Average(
  noise: NoiseFunction2D,
  cx: number,
  cy: number,
  scale: number,
): number {
  let sum = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      sum += noise((cx + dx) * scale, (cy + dy) * scale);
    }
  }
  return sum / 9;
}

function pointResult(point: {
  distanceMeters: number;
  bearingDeg: number;
}, userLat: number, userLng: number): PointResult {
  const gps = displaceLocation(userLat, userLng, point.distanceMeters, point.bearingDeg);
  return {
    lat: gps.lat,
    lng: gps.lng,
    distanceMeters: point.distanceMeters,
    bearingDeg: point.bearingDeg,
  };
}

export function generatePoints(inputs: GenerationInput): GenerationResult {
  const seedInt = hashToInt(inputs);
  const noise = createNoise2D(seededRandom(seedInt));
  const cellSize = (inputs.radiusMeters * 2) / GRID_SIZE;
  const scale = 5 / GRID_SIZE;
  const jitter = ((seedInt % 21) - 10);

  const spiralPoints = generateSpiralPoints(
    inputs.radiusMeters,
    cellSize,
    inputs.heading,
    jitter,
  );

  if (spiralPoints.length < 10) {
    throw new Error('Not enough spiral points generated');
  }

  const half = GRID_SIZE / 2;
  const evaluated = spiralPoints.map((sp) => {
    const gx = Math.round(sp.dx + half);
    const gy = Math.round(sp.dy + half);

    if (gx < 1 || gx >= GRID_SIZE - 1 || gy < 1 || gy >= GRID_SIZE - 1) return null;

    const perlin = noise(gx * scale, gy * scale);
    const perlinAvg = compute3x3Average(noise, gx, gy, scale);

    return { sp, perlinAvg };
  }).filter((e): e is NonNullable<typeof e> => e !== null);

  if (evaluated.length === 0) {
    throw new Error('No valid spiral points in grid bounds');
  }

  const best = evaluated.reduce((a, b) => (a.perlinAvg > b.perlinAvg ? a : b));
  const worst = evaluated.reduce((a, b) => (a.perlinAvg < b.perlinAvg ? a : b));

  return {
    attractor: pointResult(best.sp, inputs.lat, inputs.lng),
    void: pointResult(worst.sp, inputs.lat, inputs.lng),
  };
}
