import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, Timer as TimerIcon, Watch as StopwatchIcon, Play, Pause, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ZenSubMode } from '../types';
import { getRandomQuote, formatDateFull, triggerConfetti } from '../utils/helpers';

const HIDE_DELAY_MS = 2000;

export const ZenMode: React.FC = () => {
  const { 
    zenMode, 
    setZenMode, 
    zenSubMode, 
    setZenSubMode, 
    settings,
    addToast 
  } = useStore();

  // Mouse-reveal overlay state
  const [overlayVisible, setOverlayVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Screen Wake Lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Real time clock for Clock mode
  const [time, setTime] = useState<Date>(new Date());
  const [quote] = useState<string>(() => getRandomQuote());

  // Timer State
  const [timerMinutes, setTimerMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stopwatch State
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const swFrameRef = useRef<number | null>(null);
  const swStartTimeRef = useRef<number>(0);

  // ─── Mouse move handler: show overlay, schedule hide ─────────────────────
  const handleMouseMove = useCallback(() => {
    setOverlayVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), HIDE_DELAY_MS);
  }, []);

  // Keep overlay alive while hovering controls
  const keepAlive = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), HIDE_DELAY_MS);
  }, []);

  // ─── ESC key always works ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZenMode(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setZenMode]);

  // ─── Clock Ticker ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Timer Effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            triggerConfetti();
            addToast('⏱️ Zen Session Complete!', `${timerMinutes} min timer finished! ✨`, 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timerMinutes, addToast]);

  // ─── Stopwatch Effect ─────────────────────────────────────────────────────
  useEffect(() => {
    const updateSw = () => {
      setStopwatchMs(Date.now() - swStartTimeRef.current);
      swFrameRef.current = requestAnimationFrame(updateSw);
    };
    if (isStopwatchRunning) {
      swFrameRef.current = requestAnimationFrame(updateSw);
    }
    return () => {
      if (swFrameRef.current) cancelAnimationFrame(swFrameRef.current);
    };
  }, [isStopwatchRunning]);

  // ─── Cleanup timer on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  // ─── Screen Wake Lock: keep display on for the entire Zen session ────────
  useEffect(() => {
    const acquire = async () => {
      if (!('wakeLock' in navigator)) return; // API not supported
      try {
        wakeLockRef.current = await (navigator as Navigator & { wakeLock: WakeLock }).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          // Reacquire if tab becomes visible again (e.g. user switched tabs)
          if (document.visibilityState === 'visible') acquire();
        });
      } catch (err) {
        // Denied or unavailable — Zen Mode continues normally
        console.debug('[ZenMode] Wake Lock not acquired:', err);
      }
    };

    // Reacquire when the tab regains focus (browser may release on tab switch)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  if (!zenMode) return null;

  // ─── Format Clock ────────────────────────────────────────────────────────
  let hoursNum = time.getHours();
  let ampm = '';
  if (settings.clockFormat === '12h') {
    ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12 || 12;
  }
  const clockStr = `${String(hoursNum).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}${settings.showSeconds ? `:${String(time.getSeconds()).padStart(2, '0')}` : ''}`;

  // ─── Format Timer ─────────────────────────────────────────────────────────
  const tMins = Math.floor(timeLeftSeconds / 60);
  const tSecs = timeLeftSeconds % 60;
  const timerStr = `${String(tMins).padStart(2, '0')}:${String(tSecs).padStart(2, '0')}`;

  // ─── Format Stopwatch ─────────────────────────────────────────────────────
  const swTotalSecs = Math.floor(stopwatchMs / 1000);
  const swMins = Math.floor(swTotalSecs / 60);
  const swSecs = swTotalSecs % 60;
  const swCs = Math.floor((stopwatchMs % 1000) / 10);
  const stopwatchStr = `${String(swMins).padStart(2, '0')}:${String(swSecs).padStart(2, '0')}.${String(swCs).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#080810] text-white flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
    >
      {/* ── Subtle pulse glow behind the clock ───────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />

      {/* ── Center Content ────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center max-w-4xl px-8">
        {/* Clock mode */}
        {zenSubMode === 'clock' && (
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono text-7xl sm:text-8xl md:text-[8rem] font-black tracking-tighter text-white drop-shadow-2xl flex items-baseline gap-3">
              <span>{clockStr}</span>
              {settings.clockFormat === '12h' && (
                <span className="text-3xl text-white/30 font-bold">{ampm}</span>
              )}
            </div>
            <p className="text-lg sm:text-xl text-white/25 font-medium tracking-widest uppercase">
              {formatDateFull()}
            </p>
            <p className="text-lg sm:text-xl text-white/40 italic max-w-2xl mt-6 font-hand leading-relaxed">
              "{quote}"
            </p>
          </div>
        )}

        {/* Timer mode */}
        {zenSubMode === 'timer' && (
          <div className="flex flex-col items-center gap-6">
            <div className="font-mono text-7xl sm:text-8xl md:text-[8rem] font-black tracking-wider text-white/90 drop-shadow-2xl">
              {timerStr}
            </div>
            {/* Presets — only visible when overlay shown */}
            <div
              className="flex gap-2 transition-all duration-500"
              style={{ opacity: overlayVisible ? 1 : 0, transform: overlayVisible ? 'translateY(0)' : 'translateY(8px)' }}
            >
              {[15, 25, 30, 45, 60].map(m => (
                <button
                  key={m}
                  onMouseMove={keepAlive}
                  onClick={() => {
                    setTimerMinutes(m);
                    setTimeLeftSeconds(m * 60);
                    setIsTimerRunning(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold cartoon-btn ${
                    timerMinutes === m && !isTimerRunning ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
            {/* Controls */}
            <div
              className="flex gap-3 transition-all duration-500"
              style={{ opacity: overlayVisible ? 1 : 0, transform: overlayVisible ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <button
                onMouseMove={keepAlive}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white text-base font-bold rounded-2xl flex items-center gap-2 border border-white/10 cartoon-btn"
              >
                {isTimerRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onMouseMove={keepAlive}
                onClick={() => { setIsTimerRunning(false); setTimeLeftSeconds(timerMinutes * 60); }}
                className="px-4 py-3.5 bg-white/5 hover:bg-white/15 text-white rounded-2xl border border-white/10 cartoon-btn"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stopwatch mode */}
        {zenSubMode === 'stopwatch' && (
          <div className="flex flex-col items-center gap-6">
            <div className="font-mono text-6xl sm:text-8xl md:text-[7rem] font-black tracking-wider text-white/90 drop-shadow-2xl">
              {stopwatchStr}
            </div>
            {/* Controls */}
            <div
              className="flex gap-3 transition-all duration-500"
              style={{ opacity: overlayVisible ? 1 : 0, transform: overlayVisible ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <button
                onMouseMove={keepAlive}
                onClick={() => {
                  if (!isStopwatchRunning) {
                    swStartTimeRef.current = Date.now() - stopwatchMs;
                  }
                  setIsStopwatchRunning(!isStopwatchRunning);
                }}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white text-base font-bold rounded-2xl flex items-center gap-2 border border-white/10 cartoon-btn"
              >
                {isStopwatchRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                <span>{isStopwatchRunning ? 'Pause' : 'Start'}</span>
              </button>
              <button
                onMouseMove={keepAlive}
                onClick={() => { setIsStopwatchRunning(false); setStopwatchMs(0); }}
                className="px-4 py-3.5 bg-white/5 hover:bg-white/15 text-white rounded-2xl border border-white/10 cartoon-btn"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Overlay — appears on mouse move, fades after 2s ─────── */}
      <div
        className="fixed inset-0 pointer-events-none z-60 transition-opacity duration-500"
        style={{ opacity: overlayVisible ? 1 : 0 }}
      >
        {/* Top-left: mode switcher */}
        <div
          className="absolute top-6 left-6 pointer-events-auto"
          onMouseMove={keepAlive}
        >
          <div className="flex items-center bg-black/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-xl gap-1">
            <button
              onClick={() => setZenSubMode('clock')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cartoon-btn ${
                zenSubMode === 'clock' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Clock</span>
            </button>
            <button
              onClick={() => setZenSubMode('timer')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cartoon-btn ${
                zenSubMode === 'timer' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              <span>Timer</span>
            </button>
            <button
              onClick={() => setZenSubMode('stopwatch')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cartoon-btn ${
                zenSubMode === 'stopwatch' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <StopwatchIcon className="w-3.5 h-3.5" />
              <span>Stopwatch</span>
            </button>
          </div>
        </div>

        {/* Top-right: Exit */}
        <div
          className="absolute top-6 right-6 pointer-events-auto"
          onMouseMove={keepAlive}
        >
          <button
            onClick={() => setZenMode(false)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/60 hover:bg-white/10 text-white/50 hover:text-white rounded-2xl text-xs font-bold border border-white/10 backdrop-blur-xl shadow-xl transition-all cartoon-btn"
          >
            <span>ESC to exit</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom: subtle hint label */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
          <span className="text-white/15 text-xs tracking-[0.25em] font-mono uppercase">
            ✦ zen mode ✦
          </span>
        </div>
      </div>

      {/* Pulse keyframe (inline) */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
