import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWeather } from '../hooks/useWeather';
import { minutesSince } from '../utils/weather';
import { WeatherResult } from '../types';

// ── Local time helper (same as WeatherView, kept local to avoid coupling) ─────
function getLocalTimeStr(timezone: string | undefined, now: Date): string {
  if (!timezone) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit',
      timeZone: timezone, hour12: true,
    }).format(now);
  } catch { return ''; }
}

// ── Single compact city chip ──────────────────────────────────────────────────
interface CityChipProps {
  label: string;
  country?: string;
  weather: WeatherResult | null;
  onClick: () => void;
  now: Date;
}

function CityChip({ label, country, weather, onClick, now }: CityChipProps) {
  const localTime = getLocalTimeStr(weather?.timezone, now);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-5 py-5 rounded-3xl border transition-all duration-200 hover:scale-105 hover:opacity-90 cartoon-btn"
      style={{
        background: 'rgba(15,15,15,0.82)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)',
        minWidth: '200px',
        maxWidth: '220px',
        minHeight: '180px',
      }}
      title={`${label}${country ? `, ${country}` : ''} — click to open Weather`}
    >
      {weather ? (
        <>
          <span className="text-3xl leading-none">{weather.icon}</span>
          <span className="text-3xl font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>
            {weather.temp}°
          </span>
          <span
            className="text-lg font-semibold opacity-75 truncate w-full text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {label}
          </span>
          {country && (
            <span
              className="text-lg opacity-70 truncate w-full text-center"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {country}
            </span>
          )}
          {localTime && (
            <span
              className="text-sm font-medium opacity-80 mt-0.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {localTime}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="text-2xl leading-none opacity-25">🌡️</span>
          <span
            className="text-[11px] opacity-30 font-medium text-center truncate w-full"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {label}
          </span>
        </>
      )}
    </button>
  );
}

// ── Main WeatherWidget ────────────────────────────────────────────────────────
export const WeatherWidget: React.FC = () => {
  const { savedCities, setCurrentView } = useStore();
  const { weatherMap, currentLocation, locationState } = useWeather();
  const [now, setNow] = useState(new Date());

  // Tick every 10 s — keeps local time accurate without any API calls
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(interval);
  }, []);

  // Up to 4 pinned saved cities
  const pinnedCities = savedCities.filter(c => c.isOnDashboard).slice(0, 4);
  const hasFavorites = savedCities.length > 0;

  // Stale cache warning — if newest weather is >90 min old
  const mostRecentUpdate = currentLocation?.weather.updatedAt
    ?? Object.values(weatherMap)[0]?.updatedAt;
  const isStale = mostRecentUpdate ? minutesSince(mostRecentUpdate) > 90 : false;

  // Show setup prompt if nothing is available yet
  const hasContent = currentLocation || pinnedCities.length > 0;
  if (!hasContent && locationState === 'idle') {
    return (
      <button
        onClick={() => setCurrentView('weather')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:opacity-80 cartoon-btn"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span className="text-lg">🌤️</span>
        <span>Set up Weather</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Stale data warning */}
      {isStale && (
        <p className="text-[10px] opacity-40" style={{ color: 'var(--color-text-secondary)' }}>
          ⚠️ Weather may be outdated
        </p>
      )}

      {/* City chips — current location + up to 4 pinned */}
      <div className="flex items-start justify-center gap-2 flex-wrap">
        {/* Current location */}
        {currentLocation && (
          <CityChip
            label={currentLocation.city}
            country={currentLocation.country}
            weather={currentLocation.weather}
            onClick={() => setCurrentView('weather')}
            now={now}
          />
        )}

        {/* Pinned saved cities */}
        {pinnedCities.map(city => (
          <CityChip
            key={city.id}
            label={city.name}
            country={city.country}
            weather={weatherMap[city.id] ?? null}
            onClick={() => setCurrentView('weather')}
            now={now}
          />
        ))}
      </div>

      {/* Manage link */}
      {hasFavorites && (
        <button
          onClick={() => setCurrentView('weather')}
          className="flex items-center gap-1 text-[10px] opacity-30 hover:opacity-60 transition-opacity mt-0.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Star className="w-3 h-3" />
          Manage weather
        </button>
      )}
    </div>
  );
};
