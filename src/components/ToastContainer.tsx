import React from 'react';
import { X, Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-sky-400" />;
        let borderClass = 'border-sky-500/30';

        if (toast.type === 'success') {
          icon = <CheckCircle className="w-5 h-5 text-mint-400" />;
          borderClass = 'border-mint-500/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-sunshine-400" />;
          borderClass = 'border-sunshine-500/30';
        } else if (toast.type === 'reminder') {
          icon = <Bell className="w-5 h-5 text-coral-400 animate-bounce" />;
          borderClass = 'border-coral-500/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#1e1b2e]/95 backdrop-blur-xl border ${borderClass} rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-pop cartoon-card`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-snug break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cartoon-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
