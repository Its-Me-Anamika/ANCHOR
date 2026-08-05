import React from 'react';
import { StoreProvider, useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { ToastContainer } from './components/ToastContainer';
import { EventModal } from './components/EventModal';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { TasksView } from './views/TasksView';
import { NotesView } from './views/NotesView';
import { RemindersView } from './views/RemindersView';
import { ThemesView, THEMES } from './views/ThemesView';
import { SettingsView } from './views/SettingsView';
import { WeatherView } from './views/WeatherView';
import { ZenMode } from './views/ZenMode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const MainLayout: React.FC = () => {
  const { currentView, settings } = useStore();

  useKeyboardShortcuts();

  // Active theme configuration
  const activeTheme = THEMES.find(t => t.id === settings.theme) || THEMES[0];

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', activeTheme.bg);
    root.style.setProperty('--color-surface', activeTheme.surface);
    root.style.setProperty('--color-text-primary', activeTheme.textPrimary);
    root.style.setProperty('--color-text-secondary', activeTheme.textSecondary);
    root.style.setProperty('--color-accent', activeTheme.accent);
    root.style.setProperty('--color-border', activeTheme.border);
    
    document.body.style.backgroundColor = activeTheme.bg;
    document.body.style.color = activeTheme.textPrimary;
  }, [activeTheme]);

  return (
    <div
      className="relative h-full w-full flex overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: activeTheme.bg, color: activeTheme.textPrimary }}
    >
      {/* Optional Custom Base64 Wallpaper Background */}
      {settings.wallpaper && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
          style={{
            backgroundImage: `url(${settings.wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: settings.wallpaperOpacity / 100,
            filter: `blur(${settings.wallpaperBlur}px)`
          }}
        />
      )}

      {/* Fixed 60px Left Sidebar */}
      <Sidebar />

      {/* Main Content Area (offset left by sidebar width) */}
      <main className="flex-1 flex flex-col min-w-0 pl-[80px] relative z-10 h-full overflow-hidden">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'notes' && <NotesView />}
        {currentView === 'reminders' && <RemindersView />}
        {currentView === 'weather'   && <WeatherView />}
        {currentView === 'themes'    && <ThemesView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* View-Only Right Sidebar (Mini Calendar & Today's Tasks) */}
      <RightSidebar />

      {/* Global Overlays & Toasts */}
      <EventModal />
      <ToastContainer />
      <ZenMode />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

export default App;
