import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

interface FlipDigitProps {
  digit: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit }) => {
  const [animating, setAnimating] = useState(false);
  const [prevDigit, setPrevDigit] = useState(digit);

  useEffect(() => {
    if (digit !== prevDigit) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
        setPrevDigit(digit);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div className={`flip-digit relative inline-flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 shadow-2xl ${animating ? 'animating' : ''}`}>
      <div className="flip-digit-inner font-mono font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight text-white drop-shadow-md">
        {digit}
      </div>
    </div>
  );
};

export const FlipClock: React.FC = () => {
  const { settings } = useStore();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  let hoursNum = time.getHours();
  let ampm = '';

  if (settings.clockFormat === '12h') {
    ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12 || 12;
  }

  const hoursStr = String(hoursNum).padStart(2, '0');
  const minutesStr = String(time.getMinutes()).padStart(2, '0');
  const secondsStr = String(time.getSeconds()).padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none my-4">
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4">
        {/* Hours */}
        <div className="flex gap-1 sm:gap-2">
          <FlipDigit digit={hoursStr[0]} />
          <FlipDigit digit={hoursStr[1]} />
        </div>

        {/* Colon */}
        <span className="text-white/40 text-4xl sm:text-6xl md:text-7xl font-mono self-center animate-pulse -mt-2">
          :
        </span>

        {/* Minutes */}
        <div className="flex gap-1 sm:gap-2">
          <FlipDigit digit={minutesStr[0]} />
          <FlipDigit digit={minutesStr[1]} />
        </div>

        {/* Seconds (optional toggle in settings) */}
        {settings.showSeconds && (
          <>
            <span className="text-white/40 text-4xl sm:text-6xl md:text-7xl font-mono self-center animate-pulse -mt-2">
              :
            </span>
            <div className="flex gap-1 sm:gap-2">
              <FlipDigit digit={secondsStr[0]} />
              <FlipDigit digit={secondsStr[1]} />
            </div>
          </>
        )}

        {/* AM/PM indicator if 12h */}
        {settings.clockFormat === '12h' && (
          <span className="text-sunshine-400 font-bold text-lg sm:text-2xl self-end mb-3 ml-1 tracking-widest">
            {ampm}
          </span>
        )}
      </div>
    </div>
  );
};
