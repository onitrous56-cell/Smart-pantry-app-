import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl shadow-amber-900/20 animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span className="flex-1">Offline Mode — Cached pantry data active</span>
    </div>
  );
};
