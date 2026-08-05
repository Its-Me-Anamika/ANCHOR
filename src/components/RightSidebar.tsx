import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckSquare, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDateISO } from '../utils/helpers';

export const RightSidebar: React.FC = () => {
  const { 
    tasks, 
    toggleTask, 
    calendarEvents, 
    setCurrentView, 
    setSelectedCalendarDate 
  } = useStore();

  const [displayDate, setDisplayDate] = useState<Date>(new Date());

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayIso = formatDateISO();

  // Filter tasks to ONLY today's scheduled incomplete tasks
  const todayTasks = tasks.filter(task => {
    const taskDate = task.date || (task.createdAt ? formatDateISO(new Date(task.createdAt)) : '');
    return taskDate === todayIso && !task.completed;
  });

  const handleDateClick = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const clickedIso = `${year}-${formattedMonth}-${formattedDay}`;
    
    setSelectedCalendarDate(clickedIso);
    setCurrentView('calendar');
  };

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-5 h-screen py-6 pr-6 pl-2 z-30 select-none overflow-y-auto">
      {/* 3.1 Mini Calendar (View Only) */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl cartoon-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sunshine-400" />
            <span>{monthNames[month]} {year}</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cartoon-btn"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cartoon-btn"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
            <span key={day} className="text-[11px] font-semibold text-white/30">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty padding cells */}
          {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-7" />
          ))}

          {/* Date cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(dayNum).padStart(2, '0');
            const cellIso = `${year}-${formattedMonth}-${formattedDay}`;

            const isToday = cellIso === todayIso;
            const hasEvent = calendarEvents.some(e => e.date === cellIso);

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => handleDateClick(dayNum)}
                className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center text-xs relative transition-all duration-200 cartoon-btn ${
                  isToday
                    ? 'bg-sunshine-400 text-black font-bold shadow-md scale-105'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span>{dayNum}</span>
                {hasEvent && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-0.5 ${isToday ? 'bg-black' : 'bg-sky-400 animate-pulse'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3.2 Today's Tasks (View-Only Glance) */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 flex flex-col shadow-xl cartoon-card min-h-[220px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-coral-400" />
            <span>Today's Tasks</span>
          </h3>
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-[11px] text-sunshine-400 hover:underline font-semibold"
          >
            View All
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-white/30">
            <span className="text-2xl block mb-1">✨</span>
            <p className="text-xs font-semibold">No tasks for today</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
            {todayTasks.map((task) => (
              <li
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // Handled by container click
                  className="w-3.5 h-3.5 mt-0.5 rounded border-white/20 text-coral-500 focus:ring-0 cursor-pointer accent-coral-500"
                />
                <span className="text-xs break-words leading-snug text-white/80 group-hover:text-white transition-all">
                  {task.text.startsWith('[Event] ') ? task.text.replace('[Event] ', '') : task.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};
