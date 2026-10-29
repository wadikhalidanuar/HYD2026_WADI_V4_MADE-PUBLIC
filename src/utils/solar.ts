import { SolarPosition } from '../types';

// Taichung City Center Coordinates
export const TAICHUNG_LAT = 24.1477;
export const TAICHUNG_LNG = 120.6736;

/**
 * Computes solar altitude, azimuth and shadow vectors for Taichung at a specific time.
 * Standard solar position calculation based on declination and hour angle.
 */
export function calculateTaichungSolarPosition(date: Date = new Date()): SolarPosition {
  const latRad = (TAICHUNG_LAT * Math.PI) / 180;
  
  // Day of the year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination (approx in radians)
  const declination =
    (23.45 * Math.sin((((360 / 365) * (dayOfYear - 81) * Math.PI) / 180)) *
      Math.PI) /
    180;

  // Time in hours (Taichung is UTC+8)
  // We compute local solar time
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Taichung local solar time: UTC + (120.67 / 15) ~ UTC + 8.04
  const solarTimeHours = (utcHours + TAICHUNG_LNG / 15) % 24;

  // Hour angle (15 degrees per hour from solar noon at 12:00)
  const hourAngle = ((solarTimeHours - 12) * 15 * Math.PI) / 180;

  // Solar altitude (elevation above horizon)
  const sinAltitude =
    Math.sin(latRad) * Math.sin(declination) +
    Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));
  const altitudeDeg = (altitudeRad * 180) / Math.PI;

  // Solar azimuth (clockwise from North)
  const cosAzimuth =
    (Math.sin(declination) - Math.sin(latRad) * Math.sin(altitudeRad)) /
    (Math.cos(latRad) * Math.cos(altitudeRad));
  const clampedCosAzimuth = Math.max(-1, Math.min(1, cosAzimuth));
  let azimuthDeg = (Math.acos(clampedCosAzimuth) * 180) / Math.PI;

  if (Math.sin(hourAngle) > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }

  // Shadow calculation:
  // If sun is above horizon (> 2°), shadow multiplier = 1 / tan(altitude).
  // If sun is below horizon or altitude <= 0, sun is down (night mode = safe for vampires!).
  let shadowMultiplier = 0;
  if (altitudeDeg > 2) {
    shadowMultiplier = 1 / Math.tan(altitudeRad);
    // Cap reasonable shadow ratio to 6x building height
    shadowMultiplier = Math.min(shadowMultiplier, 6);
  }

  // Shadow falls in the direction opposite to the sun
  const shadowDirection = (azimuthDeg + 180) % 360;

  // UV intensity assessment based on solar angle
  let uvIntensity: SolarPosition['uvIntensity'] = 'Zero (Night)';
  if (altitudeDeg > 60) {
    uvIntensity = 'Extreme';
  } else if (altitudeDeg > 45) {
    uvIntensity = 'Very High';
  } else if (altitudeDeg > 30) {
    uvIntensity = 'High';
  } else if (altitudeDeg > 15) {
    uvIntensity = 'Moderate';
  } else if (altitudeDeg > 0) {
    uvIntensity = 'Low';
  } else {
    uvIntensity = 'Zero (Night)';
  }

  return {
    altitude: Math.round(altitudeDeg * 10) / 10,
    azimuth: Math.round(azimuthDeg * 10) / 10,
    shadowMultiplier: Math.round(shadowMultiplier * 100) / 100,
    shadowDirection: Math.round(shadowDirection * 10) / 10,
    uvIntensity,
  };
}

/**
 * Converts a direction angle and distance into approximate lat/lng offset
 */
export function getShadowOffset(
  angleDegrees: number,
  lengthMeters: number
): [number, number] {
  const angleRad = (angleDegrees * Math.PI) / 180;
  // 1 degree latitude ~ 111,000 meters
  // 1 degree longitude ~ 111,000 * cos(lat) meters
  const dLat = (lengthMeters * Math.cos(angleRad)) / 111000;
  const dLng = (lengthMeters * Math.sin(angleRad)) / (111000 * Math.cos((TAICHUNG_LAT * Math.PI) / 180));
  return [dLat, dLng];
}
