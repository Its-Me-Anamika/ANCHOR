// ─── weather.ts ───────────────────────────────────────────────────────────────
// Open-Meteo based weather utilities. No API key required.
// ──────────────────────────────────────────────────────────────────────────────

import { WeatherResult } from '../types';

// ── Legacy type kept for backward compatibility with WeatherPill ───────────────
export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
  isFallback?: boolean;
}

// ── Open-Meteo WMO weather code → { label, emoji } ────────────────────────────
function decodeWMO(code: number): { condition: string; icon: string } {
  if (code === 0)                       return { condition: 'Clear Sky',       icon: '☀️' };
  if (code === 1)                       return { condition: 'Mainly Clear',     icon: '🌤️' };
  if (code === 2)                       return { condition: 'Partly Cloudy',    icon: '⛅' };
  if (code === 3)                       return { condition: 'Overcast',         icon: '☁️' };
  if (code >= 45 && code <= 48)         return { condition: 'Foggy',            icon: '🌫️' };
  if (code >= 51 && code <= 55)         return { condition: 'Drizzle',          icon: '🌦️' };
  if (code >= 56 && code <= 57)         return { condition: 'Freezing Drizzle', icon: '🌧️' };
  if (code >= 61 && code <= 65)         return { condition: 'Rain',             icon: '🌧️' };
  if (code >= 66 && code <= 67)         return { condition: 'Freezing Rain',    icon: '🌨️' };
  if (code >= 71 && code <= 75)         return { condition: 'Snow',             icon: '❄️' };
  if (code === 77)                      return { condition: 'Snow Grains',      icon: '🌨️' };
  if (code >= 80 && code <= 82)         return { condition: 'Rain Showers',     icon: '🌦️' };
  if (code >= 85 && code <= 86)         return { condition: 'Snow Showers',     icon: '🌨️' };
  if (code >= 95 && code <= 99)         return { condition: 'Thunderstorm',     icon: '⛈️' };
  return                                         { condition: 'Unknown',         icon: '🌡️' };
}

// ── Geocoding ─────────────────────────────────────────────────────────────────
export interface GeoResult {
  id: string;
  name: string;
  admin1?: string;  // state / region (e.g. "Chhattisgarh")
  country: string;
  lat: number;
  lon: number;
}

export async function geocodeCity(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.results)) return [];
    return data.results.map((r: {
      id?: number; name?: string; admin1?: string; country?: string;
      latitude?: number; longitude?: number;
    }) => ({
      id: `${r.latitude?.toFixed(4)}_${r.longitude?.toFixed(4)}`,
      name: r.name ?? 'Unknown',
      admin1: r.admin1,
      country: r.country ?? '',
      lat: r.latitude ?? 0,
      lon: r.longitude ?? 0,
    }));
  } catch {
    return [];
  }
}

// ── Reverse geocoding (BigDataCloud — free, no API key) ───────────────────────
export interface ReverseGeoResult {
  city: string;
  country: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeoResult | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city || data.locality || data.principalSubdivision || 'My Location',
      country: data.countryName || '',
    };
  } catch {
    return null;
  }
}

// ── Fetch weather for a lat/lon pair ──────────────────────────────────────────
export async function fetchWeatherForCoords(
  lat: number, lon: number, cityId: string
): Promise<WeatherResult | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
      `&wind_speed_unit=kmh&temperature_unit=celsius&timezone=auto`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    const data = await res.json();
    const c = data.current;
    const wmo = c?.weather_code ?? 0;
    const { condition, icon } = decodeWMO(wmo);

    const result: WeatherResult = {
      cityId,
      temp: Math.round(c?.temperature_2m ?? 0),
      feelsLike: Math.round(c?.apparent_temperature ?? 0),
      condition,
      icon,
      windKmh: Math.round(c?.wind_speed_10m ?? 0),
      humidity: Math.round(c?.relative_humidity_2m ?? 0),
      updatedAt: new Date().toISOString(),
      timezone: data.timezone ?? undefined,
      utcOffsetSeconds: typeof data.utc_offset_seconds === 'number'
        ? data.utc_offset_seconds
        : undefined,
    };

    setCachedWeather(cityId, result);
    return result;
  } catch {
    return null;
  }
}

// ── localStorage cache helpers ────────────────────────────────────────────────
const CACHE_PREFIX = 'anchor_weather_';

export function getCachedWeather(cityId: string): WeatherResult | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + cityId);
    if (!raw) return null;
    return JSON.parse(raw) as WeatherResult;
  } catch {
    return null;
  }
}

export function setCachedWeather(cityId: string, data: WeatherResult): void {
  try {
    localStorage.setItem(CACHE_PREFIX + cityId, JSON.stringify(data));
  } catch { /* quota exceeded — silent */ }
}

export function minutesSince(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

// ── Legacy fetchCurrentWeather kept for backward compatibility ─────────────────
const FALLBACK_WEATHER: WeatherData = {
  temp: 24,
  condition: 'Partly Cloudy',
  icon: '🌤️',
  city: 'Sanctuary',
  isFallback: true,
};

export async function fetchCurrentWeather(): Promise<WeatherData> {
  return FALLBACK_WEATHER;
}
