import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  Task, 
  Note, 
  Reminder, 
  CalendarEvent, 
  AppSettings, 
  ViewMode, 
  ZenSubMode, 
  ToastMessage, 
  NoteColor,
  SavedCity
} from '../types';
import { storage } from '../utils/storage';
import { formatDateISO, playGentleChime, triggerConfetti, formatTimeDigit } from '../utils/helpers';

interface StoreContextType {
  // Navigation & Overlays
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  zenMode: boolean;
  setZenMode: (open: boolean) => void;
  zenSubMode: ZenSubMode;
  setZenSubMode: (mode: ZenSubMode) => void;
  activeDashboardCard: 'none' | 'timer' | 'stopwatch';
  setActiveDashboardCard: (card: 'none' | 'timer' | 'stopwatch') => void;
  
  // Selected Date for Calendar
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  isEventModalOpen: boolean;
  setIsEventModalOpen: (open: boolean) => void;

  // Tasks
  tasks: Task[];
  addTask: (text: string, date?: string) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, text: string) => void;

  // Notes
  notes: Note[];
  addNote: (color?: NoteColor) => Note;
  updateNote: (id: string, content: string, color?: NoteColor, sticker?: string) => void;
  deleteNote: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => Reminder;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (title: string, description?: string, date?: string) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Data management
  resetData: () => void;
  importData: (data: Parameters<typeof storage.importAllData>[0]) => boolean;

  // Weather — Saved Cities
  savedCities: SavedCity[];
  addCity: (city: Omit<SavedCity, 'id' | 'isOnDashboard'>) => void;
  removeCity: (id: string) => void;
  toggleCityOnDashboard: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [zenMode, setZenModeState] = useState<boolean>(false);
  const [zenSubMode, setZenSubMode] = useState<ZenSubMode>('clock');
  const [activeDashboardCard, setActiveDashboardCardState] = useState<'none' | 'timer' | 'stopwatch'>('none');

  // Calendar Modal State
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(formatDateISO());
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);

  // Entities State
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [notes, setNotes] = useState<Note[]>(() => storage.getNotes());
  const [reminders, setReminders] = useState<Reminder[]>(() => storage.getReminders());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => storage.getCalendarEvents());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedCities, setSavedCities] = useState<SavedCity[]>(() => storage.getSavedCities());

  // Wrapper for setting dashboard active card that also remembers mode for Zen Mode
  const setActiveDashboardCard = useCallback((card: 'none' | 'timer' | 'stopwatch') => {
    setActiveDashboardCardState(card);
    if (card === 'timer') {
      setZenSubMode('timer');
    } else if (card === 'stopwatch') {
      setZenSubMode('stopwatch');
    }
  }, []);

  // Zen Mode toggle wrapper
  const setZenMode = useCallback((open: boolean) => {
    if (open) {
      if (activeDashboardCard === 'timer') {
        setZenSubMode('timer');
      } else if (activeDashboardCard === 'stopwatch') {
        setZenSubMode('stopwatch');
      } else {
        setZenSubMode('clock');
      }
    }
    setZenModeState(open);
  }, [activeDashboardCard]);

  // Toast System
  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);

    if (settings.soundEnabled) {
      playGentleChime();
    }

    // Auto dismiss after 10 seconds as per exact requirement 7.2
    setTimeout(() => {
      removeToast(id);
    }, 10000);
  }, [settings.soundEnabled]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Task Operations
  const addTask = useCallback((text: string, date?: string): Task => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      date: date || formatDateISO()
    };
    setTasks(prev => {
      const next = [newTask, ...prev];
      storage.saveTasks(next);
      return next;
    });
    return newTask;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          if (updated.completed) triggerConfetti();
          return updated;
        }
        return t;
      });
      storage.saveTasks(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      storage.saveTasks(next);
      return next;
    });
  }, []);

  const updateTask = useCallback((id: string, text: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, text } : t);
      storage.saveTasks(next);
      return next;
    });
  }, []);

  // Note Operations
  const addNote = useCallback((color: NoteColor = 'yellow'): Note => {
    const colors: NoteColor[] = ['yellow', 'blue', 'green', 'pink', 'purple'];
    const chosenColor = color || colors[Math.floor(Math.random() * colors.length)];
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      color: chosenColor,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => {
      const next = [newNote, ...prev];
      storage.saveNotes(next);
      return next;
    });
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, content: string, color?: NoteColor, sticker?: string) => {
    setNotes(prev => {
      const next = prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            content,
            color: color || n.color,
            sticker: sticker !== undefined ? (sticker || undefined) : n.sticker
          };
        }
        return n;
      });
      storage.saveNotes(next);
      return next;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      storage.saveNotes(next);
      return next;
    });
  }, []);

  // Reminder Operations
  const addReminder = useCallback((reminderData: Omit<Reminder, 'id'>): Reminder => {
    const newRem: Reminder = {
      ...reminderData,
      id: Date.now().toString()
    };
    setReminders(prev => {
      const next = [newRem, ...prev];
      storage.saveReminders(next);
      return next;
    });
    return newRem;
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, active: !r.active } : r);
      storage.saveReminders(next);
      return next;
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id);
      storage.saveReminders(next);
      return next;
    });
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      storage.saveReminders(next);
      return next;
    });
  }, []);

  // Calendar Event Operations
  // EXACT REQUIREMENT 4.3 & 5: When user adds calendar event -> also creates task!
  const addCalendarEvent = useCallback((title: string, description?: string, date?: string): CalendarEvent => {
    const eventDate = date || selectedCalendarDate || formatDateISO();
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description?.trim(),
      date: eventDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setCalendarEvents(prev => {
      const next = [newEvent, ...prev];
      storage.saveCalendarEvents(next);
      return next;
    });

    // Auto create matching Task immediately as per Requirement 4.3!
    addTask(`[Event] ${title.trim()}`, eventDate);

    return newEvent;
  }, [selectedCalendarDate, addTask]);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      storage.saveCalendarEvents(next);
      return next;
    });
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      storage.saveCalendarEvents(next);
      return next;
    });
  }, []);

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      storage.saveSettings(next);
      return next;
    });
  }, []);

  // Reset Data
  const resetData = useCallback(() => {
    storage.resetAllData();
    setTasks([]);
    setNotes([]);
    setReminders([]);
    setCalendarEvents([]);
    setSettings(storage.getSettings());
    setSavedCities([]);
  }, []);

  // Import Data
  const importData = useCallback((data: Parameters<typeof storage.importAllData>[0]): boolean => {
    const success = storage.importAllData(data);
    if (success) {
      setTasks(storage.getTasks());
      setNotes(storage.getNotes());
      setReminders(storage.getReminders());
      setCalendarEvents(storage.getCalendarEvents());
      setSettings(storage.getSettings());
      setSavedCities(storage.getSavedCities());
    }
    return success;
  }, []);

  // Weather — City Management
  const addCity = useCallback((city: Omit<SavedCity, 'id' | 'isOnDashboard'>) => {
    const id = `${city.lat.toFixed(4)}_${city.lon.toFixed(4)}`;
    setSavedCities(prev => {
      if (prev.some(c => c.id === id)) return prev; // already saved
      const next = [...prev, { ...city, id, isOnDashboard: false }];
      storage.saveSavedCities(next);
      return next;
    });
  }, []);

  const removeCity = useCallback((id: string) => {
    setSavedCities(prev => {
      const next = prev.filter(c => c.id !== id);
      storage.saveSavedCities(next);
      return next;
    });
  }, []);

  const toggleCityOnDashboard = useCallback((id: string) => {
    setSavedCities(prev => {
      const dashCount = prev.filter(c => c.isOnDashboard).length;
      const next = prev.map(c => {
        if (c.id !== id) return c;
        // Enforce max 4 on dashboard
        if (!c.isOnDashboard && dashCount >= 4) return c;
        return { ...c, isOnDashboard: !c.isOnDashboard };
      });
      storage.saveSavedCities(next);
      return next;
    });
  }, []);

  // Background Reminder Loop (Check every 60 seconds as per Requirement 7.2)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${formatTimeDigit(now.getHours())}:${formatTimeDigit(now.getMinutes())}`;
      const currentDay = now.getDay(); // 0-6
      const nowTs = now.getTime();

      setReminders(prevReminders => {
        let updated = false;
        const nextReminders = prevReminders.map(r => {
          if (!r.active) return r;

          let shouldTrigger = false;

          if (r.type === 'time' || r.type === 'daily') {
            if (r.time === currentHHMM) {
              // Check day filter if present
              if (!r.days || r.days.includes(currentDay)) {
                // Prevent duplicate triggers in the same minute
                const lastTrigger = r.lastTriggered ? new Date(r.lastTriggered).getTime() : 0;
                if (nowTs - lastTrigger > 55000) {
                  shouldTrigger = true;
                }
              }
            }
          } else if (r.type === 'interval' && r.interval) {
            const lastTrigger = r.lastTriggered ? new Date(r.lastTriggered).getTime() : 0;
            const intervalMs = r.interval * 60 * 1000;
            if (nowTs - lastTrigger >= intervalMs) {
              shouldTrigger = true;
            }
          }

          if (shouldTrigger) {
            updated = true;
            // Notify via in-app toast
            addToast('🔔 Reminder', r.message, 'reminder');
            
            // Browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('ANCHOR Reminder ⚓', { body: r.message });
            }

            return { ...r, lastTriggered: now.toISOString() };
          }

          return r;
        });

        if (updated) {
          storage.saveReminders(nextReminders);
        }
        return nextReminders;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [addToast]);

  return (
    <StoreContext.Provider value={{
      currentView,
      setCurrentView,
      zenMode,
      setZenMode,
      zenSubMode,
      setZenSubMode,
      activeDashboardCard,
      setActiveDashboardCard,
      selectedCalendarDate,
      setSelectedCalendarDate,
      isEventModalOpen,
      setIsEventModalOpen,
      tasks,
      addTask,
      toggleTask,
      deleteTask,
      updateTask,
      notes,
      addNote,
      updateNote,
      deleteNote,
      reminders,
      addReminder,
      toggleReminder,
      deleteReminder,
      updateReminder,
      calendarEvents,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      settings,
      updateSettings,
      toasts,
      addToast,
      removeToast,
      resetData,
      importData,
      savedCities,
      addCity,
      removeCity,
      toggleCityOnDashboard,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
