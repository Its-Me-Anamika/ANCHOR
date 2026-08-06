import React from 'react';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  StickyNote, 
  Bell, 
  CloudSun,
  Palette, 
  Settings
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ViewMode } from '../types';
import Logo from '../assets/logo.svg';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, emoji: '🏠' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, emoji: '📅' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, emoji: '📝' },
  { id: 'notes', label: 'Notes', icon: StickyNote, emoji: '💡' },
  { id: 'reminders', label: 'Reminders', icon: Bell, emoji: '🔔' },
  { id: 'weather',   label: 'Weather',   icon: CloudSun, emoji: '🌤️' },
  { id: 'themes', label: 'Themes', icon: Palette, emoji: '🎨' },
  { id: 'settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
];

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useStore();

  return (
    <aside className="w-[94px] shrink-0 h-screen fixed left-0 top-0 z-40 bg-black/30 backdrop-blur-md border-r border-white/10 flex flex-col items-center pt-0 pb-4 justify-between transition-all">
      {/* Top Section: Brand + Nav Icons */}
      <div className="flex flex-col items-center w-full">
        {/* Brand Header - NON-Interactive, full-width, visually separated */}
        <div className="flex flex-col items-center justify-center w-full px-3 pt-6 pb-5 border-b border-white/10 mb-4 pointer-events-none select-none">
          {/* Printed Brand Logo */}
          <div className="mb-3">
            <img
            src={Logo}
            alt="Anchor"
            className="w-15 h-15"
          />
          </div>
          {/* Big brand name */}
          <span className="text-white font-black text-sm tracking-[0.16em] uppercase leading-none text-center">
            ANCHOR
          </span>
          {/* Divider line */}
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2 mb-1" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <div key={item.id} className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cartoon-btn ${
                    isActive
                      ? 'bg-white/15 text-white shadow-inner border border-white/20'
                      : 'text-white/40 hover:text-white/90 hover:bg-white/5'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-sunshine-400' : 'group-hover:scale-110'}`} />
                  <span className={`text-[9px] font-semibold tracking-wide uppercase leading-none ${isActive ? 'text-sunshine-400' : 'text-white/30 group-hover:text-white/70'}`}>
                    {item.label}
                  </span>
                </button>

                {/* Hover Tooltip to the Right */}
                <div className="absolute left-[88px] top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="bg-[#1e1b2e] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl border border-white/10 whitespace-nowrap flex items-center gap-2">
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom spacer */}
      <div className="w-full h-4" />
    </aside>
  );
};
