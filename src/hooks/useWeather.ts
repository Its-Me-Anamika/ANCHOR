import { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherResult } from '../types';
import { fetchWeatherForCoords, getCachedWeather, reverseGeocode } from '../utils/weather';
import { useStore } from '../store/useStore';

// ── Location state machine ────────────────────────────────────────────────────
export type LocationState = 'idle' | 'loading' | 'success' | 'denied' | 'unsupported';

export interface CurrentLocationData {
  city: string;
  country: string;
  weather: WeatherResult;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useWeather() {
  const { savedCities } = useStore();
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherResult>>({});
  const [currentLocation, setCurrentLocation] = useState<CurrentLocationData | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const geoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch or serve from cache ────────────────────────────────────────────────
  const getWeather = useCallback(async (lat: number, lon: number, cityId: string) => {
    if (!navigator.onLine) return getCachedWeather(cityId);
    return (await fetchWeatherForCoords(lat, lon, cityId)) ?? getCachedWeather(cityId);
  }, []);

  // ── Fetch saved cities ───────────────────────────────────────────────────────
  const refreshCities = useCallback(async () => {
    if (savedCities.length === 0) return;
    const newMap: Record<string, WeatherResult> = {};
    await Promise.allSettled(
      savedCities.map(async (city) => {
        const res = await getWeather(city.lat, city.lon, city.id);
        if (res) newMap[city.id] = res;
      })
    );
    setWeatherMap(prev => ({ ...prev, ...newMap }));
  }, [savedCities, getWeather]);

  // ── Fetch current location (explicit / retry) ────────────────────────────────
  const fetchForLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationState('unsupported');
      return;
    }

    setLocationState('loading');

    // Safety net: never hang forever in loading state
    if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
    geoTimeoutRef.current = setTimeout(() => {
      setLocationState('denied');
    }, 15000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
        const { latitude, longitude } = pos.coords;
        try {
          const [weather, geo] = await Promise.all([
            getWeather(latitude, longitude, 'current_location'),
            reverseGeocode(latitude, longitude),
          ]);
          if (weather) {
            setCurrentLocation({
              city: geo?.city || 'My Location',
              country: geo?.country || '',
              weather,
            });
            setLocationState('success');
            localStorage.setItem('anchor_location_allowed', 'true');
          } else {
            // Weather fetch failed but position was granted — serve cache
            const cached = getCachedWeather('current_location');
            if (cached) {
              setCurrentLocation({
                city: geo?.city || 'My Location',
                country: geo?.country || '',
                weather: cached,
              });
              setLocationState('success');
            } else {
              setLocationState('denied');
            }
          }
        } catch {
          setLocationState('denied');
        }
      },
      (err) => {
        if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
        // PERMISSION_DENIED = code 1
        if (err.code === 1) {
          localStorage.setItem('anchor_location_allowed', 'false');
        }
        setLocationState('denied');
      },
      { timeout: 12000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }, [getWeather]);

  // ── Silently refresh current location (no spinner / state reset) ─────────────
  const silentRefreshLocation = useCallback(async () => {
    const stored = localStorage.getItem('anchor_location_allowed');
    if (stored !== 'true' || !('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const [weather, geo] = await Promise.all([
          getWeather(latitude, longitude, 'current_location'),
          reverseGeocode(latitude, longitude),
        ]);
        if (weather) {
          setCurrentLocation(prev => ({
            city: geo?.city || prev?.city || 'My Location',
            country: geo?.country || prev?.country || '',
            weather,
          }));
        }
      },
      () => { /* silent */ },
      { timeout: 12000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }, [getWeather]);

  // ── Public: retry after denial ────────────────────────────────────────────────
  const retryLocation = useCallback(() => {
    localStorage.setItem('anchor_location_allowed', 'true');
    fetchForLocation();
  }, [fetchForLocation]);

  // ── Public: refresh all ───────────────────────────────────────────────────────
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([refreshCities(), silentRefreshLocation()]);
    setIsLoading(false);
  }, [refreshCities, silentRefreshLocation]);

  // ── On mount: auto-request location unless explicitly denied ──────────────────
  useEffect(() => {
    const stored = localStorage.getItem('anchor_location_allowed');
    // 'false' means user explicitly denied — respect that choice
    if (stored !== 'false') {
      fetchForLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Load saved cities ─────────────────────────────────────────────────────────
  useEffect(() => {
    refreshCities();
  }, [refreshCities]);

  // ── 30-minute auto-refresh ─────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(refreshAll, 1_800_000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // ── Cleanup timeout on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
    };
  }, []);

  return {
    weatherMap,
    currentLocation,
    locationState,
    isLoading,
    refreshAll,
    retryLocation,
  };
}
