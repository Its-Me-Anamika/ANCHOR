# ANCHOR ⚓ Personal Productivity Sanctuary

> A Gen-Z friendly, aesthetic, minimal, and 100% offline-first digital workspace for daily organization, focus, and mindfulness.

![ANCHOR Workspace](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20TailwindCSS-coral)
![Offline First](https://img.shields.io/badge/Storage-100%25%20Offline%20localStorage-sunshine)

---

## 🌟 Philosophy

ANCHOR is designed as a **personal digital sanctuary** for ONE user:
- ❌ **No Cloud / Accounts**: No signup, no password, zero tracking.
- ❌ **No AI / Machine Learning**: Purely deterministic, distraction-free productivity.
- ⚡ **Instant & Offline**: Operates 100% offline using standard `localStorage`.
- 🎨 **Human-Made & Cozy Aesthetic**: Warm dark tones, rounded typography, vibrant accents (coral, peach, sunshine yellow), bouncy cartoonish cards, and subtle wobbly micro-interactions.

---

## ✨ Exact Feature Specifications

1. **Left Sidebar (60px Fixed)**
   - Fixed width glassmorphism sidebar (`w-[60px]`).
   - Gradient Anchor logo with sparkle accents.
   - Quick navigation: Dashboard 🏠, Calendar 📅, Tasks 📝, Notes 💡, Reminders 🔔, Themes 🎨, Settings ⚙️.
   - Hover tooltips and active state glow.

2. **Main Dashboard Sanctuary (Center)**
   - **Greeting**: Time-aware welcome message (*Good Morning / Afternoon / Evening*).
   - **Flip Clock**: Real-time live updating clock with smooth 3D digit flip transition animations (HH:MM:SS or 12h/24h formats).
   - **Date & Curated Quote**: Daily motivational Gen-Z focus quotes.
   - **Weather Pill**: Current temperature & condition with offline fallback.
   - **3 Action Buttons**: Timer, Stopwatch, and Zen Mode.
   - **Expandable Focus Timer & Stopwatch**:
     - Timer presets: 15m, 25m, 30m, 45m, 60m + gentle completion chime and confetti.
     - Stopwatch: MM:SS.CC centisecond precision with lap history tracking.

3. **Right Sidebar (View-Only, w-72)**
   - **Mini Calendar**: Quick month view with blue event markers. Click any day to jump to full editable calendar.
   - **Today's Tasks Glance**: Quick checkbox toggles synced live with main tasks.

4. **Full Editable Calendar**
   - Month/Year grid view with day event chips.
   - Click date to open Event Modal.
   - **Auto-Task Creation**: Adding a calendar event automatically creates a corresponding item in your Task Hub!

5. **Tasks View**
   - Quick task entry, filter tabs (All, Active, Completed), checkbox toggles, strike-through styling.

6. **Sticky Notes View**
   - Cartoonish dark pastel sticky notes (Yellow, Blue, Green, Pink, Purple).
   - Inline content editor with 500-character counter limits.

7. **Reminders View**
   - Time-based (specific time & active days), Interval (15–120 min), and Daily Routine reminders.
   - Background check loop triggers browser notifications & in-app toast alerts with 10s auto-dismiss.

8. **Themes & Custom Wallpapers**
   - 7 Presets: Pure Black, Midnight, Tokyo Night, Forest, Ocean, Warm Coffee, Paper White.
   - Custom wallpaper base64 image upload (PNG, JPG, WebP max 5MB) with custom opacity and blur sliders.

9. **Settings & Data Management**
   - Toggle 12h/24h clock, show seconds, sound effects.
   - Full JSON state Export & Import for offline backups.
   - Workspace reset with confirmation modal.
   - Full keyboard shortcuts reference guide.

10. **Zen Mode**
    - Immersive fullscreen focus mode (`fixed inset-0`).
    - Remembers previously active mode (Clock, Timer, or Stopwatch).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Start / Pause Focus Timer |
| `F11` | Toggle Fullscreen Mode |
| `Ctrl + T` | Jump to Tasks View |
| `Ctrl + N` | Create New Sticky Note |
| `Ctrl + Shift + R` | Jump to Reminders View |
| `Esc` | Exit Zen Mode |
| `Ctrl + ,` | Open Settings |

---

## 🚀 Quick Start & Build Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Build production distribution
npm run build

# 4. Preview production build
npm run preview
```

---

## 🛡️ Data & Privacy

All tasks, notes, reminders, calendar events, theme choices, and uploaded wallpapers are stored locally in your web browser's `localStorage`. No data ever leaves your device.
