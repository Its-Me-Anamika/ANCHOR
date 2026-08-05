import React, { useRef } from 'react';
import { Palette, Upload, Trash2, Check, Sliders, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ThemeId, ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'pure-black',
    name: 'Pure Black',
    emoji: '🖤',
    bg: '#000000',
    surface: 'rgba(255,255,255,0.05)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    accent: '#3B82F6',
    border: 'rgba(255,255,255,0.08)',
    previewBg: 'bg-black border-white/20'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌌',
    bg: '#0A0E1A',
    surface: 'rgba(255,255,255,0.06)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    accent: '#6366F1',
    border: 'rgba(255,255,255,0.1)',
    previewBg: 'bg-[#0A0E1A] border-indigo-500/30'
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    emoji: '🗼',
    bg: '#1A1B26',
    surface: 'rgba(255,255,255,0.08)',
    textPrimary: '#A9B1D6',
    textSecondary: '#7AA2F7',
    accent: '#BB9AF7',
    border: 'rgba(255,255,255,0.12)',
    previewBg: 'bg-[#1A1B26] border-purple-500/30'
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    bg: '#0A1A0A',
    surface: 'rgba(255,255,255,0.06)',
    textPrimary: '#E2E8F0',
    textSecondary: '#86EFAC',
    accent: '#22C55E',
    border: 'rgba(255,255,255,0.1)',
    previewBg: 'bg-[#0A1A0A] border-emerald-500/30'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    bg: '#0A1628',
    surface: 'rgba(255,255,255,0.06)',
    textPrimary: '#F0F9FF',
    textSecondary: '#7DD3FC',
    accent: '#0284C7',
    border: 'rgba(255,255,255,0.1)',
    previewBg: 'bg-[#0A1628] border-sky-500/30'
  },
  {
    id: 'warm-coffee',
    name: 'Warm Coffee',
    emoji: '☕',
    bg: '#1A0F0A',
    surface: 'rgba(255,255,255,0.06)',
    textPrimary: '#FEF3C7',
    textSecondary: '#FDE68A',
    accent: '#F59E0B',
    border: 'rgba(255,255,255,0.1)',
    previewBg: 'bg-[#1A0F0A] border-amber-500/30'
  },
  {
    id: 'paper-white',
    name: 'Paper White',
    emoji: '📜',
    bg: '#F5F5F0',
    surface: 'rgba(0,0,0,0.05)',
    textPrimary: '#18181B',
    textSecondary: '#52525B',
    accent: '#2563EB',
    border: 'rgba(0,0,0,0.1)',
    previewBg: 'bg-[#F5F5F0] border-zinc-400'
  },
  {
    id: 'warm-latte',
    name: 'Warm Latte',
    emoji: '☕',
    bg: '#2C1810',
    surface: '#3D2317',
    textPrimary: '#F5E6D3',
    textSecondary: '#D4A574',
    accent: '#D4A574',
    border: 'rgba(212, 165, 116, 0.2)',
    previewBg: 'bg-[#2C1810] border-[#D4A574]/40'
  },
  {
    id: 'terracotta-dream',
    name: 'Terracotta Dream',
    emoji: '🏺',
    bg: '#2A1A14',
    surface: '#3D2A1F',
    textPrimary: '#F5E6D0',
    textSecondary: '#E07A5F',
    accent: '#E07A5F',
    border: 'rgba(224, 122, 95, 0.2)',
    previewBg: 'bg-[#2A1A14] border-[#E07A5F]/40'
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    emoji: '🌿',
    bg: '#1A2A1A',
    surface: '#2A3D2A',
    textPrimary: '#E8F5E9',
    textSecondary: '#81C784',
    accent: '#81C784',
    border: 'rgba(129, 199, 132, 0.2)',
    previewBg: 'bg-[#1A2A1A] border-[#81C784]/40'
  },
  {
    id: 'dusky-rose',
    name: 'Dusky Rose',
    emoji: '🌹',
    bg: '#2A1A24',
    surface: '#3D2A35',
    textPrimary: '#F5E6F0',
    textSecondary: '#E8A0BF',
    accent: '#E8A0BF',
    border: 'rgba(232, 160, 191, 0.2)',
    previewBg: 'bg-[#2A1A24] border-[#E8A0BF]/40'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    emoji: '🌅',
    bg: '#2A1F0A',
    surface: '#3D2F17',
    textPrimary: '#F5E6D0',
    textSecondary: '#F5A623',
    accent: '#F5A623',
    border: 'rgba(245, 166, 35, 0.2)',
    previewBg: 'bg-[#2A1F0A] border-[#F5A623]/40'
  },
  {
    id: 'cool-gray',
    name: 'Cool Gray',
    emoji: '🩶',
    bg: '#1A1A1A',
    surface: '#2A2A2A',
    textPrimary: '#F0F0F0',
    textSecondary: '#9CA3AF',
    accent: '#9CA3AF',
    border: 'rgba(156, 163, 175, 0.2)',
    previewBg: 'bg-[#1A1A1A] border-gray-400/40'
  },
  {
    id: 'deep-navy',
    name: 'Deep Navy',
    emoji: '⚓',
    bg: '#0A0E2A',
    surface: '#141A3D',
    textPrimary: '#E3E8F5',
    textSecondary: '#6B8CF5',
    accent: '#6B8CF5',
    border: 'rgba(107, 140, 245, 0.2)',
    previewBg: 'bg-[#0A0E2A] border-[#6B8CF5]/40'
  }
];

export const ThemesView: React.FC = () => {
  const { settings, updateSettings, addToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectTheme = (id: ThemeId) => {
    updateSettings({ theme: id });
    addToast('Theme Applied 🎨', `Switched to ${id} theme!`, 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size max 5MB as per Requirement 8.2
    if (file.size > 5 * 1024 * 1024) {
      alert('Wallpaper image must be smaller than 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateSettings({ wallpaper: base64 });
        addToast('Wallpaper Uploaded 🖼️', 'Custom wallpaper applied!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveWallpaper = () => {
    updateSettings({ wallpaper: '' });
    addToast('Wallpaper Removed', 'Restored original theme background.', 'info');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl cartoon-card">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Palette className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Themes & Sanctuary Vibes
          </h1>
          <p className="text-xs text-white/40">Customize colors, warm dark tones, and upload wallpapers</p>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="scrollable flex-1 min-h-0 pr-1">

      {/* 8.1 Color Themes (7 Options Grid) */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-sunshine-400 mb-3 px-1">
          Color Palettes (7 Presets)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {THEMES.map(theme => {
            const isSelected = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`group relative flex flex-col p-4 rounded-2xl border text-left transition-all duration-200 cartoon-card ${theme.previewBg} ${
                  isSelected ? 'ring-2 ring-sunshine-400 scale-105 shadow-xl' : 'hover:scale-102 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{theme.emoji}</span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-sunshine-400 text-black flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  {theme.name}
                </h3>

                {/* Color Dots Preview */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.bg }} />
                  <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.accent }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8.2 Wallpaper Upload & Controls */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl cartoon-card mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>Custom Wallpaper Upload</span>
        </h2>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {!settings.wallpaper ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-10 border-2 border-dashed border-white/20 hover:border-sky-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/50 hover:text-white transition-all bg-white/[0.02] hover:bg-white/5 cartoon-btn"
          >
            <Upload className="w-8 h-8 text-sky-400" />
            <span className="text-sm font-bold">Upload your own wallpaper</span>
            <span className="text-xs text-white/40">PNG, JPG, WebP (Max 5MB)</span>
          </button>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Wallpaper Thumbnail Preview */}
            <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-white/20 shrink-0 shadow-lg">
              <img
                src={settings.wallpaper}
                alt="Custom Wallpaper"
                className="w-full h-full object-cover"
                style={{
                  opacity: settings.wallpaperOpacity / 100,
                  filter: `blur(${settings.wallpaperBlur}px)`
                }}
              />
              <button
                onClick={handleRemoveWallpaper}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-white transition-colors cartoon-btn"
                title="Remove Wallpaper"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sliders: Opacity & Blur */}
            <div className="flex-1 w-full flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-white/70 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    Wallpaper Opacity
                  </span>
                  <span>{settings.wallpaperOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={settings.wallpaperOpacity}
                  onChange={e => updateSettings({ wallpaperOpacity: Number(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white/70 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    Wallpaper Blur
                  </span>
                  <span>{settings.wallpaperBlur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={settings.wallpaperBlur}
                  onChange={e => updateSettings({ wallpaperBlur: Number(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cartoon-btn"
                >
                  Change Wallpaper
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div> {/* /scrollable */}
    </div>
  );
};
