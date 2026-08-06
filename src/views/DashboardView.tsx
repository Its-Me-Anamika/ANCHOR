import React from 'react';
import { Timer as TimerIcon, Watch as StopwatchIcon, Moon, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FlipClock } from '../components/FlipClock';
import { QuoteDisplay } from '../components/QuoteDisplay';
import { WeatherWidget } from '../components/WeatherWidget';
import { TimerCard } from '../components/TimerCard';
import { StopwatchCard } from '../components/StopwatchCard';
import { getGreeting, formatDateFull } from '../utils/helpers';

export const DashboardView: React.FC = () => {
  const { 
    activeDashboardCard, 
    setActiveDashboardCard, 
    setZenMode 
  } = useStore();

  const greeting = getGreeting();
  const dateFormatted = formatDateFull();

  const toggleTimerCard = () => {
    setActiveDashboardCard(activeDashboardCard === 'timer' ? 'none' : 'timer');
  };

  const toggleStopwatchCard = () => {
    setActiveDashboardCard(activeDashboardCard === 'stopwatch' ? 'none' : 'stopwatch');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center select-none overflow-y-auto">
      {/* 2.1 Greeting */}
      <div className="flex items-center gap-2 mb-1 animate-pop">
        <Sparkles className="w-5 h-5 text-sunshine-400" />
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white/70 tracking-wide font-family: 'Fredoka', sans-serif;">
          {greeting}
        </h1>
      </div>

      {/* 2.2 Flip Clock */}
      <FlipClock />

      {/* 2.3 Date Display */}
      <p className="text-2xl sm:text-2xl font-semibold tracking-wide mt-1 mb-1 text-white/90">
      {dateFormatted}
      </p>

      {/* 2.4 Quote of the Day */}
      <QuoteDisplay />

      {/* 2.5 Weather Widget */}
      <div className="my-3">
        <WeatherWidget />
      </div>

      {/* 2.6 Three Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-4">
        {/* Button 1: Timer */}
        <button
          onClick={toggleTimerCard}
          className={`px-6 py-3 rounded-2xl flex items-center gap-2.5 font-bold text-sm transition-all cartoon-btn shadow-md ${
            activeDashboardCard === 'timer'
              ? 'bg-sunshine-400 text-black scale-105 shadow-sunshine-500/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          <TimerIcon className="w-4 h-4" />
          <span>Timer</span>
        </button>

        {/* Button 2: Stopwatch */}
        <button
          onClick={toggleStopwatchCard}
          className={`px-6 py-3 rounded-2xl flex items-center gap-2.5 font-bold text-sm transition-all cartoon-btn shadow-md ${
            activeDashboardCard === 'stopwatch'
              ? 'bg-sky-400 text-black scale-105 shadow-sky-500/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          <StopwatchIcon className="w-4 h-4" />
          <span>Stopwatch</span>
        </button>

        {/* Button 3: Zen Mode */}
        <button
          onClick={() => setZenMode(true)}
          className="px-6 py-3 rounded-2xl flex items-center gap-2.5 font-bold text-sm bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 hover:text-white hover:from-purple-500/40 hover:to-indigo-500/40 border border-purple-500/30 transition-all cartoon-btn shadow-md"
        >
          <Moon className="w-4 h-4 text-purple-400" />
          <span>Zen Mode</span>
        </button>
      </div>

      {/* 2.7 / 2.8 Expanded Timer or Stopwatch Card */}
      <div className="mt-2 flex justify-center">
        {activeDashboardCard === 'timer' && <TimerCard />}
        {activeDashboardCard === 'stopwatch' && <StopwatchCard />}
      </div>
    </div>
  );
};
