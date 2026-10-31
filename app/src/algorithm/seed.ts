import { GenerationInput } from '../types';

function djb2(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildSeedString(input: GenerationInput): string {
  return [
    input.lat.toFixed(6),
    input.lng.toFixed(6),
    input.heading.toFixed(1),
    input.batteryPct.toFixed(0),
    input.radiusMeters.toString(),
    input.deviceId,
    input.timestamp.toString(),
  ].join('|');
}

export function hashToInt(input: GenerationInput): number {
  return djb2(buildSeedString(input));
}
