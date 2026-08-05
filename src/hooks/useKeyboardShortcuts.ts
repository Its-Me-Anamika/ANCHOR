import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useKeyboardShortcuts(onTimerToggle?: () => void) {
  const { 
    setCurrentView, 
    setZenMode, 
    zenMode, 
    activeDashboardCard, 
    addNote 
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        if (e.key === 'Escape' && zenMode) {
          setZenMode(false);
        }
        return;
      }

      // Space: Start/Pause Timer when timer is visible
      if (e.code === 'Space' && (activeDashboardCard === 'timer' || zenMode)) {
        e.preventDefault();
        if (onTimerToggle) onTimerToggle();
      }

      // F11: Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }

      // Ctrl + T: Tasks view
      if (e.ctrlKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setCurrentView('tasks');
      }

      // Ctrl + N: New Note
      if (e.ctrlKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setCurrentView('notes');
        addNote('yellow');
      }

      // Ctrl + Shift + R: Reminders view
      if (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setCurrentView('reminders');
      }

      // Esc: Exit Zen mode
      if (e.key === 'Escape' && zenMode) {
        e.preventDefault();
        setZenMode(false);
      }

      // Ctrl + , : Settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setCurrentView('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView, setZenMode, zenMode, activeDashboardCard, addNote, onTimerToggle]);
}
