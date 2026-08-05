import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Plus, Trash2, Edit3, CheckSquare, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CalendarEvent } from '../types';

export const EventModal: React.FC = () => {
  const { 
    isEventModalOpen, 
    setIsEventModalOpen, 
    selectedCalendarDate, 
    calendarEvents, 
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent,
    addToast
  } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  if (!isEventModalOpen) return null;

  // Filter events for selected date
  const dayEvents = calendarEvents.filter(e => e.date === selectedCalendarDate);

  // Format header date nicely
  const [yearStr, monthStr, dayStr] = selectedCalendarDate.split('-');
  const dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
  const formattedHeaderDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEventId) {
      updateCalendarEvent(editingEventId, {
        title: title.trim(),
        description: description.trim()
      });
      addToast('Calendar Updated', 'Event updated successfully ✨', 'success');
      setEditingEventId(null);
    } else {
      addCalendarEvent(title.trim(), description.trim(), selectedCalendarDate);
      addToast('Event Added! 📅', 'Added to Calendar & Task list automatically!', 'success');
    }

    setTitle('');
    setDescription('');
  };

  const startEdit = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
  };

  const cancelEdit = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-pop">
      <div className="bg-[#1e1b2e] border border-white/10 rounded-2xl p-6 w-full max-w-[500px] shadow-2xl relative cartoon-card">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5 text-sunshine-400">
            <CalendarIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              {formattedHeaderDate}
            </h2>
          </div>
          <button
            onClick={() => setIsEventModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors cartoon-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Events List for Date */}
        {dayEvents.length > 0 && (
          <div className="mb-5 max-h-48 overflow-y-auto pr-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
              Scheduled Events ({dayEvents.length})
            </h3>
            <div className="flex flex-col gap-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start justify-between group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                    <button
                      onClick={() => updateCalendarEvent(event.id, { completed: !event.completed })}
                      className="mt-0.5"
                    >
                      <CheckSquare className={`w-4 h-4 transition-colors ${event.completed ? 'text-mint-400' : 'text-white/30 hover:text-white/70'}`} />
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold leading-tight ${event.completed ? 'line-through text-white/40' : 'text-white'}`}>
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(event)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cartoon-btn"
                      title="Edit Event"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      className="p-1.5 rounded-lg bg-coral-500/20 hover:bg-coral-500/40 text-coral-400 hover:text-coral-200 transition-colors cartoon-btn"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Event Form */}
        <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sunshine-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingEventId ? 'Edit Event' : 'Add New Event'}</span>
            </h3>
            {editingEventId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-white/50 hover:text-white underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Event title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sunshine-400 transition-all font-medium"
            autoFocus
            required
          />

          <textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sunshine-400 transition-all resize-none"
          />

          <button
            type="submit"
            className="w-full mt-1 py-3 bg-gradient-to-r from-coral-500 to-peach-500 hover:from-coral-600 hover:to-peach-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cartoon-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{editingEventId ? 'Update Event' : 'Add to Calendar & Tasks'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
