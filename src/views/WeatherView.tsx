import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, RefreshCw, Trash2, Star, StarOff, MoreVertical,
  Wind, Droplets, Thermometer, Search, Plus, X, Locate
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWeather, LocationState, CurrentLocationData } from '../hooks/useWeather';
import { geocodeCity, GeoResult, minutesSince } from '../utils/weather';
import { WeatherResult } from '../types';

// ── Time helpers ──────────────────────────────────────────────────────────────
function getLocalTimeStr(timezone: string | undefined, now: Date): string {
  if (!timezone) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit',
      timeZone: timezone, hour12: true,
    }).format(now);
  } catch { return ''; }
}

function getOffsetLabel(utcOffsetSeconds: number | undefined): string {
  if (utcOffsetSeconds === undefined) return '';
  const localOffsetSec = -new Date().getTimezoneOffset() * 60;
  const diffSec = utcOffsetSeconds - localOffsetSec;
  if (Math.abs(diffSec) < 60) return 'Same timezone';
  const sign = diffSec > 0 ? '+' : '-';
  const totalMin = Math.round(Math.abs(diffSec) / 60);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `${sign}${mins} min`;
  if (mins === 0) return `${sign}${hours} hr`;
  return `${sign}${hours} hr ${mins} min`;
}

// ── Last Updated badge ────────────────────────────────────────────────────────
function LastUpdated({ isoTime }: { isoTime: string }) {
  const mins = minutesSince(isoTime);
  const isStale = mins > 90;
  return (
    <span className={`text-xs ${isStale ? 'text-amber-400' : 'opacity-40'}`}
      style={isStale ? {} : { color: 'var(--color-text-secondary)' }}>
      {isStale ? '⚠️ ' : ''}Updated {mins < 2 ? 'just now' : `${mins} min ago`}
    </span>
  );
}

// ── Shared weather stats row ──────────────────────────────────────────────────
function WeatherStats({ weather }: { weather: WeatherResult }) {
  return (
    <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex flex-col items-center gap-1">
        <Wind className="w-3.5 h-3.5 opacity-50" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{weather.windKmh}</span>
        <span className="text-[10px] opacity-40" style={{ color: 'var(--color-text-secondary)' }}>km/h</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Droplets className="w-3.5 h-3.5 opacity-50" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{weather.humidity}%</span>
        <span className="text-[10px] opacity-40" style={{ color: 'var(--color-text-secondary)' }}>Humidity</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Thermometer className="w-3.5 h-3.5 opacity-50" style={{ color: 'var(--color-accent)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{weather.feelsLike}°</span>
        <span className="text-[10px] opacity-40" style={{ color: 'var(--color-text-secondary)' }}>Feels Like</span>
      </div>
    </div>
  );
}

// ── Current Location Card (4 states) ─────────────────────────────────────────
interface CurrentLocationCardProps {
  locationState: LocationState;
  currentLocation: CurrentLocationData | null;
  retryLocation: () => void;
  now: Date;
}

function CurrentLocationCard({ locationState, currentLocation, retryLocation, now }: CurrentLocationCardProps) {
  const base = { background: 'var(--color-surface)', borderColor: 'var(--color-border)' };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (locationState === 'loading') {
    return (
      <div className="rounded-2xl p-5 border" style={base}>
        <div className="flex items-center gap-3 opacity-50">
          <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Fetching your location…</p>
        </div>
      </div>
    );
  }

  // ── Unsupported ────────────────────────────────────────────────────────────
  if (locationState === 'unsupported') {
    return (
      <div className="rounded-2xl p-5 border opacity-60" style={base}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Your browser doesn't support geolocation.
        </p>
        <p className="text-xs opacity-50 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Please search for a city manually using the search bar above.
        </p>
      </div>
    );
  }

  // ── Denied ─────────────────────────────────────────────────────────────────
  if (locationState === 'denied') {
    return (
      <div className="rounded-2xl p-5 border" style={base}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Location access denied
            </p>
            <p className="text-xs opacity-50 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Allow location permission to display your local weather.
            </p>
          </div>
          <button
            onClick={retryLocation}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
          >
            <Locate className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (locationState === 'success' && currentLocation) {
    const { city, country, weather } = currentLocation;
    const localTime = getLocalTimeStr(weather.timezone, now);
    const offset = getOffsetLabel(weather.utcOffsetSeconds);
    return (
      <div className="rounded-2xl p-5 border transition-all duration-300" style={base}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-bold text-base flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
              <MapPin className="w-4 h-4 opacity-60 flex-shrink-0" />
              {city}
            </p>
            {country && (
              <p className="text-xs opacity-50 mt-0.5 pl-6" style={{ color: 'var(--color-text-secondary)' }}>
                {country}
              </p>
            )}
          </div>
          <button
            onClick={retryLocation}
            className="p-1.5 rounded-lg opacity-30 hover:opacity-70 transition-opacity"
            title="Refresh location"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Temp + icon + local time */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none">{weather.icon}</span>
            <div>
              <p className="text-4xl font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>
                {weather.temp}°
              </p>
              <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {weather.condition}
              </p>
            </div>
          </div>
          {localTime && (
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{localTime}</p>
              <p className="text-[10px] opacity-40 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Local time
              </p>
            </div>
          )}
        </div>

        <WeatherStats weather={weather} />

        <div className="mt-3">
          <LastUpdated isoTime={weather.updatedAt} />
        </div>
      </div>
    );
  }

  // ── Idle (first visit, not yet requested) ──────────────────────────────────
  return (
    <div className="rounded-2xl p-5 border" style={base}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 opacity-50">
          <MapPin className="w-4 h-4" />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Location not yet requested</p>
        </div>
        <button
          onClick={retryLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
          style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
        >
          <Locate className="w-3.5 h-3.5" /> Allow Location
        </button>
      </div>
    </div>
  );
}

// ── City Card ─────────────────────────────────────────────────────────────────
interface CityCardProps {
  name: string;
  country: string;
  isOnDashboard: boolean;
  weather: WeatherResult | null;
  onDelete?: () => void;
  onToggleDashboard?: () => void;
  dashCount: number;
  now: Date;
}

function CityCard({ name, country, isOnDashboard, weather, onDelete, onToggleDashboard, dashCount, now }: CityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const canPin = isOnDashboard || dashCount < 4;
  const localTime = getLocalTimeStr(weather?.timezone, now);
  const offset = getOffsetLabel(weather?.utcOffsetSeconds);

  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col gap-4 border transition-all duration-300 hover:scale-[1.01]"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            {isOnDashboard && (
              <Star className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-accent)' }} fill="currentColor" />
            )}
            <p className="font-bold text-base leading-tight" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
          </div>
          {country && (
            <p className="text-xs opacity-50 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{country}</p>
          )}
        </div>
        {(onDelete || onToggleDashboard) && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 min-w-[180px] rounded-xl shadow-2xl border py-1 text-sm"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {onToggleDashboard && (
                  <button
                    onClick={() => { onToggleDashboard(); setMenuOpen(false); }}
                    disabled={!canPin}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-30 text-left"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {isOnDashboard ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                    {isOnDashboard ? 'Remove from Home' : !canPin ? 'Home full (max 4)' : 'Add to Home'}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:opacity-80 transition-opacity text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete city
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weather body */}
      {weather ? (
        <>
          {/* Temp + icon + local time */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-5xl leading-none">{weather.icon}</span>
              <div>
                <p className="text-4xl font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>
                  {weather.temp}°
                </p>
                <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {weather.condition}
                </p>
              </div>
            </div>
            {localTime && (
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{localTime}</p>
                {offset && (
                  <p className="text-[10px] opacity-50 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {offset}
                  </p>
                )}
              </div>
            )}
          </div>

          <WeatherStats weather={weather} />

          <LastUpdated isoTime={weather.updatedAt} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 opacity-30 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Loading…</p>
        </div>
      )}
    </div>
  );
}

// ── Main WeatherView ──────────────────────────────────────────────────────────
export const WeatherView: React.FC = () => {
  const { savedCities, addCity, removeCity, toggleCityOnDashboard } = useStore();
  const { weatherMap, currentLocation, locationState, isLoading, refreshAll, retryLocation } = useWeather();
  const [searchQuery, setSearchQuery] = useState('');
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [now, setNow] = useState(new Date());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clock tick every 10 seconds — updates local time display without API calls
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(interval);
  }, []);

  // Debounced city search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setGeoResults([]); setShowDropdown(false); return; }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await geocodeCity(searchQuery);
      setGeoResults(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on ESC
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowDropdown(false); inputRef.current?.blur(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showDropdown]);

  const handleAddCity = useCallback((result: GeoResult) => {
    addCity({ name: result.name, country: result.country, lat: result.lat, lon: result.lon });
    setSearchQuery('');
    setGeoResults([]);
    setShowDropdown(false);
  }, [addCity]);

  const dashCount = savedCities.filter(c => c.isOnDashboard).length;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ color: 'var(--color-text-primary)' }}>

      {/* ── Fixed Header ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-light flex items-center gap-2">🌤️ Weather</h2>
          <button
            onClick={() => refreshAll()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search — fixed z-index dropdown */}
        <div className="relative mt-4" ref={searchRef}>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <Search className="w-4 h-4 opacity-40 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search and add a city worldwide…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
              style={{ color: 'var(--color-text-primary)' }}
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 opacity-30 animate-spin flex-shrink-0"
                style={{ color: 'var(--color-text-secondary)' }} />
            )}
            {searchQuery && !isSearching && (
              <button onClick={() => { setSearchQuery(''); setShowDropdown(false); }}>
                <X className="w-3.5 h-3.5 opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            )}
          </div>

          {/* Suggestions dropdown — floats above all page content */}
          {showDropdown && (
            <div
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl shadow-2xl border overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                maxHeight: '280px',
                overflowY: 'auto',
                // Solid backdrop to prevent bleed-through
                backdropFilter: 'blur(16px)',
              }}
            >
              {geoResults.map(r => {
                const alreadySaved = savedCities.some(c => c.id === r.id);
                const subtitle = [r.admin1, r.country].filter(Boolean).join(', ');
                return (
                  <button
                    key={r.id}
                    onClick={() => !alreadySaved && handleAddCity(r)}
                    disabled={alreadySaved}
                    className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity text-left border-b last:border-b-0 disabled:opacity-40"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm opacity-40 flex-shrink-0">📍</span>
                      <span className="text-sm font-medium flex-shrink-0">{r.name}</span>
                      {subtitle && (
                        <span className="text-xs opacity-40 truncate">{subtitle}</span>
                      )}
                    </span>
                    {alreadySaved
                      ? <span className="text-xs opacity-40 flex-shrink-0 ml-3">Saved</span>
                      : <Plus className="w-3.5 h-3.5 opacity-40 flex-shrink-0 ml-3" />
                    }
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable Content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollable px-6 py-6 space-y-6">

        {/* Current Location */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider opacity-50 mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--color-text-secondary)' }}>
            <MapPin className="w-3.5 h-3.5" /> Current Location
          </h3>
          <CurrentLocationCard
            locationState={locationState}
            currentLocation={currentLocation}
            retryLocation={retryLocation}
            now={now}
          />
        </section>

        {/* Saved Cities — responsive auto-fill grid */}
        {savedCities.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-50 mb-4"
              style={{ color: 'var(--color-text-secondary)' }}>
              Saved Cities ({savedCities.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {savedCities.map(city => (
                <CityCard
                  key={city.id}
                  name={city.name}
                  country={city.country}
                  isOnDashboard={city.isOnDashboard}
                  weather={weatherMap[city.id] ?? null}
                  onDelete={() => removeCity(city.id)}
                  onToggleDashboard={() => toggleCityOnDashboard(city.id)}
                  dashCount={dashCount}
                  now={now}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {savedCities.length === 0 && locationState !== 'success' && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <span className="text-5xl mb-4">🌍</span>
            <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
              No cities saved yet
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Search for a city above to get started
            </p>
          </div>
        )}

        {/* Dashboard tip */}
        {savedCities.length > 0 && (
          <p className="text-xs opacity-30 text-center pb-2" style={{ color: 'var(--color-text-secondary)' }}>
            ★ Pin up to 4 cities to the Home dashboard via the ⋮ menu on any card
          </p>
        )}
      </div>
    </div>
  );
};
