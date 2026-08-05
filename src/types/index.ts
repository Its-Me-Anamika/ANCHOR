export type ViewMode = 
  | 'dashboard' 
  | 'calendar' 
  | 'tasks' 
  | 'notes' 
  | 'reminders' 
  | 'weather'
  | 'themes' 
  | 'settings';

// ─── Weather ──────────────────────────────────────────────────────────────────
export interface SavedCity {
  id: string;          // unique: e.g. "lat_lon" string
  name: string;
  country: string;
  lat: number;
  lon: number;
  isOnDashboard: boolean; // pinned to home widget (max 2)
}

export interface WeatherResult {
  cityId: string;
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  windKmh: number;
  humidity: number;
  updatedAt: string; // ISO timestamp of last successful fetch
  timezone?: string;          // IANA timezone e.g. "Asia/Kolkata"
  utcOffsetSeconds?: number;  // raw UTC offset in seconds e.g. 19800
}

export type ZenSubMode = 'clock' | 'timer' | 'stopwatch';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  date?: string; // YYYY-MM-DD format
}

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';

export interface Note {
  id: string;
  content: string;
  color: NoteColor;
  createdAt: string;
  sticker?: string;
}

export type ReminderType = 'time' | 'interval' | 'daily';

export interface Reminder {
  id: string;
  type: ReminderType;
  time?: string; // HH:mm format for time-based & daily routine
  interval?: number; // Minutes: 15, 30, 45, 60, 90, 120
  message: string;
  active: boolean;
  days?: number[]; // [0,1,2,3,4,5,6] (Sun-Sat)
  lastTriggered?: string; // ISO string
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  completed?: boolean;
  createdAt: string;
}

export type ThemeId = 
  | 'pure-black' 
  | 'midnight' 
  | 'tokyo-night' 
  | 'forest' 
  | 'ocean' 
  | 'warm-coffee' 
  | 'paper-white'
  | 'warm-latte'
  | 'terracotta-dream'
  | 'sage-green'
  | 'dusky-rose'
  | 'golden-hour'
  | 'cool-gray'
  | 'deep-navy';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  emoji: string;
  bg: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
  previewBg: string;
}

export interface AppSettings {
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  soundEnabled: boolean;
  theme: ThemeId;
  wallpaper: string; // Base64 or empty
  wallpaperOpacity: number; // 20-100
  wallpaperBlur: number; // 0-20
}

export interface ExportData {
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
  settings: AppSettings;
  savedCities?: SavedCity[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'reminder';
}
