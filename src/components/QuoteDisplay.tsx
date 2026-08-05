import React, { useState } from 'react';
import { getRandomQuote } from '../utils/helpers';
import { RefreshCw } from 'lucide-react';

export const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<string>(() => getRandomQuote());

  const handleRefresh = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="group relative inline-flex items-center gap-2 my-2 px-3 py-1 rounded-xl transition-all cursor-pointer" onClick={handleRefresh}>
      <p className="text-base sm:text-lg text-white/40 italic font-medium tracking-wide group-hover:text-white/70 transition-colors">
        "{quote}"
      </p>
      <RefreshCw className="w-3.5 h-3.5 text-white/20 group-hover:text-sunshine-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-180 duration-300" />
    </div>
  );
};
