import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { triggerConfetti } from '../utils/helpers';

export const TimerCard: React.FC = () => {
  const { addToast } = useStore();

  const [presetMinutes, setPresetMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectPreset = (mins: number) => {
    setPresetMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setTimeLeftSeconds(presetMinutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsComplete(true);
            triggerConfetti();
            addToast('⏱️ Timer Complete!', `${presetMinutes} minute focus session finished. Great job! ✨`, 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, presetMinutes, addToast]);

  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-80 shadow-2xl animate-pop text-center cartoon-card">
      <div className="flex items-center justify-center gap-2 mb-3 text-sunshine-400 font-bold text-sm tracking-wide">
        <TimerIcon className="w-4 h-4 animate-spin-slow" />
        <span>FOCUS TIMER</span>
      </div>

      {/* Large Time Display */}
      <div className={`font-mono text-5xl font-extrabold my-4 tracking-wider transition-colors ${
        isComplete ? 'text-sunshine-400 animate-bounce' : isRunning ? 'text-coral-400' : 'text-white'
      }`}>
        {formattedTime}
      </div>

      {/* Presets */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {[15, 25, 30, 45, 60].map(minsOption => (
          <button
            key={minsOption}
            onClick={() => selectPreset(minsOption)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cartoon-btn ${
              presetMinutes === minsOption && !isRunning && !isPaused
                ? 'bg-sunshine-400 text-black shadow-md scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {minsOption}m
          </button>
        ))}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRunning && !isPaused && !isComplete && (
          <button
            onClick={handleStart}
            className="w-full py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cartoon-btn"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Timer</span>
          </button>
        )}

        {isRunning && (
          <button
            onClick={handlePause}
            className="w-full py-2.5 bg-sunshine-500 hover:bg-sunshine-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cartoon-btn"
          >
            <Pause className="w-4 h-4 fill-black" />
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <div className="flex gap-2 w-full">
            <button
              onClick={handleResume}
              className="flex-1 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cartoon-btn text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume</span>
            </button>
            <button
              onClick={handleReset}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center transition-all cartoon-btn"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {isComplete && (
          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-sunshine-400 hover:bg-sunshine-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cartoon-btn"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Timer</span>
          </button>
        )}
      </div>
    </div>
  );
};
