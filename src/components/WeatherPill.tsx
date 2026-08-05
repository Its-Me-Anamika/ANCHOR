import React, { useState, useEffect } from 'react';
import { WeatherData, fetchCurrentWeather } from '../utils/weather';

export const WeatherPill: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 24,
    condition: 'Partly Cloudy',
    icon: '🌤️',
    city: 'Sanctuary',
    isFallback: true
  });

  useEffect(() => {
    let isMounted = true;
    fetchCurrentWeather().then(data => {
      if (isMounted) setWeather(data);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 text-sm font-semibold shadow-md cartoon-btn hover:bg-white/10 transition-all">
      <span className="text-lg leading-none">{weather.icon}</span>
      <span>{weather.temp}°C</span>
      <span className="text-white/40">•</span>
      <span className="text-white/70">{weather.condition}</span>
    </div>
  );
};
