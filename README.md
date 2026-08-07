# ⚓ ANCHOR — Personal Productivity Sanctuary

> *A calm, offline-first productivity dashboard built for deep work, daily rhythm, and personal peace.*

---

## Overview

**ANCHOR** is a self-contained, browser-based productivity application that lives entirely in your browser — no accounts, no servers, no cloud dependencies. It combines a real-time flip clock, focus timer, sticky notes, tasks, calendar, reminders, a live weather dashboard, and a distraction-free Zen Mode into a single, cohesive daily workspace.

Everything is stored locally via `localStorage`. Data can be exported and restored as a portable JSON backup at any time.

---

## Motivation

Most productivity apps are noisy — they demand logins, send push notifications from the cloud, and require constant internet access. ANCHOR is a deliberate departure from that model: a beautifully designed digital desk that stays with you, works offline, respects your focus, and feels like a sanctuary rather than a tool.

---

## Key Features

### 🏠 Dashboard (Home)
- **Animated Flip Clock** — real-time, minute-level digit flip animations with configurable 12h/24h format and optional seconds display
- **Time-aware greeting** — Good Morning/Afternoon/Evening/Night with emoji based on local time
- **Rotating motivational quotes** — 17 curated quotes cycling on each session
- **Live Weather Widget** — compact city chips showing icon, temperature, city name, country, and local time; auto-refreshes every 30 minutes
- **Expandable Timer Card** — Pomodoro-style countdown (5 presets: 5–60 min), play/pause/reset, confetti burst + toast on completion
- **Expandable Stopwatch Card** — centisecond-precision, start/pause/reset
- **Zen Mode launcher** — one-click entry into distraction-free fullscreen

### 🧘 Zen Mode
- Full-screen black overlay with three sub-modes: **Clock**, **Timer**, and **Stopwatch**
- Controls auto-hide after 2 seconds of inactivity; reappear on any mouse movement
- **Screen Wake Lock API** — prevents the display from sleeping for the entire Zen session; reacquires lock automatically on tab visibility restore
- Exit via `Esc` key or the floating exit button
- Radial ambient glow effect behind the clock

### 🗒️ Sticky Notes
- Compact sticky note card grid (1–3 columns, responsive)
- 5 card color themes: **Yellow**, **Blue**, **Green**, **Pink**, **Purple**
- **TipTap rich text editor** modal: Bold, Italic, Underline, Strikethrough, Bullet lists, Ordered lists, H1/H2 headings, 7-color text palette, emoji insertion panel
- **14 decorative sticker badges** (Star, Heart, Coffee, Rocket, Flame, etc.) rendered as physical paper-pin overlays
- **Auto-save drafts** to `localStorage` per note — unsaved changes persist across page refreshes with a restore prompt
- **Unsaved-changes guard** — confirmation modal before discarding edits
- 2,000-character limit per note with live counter
- `Ctrl + S` to save; `Esc` to cancel/close editor; `Ctrl + N` to create a new yellow note from anywhere

### ✅ Tasks
- Simple task list with `checkbox` completion toggle
- Optional date association (`YYYY-MM-DD`) for calendar integration
- Completed tasks shown with strikethrough styling; incomplete today-tasks surfaced in the right sidebar
- `Ctrl + T` keyboard shortcut to jump to Tasks from any view

### 📅 Calendar
- Full monthly calendar grid view
- Add, view, and delete events on any date via the **Event Modal**
- Event dots rendered on calendar day cells; clickable to open events for that day
- Right sidebar shows a mini-calendar (navigable by month) and today's incomplete tasks at a glance

### 🔔 Reminders
- Three reminder types:
  - **Time-based** — triggers at a specific time, with optional day-of-week selection (Sun–Sat checkboxes)
  - **Interval** — fires every N minutes (15 / 30 / 45 / 60 / 90 / 120)
  - **Daily Routine** — fires every day at the same time
- Per-reminder enable/disable toggle and delete
- Gentle chime audio synthesized via Web Audio API (no external audio files) when a reminder triggers
- Two default reminders pre-loaded: a hydration nudge (60 min) and a lunch reminder (13:00)

### 🌤️ Weather
- Powered by **Open-Meteo API** (completely free, no API key required)
- **Current Location card** with 4 states: Loading → Success → Permission Denied → Browser Unsupported
  - Reverse geocoding via BigDataCloud API to display actual city & country name
  - Retry button inside the card; never hangs in a loading state (15-second safety timeout)
- **City search** with worldwide geocoding (300 ms debounce), returns City / State / Country in dropdown
  - Search suggestions rendered as a floating panel with proper `z-index`, solid background, max-height scroll, and `Esc` to close
- **Saved cities grid** — responsive auto-fill CSS Grid (`minmax(280px, 1fr)`)
- Each city card displays: icon, temperature, condition, local time (using IANA timezone, updated every 10 seconds without API calls), UTC offset relative to user's timezone (`+5 hr 30 min` format), wind speed, humidity, feels-like temperature, and last-updated timestamp
- Stale data warning (⚠️) if cached weather is older than 90 minutes
- **Offline-first**: weather results cached per city in `localStorage`; served from cache when network is unavailable
- **Dashboard widget** — up to 5 location chips (current location + 4 pinned saved cities); pin/unpin via kebab menu `⋮` on each card
- **30-minute auto-refresh** while the app is running
- Full data export/import includes saved cities

### 🎨 Themes
- **14 built-in themes**: Pure Black, Midnight, Tokyo Night, Forest, Ocean, Warm Coffee, Paper White, Warm Latte, Terracotta Dream, Sage Green, Dusky Rose, Golden Hour, Cool Gray, Deep Navy
- All colors applied via CSS custom properties (`--color-bg`, `--color-surface`, `--color-accent`, etc.) — every component inherits the active theme automatically
- **Custom wallpaper upload** — PNG/JPG/WebP up to 5 MB; stored as base64
  - Adjustable opacity (20–100%) and blur (0–20 px) via range sliders

### ⚙️ Settings
- Clock format toggle: 12-hour / 24-hour
- Show/hide seconds on the flip clock
- Sound notification toggle (gentle C5+E5 sine-wave chime via Web Audio API)
- **Export data** — full JSON backup of tasks, notes, reminders, calendar events, settings, and saved weather cities
- **Import data** — restore from a previously exported JSON file
- **Reset workspace** — clears all `localStorage` data with a confirmation modal
- Keyboard shortcuts reference table

---

## Screenshots

| View | Description |
|---|---|
| `docs\dashboard.png` | Flip clock, greeting, weather widget, and timer/stopwatch buttons |
| `docs\zen_mode.png` | Full-screen clock/timer mode with ambient glow and auto-hiding controls |
| `notes.png` | Sticky note card grid with the TipTap rich-text editor modal open |
| `weather.png` | Full weather dashboard with city cards showing local times |
| `docs\theme.png` | Theme selector grid and wallpaper upload panel |
| `docs\calendar.png` | Monthly calendar with event dots and the Event Modal |

---

## Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + Vanilla CSS custom properties |
| Rich Text Editor | TipTap 3 (StarterKit, Underline, TextStyle, Color) |
| Icons | Lucide React |
| Confetti | canvas-confetti |
| Fonts | Nunito, Outfit, Patrick Hand, JetBrains Mono (Google Fonts) |
| Weather API | Open-Meteo (forecast + geocoding) — free, no API key |
| Reverse Geocoding | BigDataCloud reverse-geocode-client — free, no API key |
| Data Persistence | Browser `localStorage` only |
| Audio | Web Audio API (synthesized, no audio files) |
| Screen Wake | Screen Wake Lock API |
| State Management | React Context + `useReducer`-style custom store |

---

## Architecture Overview

ANCHOR follows a layered, single-context architecture:

```
index.html
└── main.tsx                  Entry point
    └── App.tsx               Root: StoreProvider → MainLayout
        ├── store/useStore    Global state via React Context (all views read/write here)
        ├── Sidebar           Left icon navigation (80px fixed)
        ├── main content      View-conditional rendering (one view at a time)
        ├── RightSidebar      Mini calendar + today's tasks (hidden on small screens)
        ├── ZenMode           Fixed fullscreen overlay, always rendered
        ├── EventModal        Calendar event modal
        └── ToastContainer    Global toast notification layer
```

**State management** is handled by a single `useStore` Context which wraps all application state: tasks, notes, reminders, calendar events, saved cities, settings, and UI state (current view, zen mode, active dashboard card). All mutations are synchronised to `localStorage` immediately via the `storage` utility module.

**Theme system** uses six CSS custom properties injected onto `document.documentElement` whenever the theme changes. Every view and component reads colors through `var(--color-*)` — there are no hardcoded color values in any view component.

**Weather system** uses a `useWeather` hook with a proper 4-state location machine (`idle → loading → success/denied/unsupported`), a 15-second safety timeout on geolocation, silent 30-minute background refresh, and per-city `localStorage` caching keyed by `anchor_weather_{cityId}`.

---

## Folder Structure

```
ANCHOR/
├── index.html                  HTML shell (Google Fonts, meta, SVG anchor favicon)
├── package.json
├── tailwind.config.js          Custom colors, fonts (Nunito/Outfit/Patrick Hand/JetBrains Mono), keyframes
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                React entry point
    ├── App.tsx                 Root layout + theme injection + routing
    ├── index.css               Global styles (scrollbar, tiptap prose, cartoon-card utility classes)
    │
    ├── types/
    │   └── index.ts            All shared TypeScript interfaces and union types
    │
    ├── store/
    │   └── useStore.tsx        Single global Context with all state and actions
    │
    ├── utils/
    │   ├── helpers.ts          Quotes, greetings, date formatting, confetti, Web Audio chime
    │   ├── storage.ts          localStorage CRUD helpers, export/import/reset
    │   └── weather.ts          Open-Meteo fetch, BigDataCloud reverse geocoding, WMO decoder, cache helpers
    │
    ├── hooks/
    │   ├── useKeyboardShortcuts.ts   Global keyboard handler (Space, F11, Ctrl+T/N/,, Esc)
    │   └── useWeather.ts             Weather data orchestration hook (location state machine, intervals)
    │
    ├── components/
    │   ├── Sidebar.tsx         Left icon navigation
    │   ├── RightSidebar.tsx    Mini calendar + today's tasks panel
    │   ├── FlipClock.tsx       Animated digit-flip clock component
    │   ├── QuoteDisplay.tsx    Rotating motivational quote with refresh button
    │   ├── WeatherWidget.tsx   Compact home dashboard weather chips
    │   ├── WeatherPill.tsx     Legacy placeholder (superseded by WeatherWidget)
    │   ├── TimerCard.tsx       Expandable Pomodoro timer on dashboard
    │   ├── StopwatchCard.tsx   Expandable stopwatch on dashboard
    │   ├── EventModal.tsx      Calendar event creation/edit modal
    │   └── ToastContainer.tsx  Global toast notification renderer
    │
    └── views/
        ├── DashboardView.tsx   Home view (clock, quote, weather, timer/stopwatch)
        ├── CalendarView.tsx    Full monthly calendar grid
        ├── TasksView.tsx       Task list with checkbox completion
        ├── NotesView.tsx       Sticky note grid + TipTap editor modal
        ├── RemindersView.tsx   Reminder creation and list (time/interval/daily)
        ├── WeatherView.tsx     Full weather dashboard
        ├── ThemesView.tsx      Theme selector + wallpaper upload
        ├── SettingsView.tsx    Preferences, data backup, keyboard shortcuts
        └── ZenMode.tsx         Fullscreen clock/timer/stopwatch overlay
```

---

## Installation

**Prerequisites:** Node.js 18+ and npm 9+

```bash
# 1. Clone the repository
git clone https://github.com/your-username/anchor-dashboard.git
cd anchor-dashboard

# 2. Install dependencies
npm install
```

---

## Development

```bash
npm run dev
```

Opens the dev server at `http://localhost:5173` with hot module replacement.

---

## Production Build

```bash
npm run build
```

Outputs a static bundle to `dist/`. The entire app is a single-page application — deploy the `dist/` folder to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.).

To preview the production build locally:

```bash
npm run preview
```

---

## Usage

| Action | How |
|---|---|
| Switch views | Click icons in the left sidebar |
| New sticky note | Click **New Note** button or press `Ctrl + N` |
| Edit a sticky note | Click any note card |
| Save note | Press `Ctrl + S` or click **Save Note** |
| Start Focus Timer | Click **Timer** on dashboard → press Play |
| Zen Mode | Click **Zen Mode** button → press `Esc` to exit |
| Add weather city | Go to Weather → type in the search bar → click a result |
| Pin city to dashboard | Open a weather card → click `⋮` → **Add to Home** |
| Change theme | Go to Themes → click any palette card |
| Upload wallpaper | Go to Themes → **Custom Wallpaper Upload** |
| Export your data | Go to Settings → **Export Data (JSON)** |
| Import backup | Go to Settings → **Import Data (JSON)** |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Start / Pause Focus Timer (when timer is active) |
| `F11` | Toggle fullscreen |
| `Ctrl + T` | Jump to Tasks view |
| `Ctrl + N` | Create a new sticky note |
| `Ctrl + Shift + R` | Jump to Reminders |
| `Ctrl + ,` | Open Settings |
| `Esc` | Exit Zen Mode |
| `Ctrl + S` | Save the currently open note (inside editor) |

---

## Configuration

ANCHOR has no environment variables or external configuration files. All user preferences (clock format, theme, sound, wallpaper, etc.) are stored in `localStorage` under documented keys and are exposed through the **Settings** view.

**Default values** (first launch):
- Clock: 24-hour with seconds
- Theme: Pure Black
- Sound: Enabled
- Wallpaper: None

---

## Dependencies

### Runtime

| Package | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | ^18.3.1 | UI framework |
| `@tiptap/react` | ^3.29.2 | Rich text editor engine |
| `@tiptap/starter-kit` | ^3.29.2 | Core editor extensions (bold, italic, lists, headings, etc.) |
| `@tiptap/extension-underline` | ^3.29.2 | Underline text formatting |
| `@tiptap/extension-text-style` | ^3.29.2 | Text style (needed for color extension) |
| `@tiptap/extension-color` | ^3.29.2 | Per-character text color |
| `@tiptap/pm` | ^3.29.2 | ProseMirror peer dependency |
| `lucide-react` | ^0.395.0 | SVG icon library |
| `canvas-confetti` | ^1.9.3 | Confetti burst on timer completion |

### Dev / Build

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^5.3.1 | Build tool and dev server |
| `@vitejs/plugin-react` | ^4.3.1 | React Fast Refresh for Vite |
| `typescript` | ^5.4.5 | Static type checking |
| `tailwindcss` | ^3.4.4 | Utility-first CSS framework |
| `autoprefixer` / `postcss` | ^10.4 / ^8.4 | CSS post-processing |

### External APIs (no keys required)

| API | Usage |
|---|---|
| **Open-Meteo Forecast API** | Weather data (temperature, condition, wind, humidity, timezone) |
| **Open-Meteo Geocoding API** | City name → coordinates (worldwide, debounced search) |
| **BigDataCloud Reverse Geocoding** | Coordinates → city + country name (used for current location) |
| **Google Fonts CDN** | Nunito, Outfit, Patrick Hand, JetBrains Mono |

---

## Design Philosophy

ANCHOR is built around a small number of deliberate principles:

- **Offline-first, always.** The app functions completely without internet. Weather degrades gracefully to cached data with a stale indicator; audio is synthesized, not streamed; fonts are the only external CDN dependency.

- **No accounts, no tracking.** There is no backend, no authentication, and no telemetry of any kind. Your data never leaves your browser.

- **Warm, cartoonistic aesthetics.** Inspired by the "lo-fi study" aesthetic — rounded cards (`cartoon-card`, `cartoon-btn`), subtle glassmorphism (`backdrop-blur`), hand-written font for emotional copy, and micro-animations (wobble, pop, float, flip) that make the interface feel alive without being distracting.

- **Theme as first-class.** The entire color system is driven by six CSS custom properties. Switching themes is instant and applies globally without re-mounting any component.

- **Calm interactions.** Confirmation modals before destructive actions, unsaved-draft recovery, toast notifications instead of alerts, gentle audio chimes — every interaction is designed to reduce anxiety, not add to it.

---

## Future Improvements

Based on the current implementation, the following areas could be extended:

- **Recurring calendar events** — the current `CalendarEvent` model supports only single-date events; recurring weekly/monthly patterns are not implemented
- **Task priorities and tags** — tasks currently have no priority levels, tags, or filtering
- **Notes search** — no text search across sticky notes; feasible given TipTap stores HTML
- **Pomodoro session history** — the timer completes without recording session counts or streaks
- **Weather hourly/weekly forecast** — the Open-Meteo API supports this data; only current conditions are fetched today
- **PWA / Service Worker** — the app works offline via cache, but lacks a Service Worker manifest for true installable PWA behavior
- **Mobile sidebar** — the left sidebar is icon-only at 80px; a mobile-optimized bottom navigation bar would improve small-screen usability
- **Note sharing / export** — individual notes cannot be exported to Markdown or PDF
- **Multi-device sync** — currently `localStorage`-only; could be extended with optional self-hosted sync (e.g., PocketBase or CRDTs)
- **Calendar drag-and-drop** — events are created and deleted but cannot be moved between dates

---

## Author

**ANCHOR** was designed and built as a personal daily-use productivity sanctuary.

- **Project started:** 2026
- **Stack decisions:** Intentionally minimal — no Redux, no router library, no CSS-in-JS, no backend
- **Icon:** ⚓ — an anchor, representing stability, calm, and staying grounded

---

<div align="center">

*Built with ☕, patience, and a love for quiet, focused mornings.*

**⚓ ANCHOR — Stay grounded. Stay focused.**

</div>
