import { Task, Note, Reminder, CalendarEvent, AppSettings, ThemeId, ExportData, SavedCity } from '../types';

const KEYS = {
  TASKS: 'tasks',
  NOTES: 'notes',
  REMINDERS: 'reminders',
  CALENDAR_EVENTS: 'calendarEvents',
  THEME: 'theme',
  CLOCK_FORMAT: 'clockFormat',
  SHOW_SECONDS: 'showSeconds',
  SOUND_ENABLED: 'soundEnabled',
  WALLPAPER: 'wallpaper',
  WALLPAPER_OPACITY: 'wallpaperOpacity',
  WALLPAPER_BLUR: 'wallpaperBlur',
  SAVED_CITIES: 'savedCities',
} as const;

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  clockFormat: '24h',
  showSeconds: true,
  soundEnabled: true,
  theme: 'pure-black',
  wallpaper: '',
  wallpaperOpacity: 50,
  wallpaperBlur: 5,
};

// Safe JSON parser
function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Safe JSON setter
function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

// Raw string getter/setter for wallpaper and individual settings
function getRawItem(key: string, fallback: string): string {
  try {
    const val = localStorage.getItem(key);
    if (val === null || val === undefined || val === '') return fallback;
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'string') return parsed;
    } catch {
      // Not JSON stringified, use raw string
    }
    return val;
  } catch (e) {
    return fallback;
  }
}

function setRawItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Silent handling
  }
}

export const storage = {
  getTasks(): Task[] {
    return getItem<Task[]>(KEYS.TASKS, []);
  },
  saveTasks(tasks: Task[]): void {
    setItem(KEYS.TASKS, tasks);
  },

  getNotes(): Note[] {
    return getItem<Note[]>(KEYS.NOTES, [
      {
        id: 'welcome-note-1',
        content: 'Welcome to ANCHOR! ⚓ Your cozy, offline-first sanctuary. Click any sticky note to edit your thoughts.',
        color: 'yellow',
        createdAt: new Date().toISOString()
      },
      {
        id: 'welcome-note-2',
        content: 'Quick tip: Double click a note or use Ctrl+N anytime to quickly jot down fresh ideas! 💡',
        color: 'pink',
        createdAt: new Date().toISOString()
      }
    ]);
  },
  saveNotes(notes: Note[]): void {
    setItem(KEYS.NOTES, notes);
  },

  getReminders(): Reminder[] {
    return getItem<Reminder[]>(KEYS.REMINDERS, [
      {
        id: 'rem-hydrat-1',
        type: 'interval',
        interval: 60,
        message: 'Drink a glass of water & stretch! 💧',
        active: true,
      },
      {
        id: 'rem-lunch-1',
        type: 'daily',
        time: '13:00',
        message: 'Time for a nourishing lunch break 🥗',
        active: true,
      }
    ]);
  },
  saveReminders(reminders: Reminder[]): void {
    setItem(KEYS.REMINDERS, reminders);
  },

  getCalendarEvents(): CalendarEvent[] {
    return getItem<CalendarEvent[]>(KEYS.CALENDAR_EVENTS, []);
  },
  saveCalendarEvents(events: CalendarEvent[]): void {
    setItem(KEYS.CALENDAR_EVENTS, events);
  },

  getSavedCities(): SavedCity[] {
    return getItem<SavedCity[]>(KEYS.SAVED_CITIES, []);
  },
  saveSavedCities(cities: SavedCity[]): void {
    setItem(KEYS.SAVED_CITIES, cities);
  },

  getSettings(): AppSettings {
    const theme = (getRawItem(KEYS.THEME, DEFAULT_SETTINGS.theme) as ThemeId) || DEFAULT_SETTINGS.theme;
    const clockFormat = (getRawItem(KEYS.CLOCK_FORMAT, DEFAULT_SETTINGS.clockFormat) as '12h' | '24h') || DEFAULT_SETTINGS.clockFormat;
    const showSeconds = getRawItem(KEYS.SHOW_SECONDS, 'true') === 'true';
    const soundEnabled = getRawItem(KEYS.SOUND_ENABLED, 'true') === 'true';
    const wallpaper = getRawItem(KEYS.WALLPAPER, '');
    const wallpaperOpacity = parseInt(getRawItem(KEYS.WALLPAPER_OPACITY, '50'), 10);
    const wallpaperBlur = parseInt(getRawItem(KEYS.WALLPAPER_BLUR, '5'), 10);

    return {
      theme,
      clockFormat,
      showSeconds,
      soundEnabled,
      wallpaper,
      wallpaperOpacity,
      wallpaperBlur,
    };
  },

  saveSettings(settings: AppSettings): void {
    setRawItem(KEYS.THEME, settings.theme);
    setRawItem(KEYS.CLOCK_FORMAT, settings.clockFormat);
    setRawItem(KEYS.SHOW_SECONDS, String(settings.showSeconds));
    setRawItem(KEYS.SOUND_ENABLED, String(settings.soundEnabled));
    setRawItem(KEYS.WALLPAPER, settings.wallpaper);
    setRawItem(KEYS.WALLPAPER_OPACITY, String(settings.wallpaperOpacity));
    setRawItem(KEYS.WALLPAPER_BLUR, String(settings.wallpaperBlur));
  },

  exportAllData(): ExportData {
    return {
      tasks: this.getTasks(),
      notes: this.getNotes(),
      reminders: this.getReminders(),
      calendarEvents: this.getCalendarEvents(),
      settings: this.getSettings(),
      savedCities: this.getSavedCities(),
    };
  },

  importAllData(data: Partial<ExportData>): boolean {
    try {
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.notes)) this.saveNotes(data.notes);
      if (Array.isArray(data.reminders)) this.saveReminders(data.reminders);
      if (Array.isArray(data.calendarEvents)) this.saveCalendarEvents(data.calendarEvents);
      if (Array.isArray(data.savedCities)) this.saveSavedCities(data.savedCities);
      if (data.settings) this.saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      return true;
    } catch (e) {
      return false;
    }
  },

  resetAllData(): void {
    try {
      localStorage.clear();
    } catch (e) {
      // Silent error
    }
  }
};
