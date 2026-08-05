import React, { useState } from 'react';
import { Bell, Plus, Trash2, Clock, Repeat, Sun, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ReminderType, Reminder } from '../types';

export const RemindersView: React.FC = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useStore();

  const [type, setType] = useState<ReminderType>('time');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('14:30');
  const [interval, setInterval] = useState(60);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (type === 'time') {
      addReminder({
        type: 'time',
        time,
        message: message.trim(),
        active: true,
        days: selectedDays
      });
    } else if (type === 'interval') {
      addReminder({
        type: 'interval',
        interval: Number(interval),
        message: message.trim(),
        active: true
      });
    } else {
      addReminder({
        type: 'daily',
        time,
        message: message.trim(),
        active: true
      });
    }

    setMessage('');
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl cartoon-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-peach-500/20 border border-peach-500/30 flex items-center justify-center text-peach-400 flex-shrink-0">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Reminders & Nudges
            </h1>
            <p className="text-xs text-white/40">Stay mindful, hydrated, and focused with gentle alerts</p>
          </div>
        </div>

        {/* Type Selector Pills */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
          {(['time', 'interval', 'daily'] as ReminderType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cartoon-btn ${
                type === t
                  ? 'bg-peach-500 text-white shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Creation Card - Fixed at top */}
      <form onSubmit={handleAdd} className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl cartoon-card flex flex-col gap-4 flex-shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-peach-400 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Set New {type === 'time' ? 'Time-Based' : type === 'interval' ? 'Interval' : 'Daily Routine'} Reminder</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-white/60 font-semibold mb-1 block">Reminder Message</label>
            <input
              type="text"
              placeholder="e.g. Drink a glass of water & take a deep breath 💧"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-peach-400 font-medium"
              required
            />
          </div>

          {type === 'time' && (
            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">Target Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-peach-400 font-mono"
              />
            </div>
          )}

          {type === 'interval' && (
            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">Every (Minutes)</label>
              <select
                value={interval}
                onChange={e => setInterval(Number(e.target.value))}
                className="w-full bg-[#1e1b2e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-peach-400"
              >
                {[15, 30, 45, 60, 90, 120].map(m => (
                  <option key={m} value={m}>{m} minutes</option>
                ))}
              </select>
            </div>
          )}

          {type === 'daily' && (
            <div>
              <label className="text-xs text-white/60 font-semibold mb-1 block">Daily Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-peach-400 font-mono"
              />
            </div>
          )}
        </div>

        {/* Days Filter for Time-Based */}
        {type === 'time' && (
          <div>
            <label className="text-xs text-white/60 font-semibold mb-1.5 block">Active Days</label>
            <div className="flex gap-2">
              {dayNames.map((d, idx) => {
                const isSel = selectedDays.includes(idx);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cartoon-btn ${
                      isSel ? 'bg-peach-500 text-white shadow-md' : 'bg-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!message.trim()}
          className="w-full mt-2 py-3 bg-peach-500 hover:bg-peach-600 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-all shadow-lg cartoon-btn"
        >
          Add Reminder
        </button>
      </form>

      {/* Scrollable content area */}
      <div className="scrollable flex-1 min-h-0 pr-1">
        {/* Active Reminders List */}
        <div className="flex flex-col gap-3 pb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 px-1">
            Configured Reminders ({reminders.length})
          </h3>

          {reminders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white/30 bg-white/5 border border-white/10 rounded-2xl">
              <Sparkles className="w-8 h-8 mb-3 text-peach-400/50 animate-pulse" />
              <h3 className="text-base font-bold text-white/50">No reminders configured</h3>
              <p className="text-xs mt-1">Set a gentle interval or time alert above!</p>
            </div>
          ) : (
            reminders.map(rem => (
              <div
                key={rem.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cartoon-card ${
                  rem.active ? 'bg-white/5 border-white/10 text-white' : 'bg-white/[0.02] border-white/5 text-white/40'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <div className="p-2.5 rounded-xl bg-white/5 text-peach-400 shrink-0">
                    {rem.type === 'time' ? <Clock className="w-5 h-5" /> : rem.type === 'interval' ? <Repeat className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-sm md:text-base font-bold leading-snug">
                      {rem.message}
                    </h4>
                    <p className="text-xs text-white/50 mt-0.5 font-mono">
                      {rem.type === 'time' && `Daily at ${rem.time}`}
                      {rem.type === 'interval' && `Every ${rem.interval} minutes`}
                      {rem.type === 'daily' && `Daily routine at ${rem.time}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cartoon-btn ${
                      rem.active ? 'bg-peach-500' : 'bg-white/20'
                    }`}
                    title={rem.active ? 'Disable Reminder' : 'Enable Reminder'}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      rem.active ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-2 rounded-xl bg-coral-500/10 hover:bg-coral-500/30 text-coral-400 hover:text-coral-200 transition-colors cartoon-btn"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
