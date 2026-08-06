import React, { useState } from 'react';
import { getRandomQuote } from '../utils/helpers';
import { RefreshCw } from 'lucide-react';

export const QuoteDisplay: React.FC = () => {
  const [quote, setQuote] = useState<string>(() => getRandomQuote());

  const handleRefresh = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="
    group
    relative
    inline-flex
    items-center
    gap-3
    my-6
    px-4
    py-2
    rounded-xl
    transition-all
    cursor-pointer
    ">
      <p className="
      text-xl
      sm:text-4xl
      italic
      font-medium
      tracking-wide
      text-white/80
      group-hover:text-white
      transition-colors
      duration-300
      text-center
      max-w-3xl
      leading-relaxed
      ">
        "{quote}"
      </p>
      <RefreshCw className="w-3.5 h-3.5 text-white/20 group-hover:text-sunshine-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-180 duration-300" />
    </div>
  );
};
