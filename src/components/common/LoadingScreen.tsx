import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div
      id="app-loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 select-none px-6"
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* App Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden flex items-center justify-center bg-emerald-600">
          <img
            src="/logo.png"
            alt="Investify"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Loading Spinner */}
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    </div>
  );
};
