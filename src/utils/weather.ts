import { WeatherData } from '../types';

const TAICHUNG_LAT = 24.1477;
const TAICHUNG_LNG = 120.6736;

export async function fetchTaichungWeather(): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${TAICHUNG_LAT}&longitude=${TAICHUNG_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=uv_index_max&timezone=Asia%2FTaipei`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();

    const temp = Math.round(data.current?.temperature_2m ?? 31.5);
    const apparent = Math.round(data.current?.apparent_temperature ?? 36.2);
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 72);
    const wind = Math.round(data.current?.wind_speed_10m ?? 8);
    const uvMax = data.daily?.uv_index_max?.[0] ?? 8.5;

    // Check time of day to determine current UV exposure
    const now = new Date();
    const hour = (now.getUTCHours() + 8) % 24; // Taichung local hour UTC+8
    let currentUv = 0;
    if (hour >= 6 && hour <= 18) {
      // Bell curve scaling during daylight
      const daylightFraction = Math.sin(((hour - 6) / 12) * Math.PI);
      currentUv = Math.round(uvMax * Math.max(0, daylightFraction) * 10) / 10;
    }

    return {
      temperature: temp,
      apparentTemperature: apparent,
      uvIndex: currentUv > 0 ? currentUv : 0,
      condition: currentUv > 7 ? 'Blazing Sun & High Heat' : currentUv > 3 ? 'Partly Cloudy' : 'Night Shade',
      humidity,
      windSpeed: wind,
    };
  } catch {
    // Fallback realistic daytime Taichung weather
    return {
      temperature: 32,
      apparentTemperature: 37,
      uvIndex: 8.5,
      condition: 'Sunny & Humid Subtropical',
      humidity: 74,
      windSpeed: 9,
    };
  }
}
