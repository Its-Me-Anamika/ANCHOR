import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer as TimerIcon } from 'lucide-react';

export const StopwatchCard: React.FC = () => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startStopwatch = () => {
    startTimeRef.current = Date.now() - elapsedMs;
    setIsRunning(true);
  };

  const pauseStopwatch = () => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setElapsedMs(0);
    setLaps([]);
  };

  const recordLap = () => {
    if (isRunning) {
      setLaps(prev => [elapsedMs, ...prev]);
    }
  };

  useEffect(() => {
    const updateTimer = () => {
      setElapsedMs(Date.now() - startTimeRef.current);
      requestRef.current = requestAnimationFrame(updateTimer);
    };

    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-80 shadow-2xl animate-pop text-center cartoon-card">
      <div className="flex items-center justify-center gap-2 mb-3 text-sky-400 font-bold text-sm tracking-wide">
        <TimerIcon className="w-4 h-4" />
        <span>STOPWATCH</span>
      </div>

      {/* Large Time Display MM:SS.CC */}
      <div className="font-mono text-4xl font-extrabold my-4 tracking-wider text-white">
        {formatMs(elapsedMs)}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {!isRunning && elapsedMs === 0 && (
          <button
            onClick={startStopwatch}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cartoon-btn"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start</span>
          </button>
        )}

        {isRunning && (
          <>
            <button
              onClick={recordLap}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cartoon-btn text-xs"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Lap</span>
            </button>
            <button
              onClick={pauseStopwatch}
              className="flex-1 py-2.5 bg-sunshine-500 hover:bg-sunshine-600 text-black font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cartoon-btn text-xs"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause</span>
            </button>
          </>
        )}

        {!isRunning && elapsedMs > 0 && (
          <>
            <button
              onClick={startStopwatch}
              className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cartoon-btn text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume</span>
            </button>
            <button
              onClick={resetStopwatch}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center transition-all cartoon-btn"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Laps List */}
      {laps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10 max-h-32 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-white/40 mb-1.5 uppercase tracking-wider text-left px-1">
            Lap History
          </div>
          <div className="flex flex-col gap-1 text-xs font-mono">
            {laps.map((lapMs, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 px-2 rounded-lg bg-white/5 text-white/80">
                <span className="text-white/40">Lap {laps.length - idx}</span>
                <span className="text-sunshine-400 font-bold">{formatMs(lapMs)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
