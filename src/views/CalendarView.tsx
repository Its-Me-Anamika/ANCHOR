import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDateISO } from '../utils/helpers';

export const CalendarView: React.FC = () => {
  const { 
    calendarEvents, 
    setSelectedCalendarDate, 
    setIsEventModalOpen 
  } = useStore();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevYear = () => setCurrentDate(new Date(year - 1, month, 1));
  const nextYear = () => setCurrentDate(new Date(year + 1, month, 1));

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayIso = formatDateISO();

  const handleCellClick = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const clickedIso = `${year}-${formattedMonth}-${formattedDay}`;

    setSelectedCalendarDate(clickedIso);
    setIsEventModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Header & Controls */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl cartoon-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sunshine-400/20 border border-sunshine-400/30 flex items-center justify-center text-sunshine-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              {monthNames[month]} {year}
            </h1>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevYear}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cartoon-btn"
            title="Previous Year"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cartoon-btn"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl bg-sunshine-400 text-black font-bold text-xs hover:bg-sunshine-500 transition-all cartoon-btn"
          >
            Today
          </button>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cartoon-btn"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={nextYear}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cartoon-btn"
            title="Next Year"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="scrollable flex-1 min-h-0 pr-1">

      {/* Days of Week Row */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
          <div key={day} className="py-2 text-sm font-extrabold text-white uppercase tracking-wider">
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-[500px]">
        {/* Empty Padding Cells */}
        {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
          <div key={`pad-${idx}`} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl opacity-40 min-h-[115px]" />
        ))}

        {/* Date Cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(dayNum).padStart(2, '0');
          const cellIso = `${year}-${formattedMonth}-${formattedDay}`;

          const isToday = cellIso === todayIso;
          const dayEvents = calendarEvents.filter(e => e.date === cellIso);

          return (
            <div
              key={`grid-day-${dayNum}`}
              onClick={() => handleCellClick(dayNum)}
              className={`group min-h-[100px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between cartoon-card ${
                isToday
                ? 'bg-sunshine-400/12 border-sunshine-400/60 shadow-xl shadow-sunshine-500/20'
                : 'bg-black/30 border-white/15 hover:bg-black/40 hover:border-white/25'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
  className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-base transition-all ${
    isToday
      ? 'bg-sunshine-400 text-black shadow-lg'
      : 'text-white group-hover:text-white group-hover:bg-white/10'
  }`}
>
  {dayNum}
</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(dayNum);
                  }}
                  className="w-5 h-5 rounded-lg bg-white/5 group-hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/80"
                  title="Add Event"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Event list snippet (max 3) */}
              <div className="flex flex-col gap-1 mt-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold truncate ${
                      event.completed
                        ? 'bg-white/5 text-white/30 line-through'
                        : 'bg-coral-500/20 text-coral-200 border border-coral-500/30'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-sunshine-400 font-bold px-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div> {/* /scrollable */}
    </div>
  );
};
