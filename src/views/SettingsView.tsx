import React, { useRef, useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, Keyboard, Volume2, Clock, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { storage } from '../utils/storage';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetData, importData, addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 9.2 Export Data as JSON file
  const handleExportData = () => {
    const data = storage.exportAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `anchor_sanctuary_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('Data Exported 📦', 'Backup downloaded to your computer!', 'success');
  };

  // 9.2 Import Data from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = importData(json);
        if (success) {
          addToast('Data Restored ✨', 'Your sanctuary data was successfully imported!', 'success');
        } else {
          alert('Invalid backup file format!');
        }
      } catch (err) {
        alert('Failed to parse backup file!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    resetData();
    setShowResetConfirm(false);
    addToast('Sanctuary Reset', 'All local workspace data has been cleared.', 'warning');
  };

  const shortcuts = [
    { key: 'Space', desc: 'Start / Pause Focus Timer (when active)' },
    { key: 'F11', desc: 'Toggle Fullscreen mode' },
    { key: 'Ctrl + T', desc: 'Jump to Tasks view' },
    { key: 'Ctrl + N', desc: 'Create a new Sticky Note' },
    { key: 'Ctrl + Shift + R', desc: 'Jump to Reminders' },
    { key: 'Esc', desc: 'Exit Zen Mode' },
    { key: 'Ctrl + ,', desc: 'Open Settings' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl cartoon-card">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            App Settings & Preferences
          </h1>
          <p className="text-xs text-white/40">Configure clock preferences, export backups, and view shortcuts</p>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="scrollable flex-1 min-h-0 pr-1">

      {/* 9.1 General Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl cartoon-card mb-6 flex flex-col gap-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-sunshine-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>General Preferences</span>
        </h2>

        <div className="flex flex-col gap-4">
          {/* Clock Format Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Clock Format</h3>
              <p className="text-xs text-white/40">Switch between 12-hour AM/PM and 24-hour time format</p>
            </div>
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => updateSettings({ clockFormat: '12h' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cartoon-btn ${
                  settings.clockFormat === '12h' ? 'bg-sunshine-400 text-black shadow-md' : 'text-white/50 hover:text-white'
                }`}
              >
                12-Hour
              </button>
              <button
                onClick={() => updateSettings({ clockFormat: '24h' })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cartoon-btn ${
                  settings.clockFormat === '24h' ? 'bg-sunshine-400 text-black shadow-md' : 'text-white/50 hover:text-white'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Show Seconds Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Display Seconds</h3>
              <p className="text-xs text-white/40">Show live ticking seconds on the flip clock</p>
            </div>
            <button
              onClick={() => updateSettings({ showSeconds: !settings.showSeconds })}
              className={`w-12 h-6 rounded-full p-1 transition-colors cartoon-btn ${
                settings.showSeconds ? 'bg-sunshine-400' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                settings.showSeconds ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-coral-400" />
                <span>Sound Notifications</span>
              </h3>
              <p className="text-xs text-white/40">Play a gentle chime when focus timer finishes or reminder triggers</p>
            </div>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors cartoon-btn ${
                settings.soundEnabled ? 'bg-coral-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 9.2 Data Management */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl cartoon-card mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-coral-400 mb-4 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Data Backup & Storage (100% Offline)</span>
        </h2>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportData}
          accept="application/json"
          className="hidden"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2 text-white font-bold text-xs transition-all cartoon-btn"
          >
            <Download className="w-5 h-5 text-sunshine-400" />
            <span>Export Data (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2 text-white font-bold text-xs transition-all cartoon-btn"
          >
            <Upload className="w-5 h-5 text-sky-400" />
            <span>Import Data (JSON)</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-4 rounded-xl bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/30 flex flex-col items-center justify-center gap-2 text-coral-400 font-bold text-xs transition-all cartoon-btn"
          >
            <Trash2 className="w-5 h-5" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>

      {/* 9.3 Keyboard Shortcuts Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl cartoon-card mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          <span>Keyboard Shortcuts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortcuts.map(sc => (
            <div key={sc.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/70 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 bg-black/50 border border-white/20 rounded-lg text-xs font-mono font-bold text-sunshine-400 shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-pop">
          <div className="bg-[#1e1b2e] border border-coral-500/30 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl cartoon-card">
            <ShieldAlert className="w-12 h-12 text-coral-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-black text-white mb-2">Reset Workspace?</h3>
            <p className="text-xs text-white/60 mb-6 leading-relaxed">
              This will permanently delete all tasks, sticky notes, reminders, and custom themes stored in your browser.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cartoon-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs rounded-xl shadow-lg cartoon-btn"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
      </div> {/* /scrollable */}
    </div>
  );
};
