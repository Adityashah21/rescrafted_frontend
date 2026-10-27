import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-forest-900 text-warmWhite text-xs py-2 px-4 border-b border-forest-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-accentLime flex-shrink-0 animate-pulse" />
          <span className="font-medium">
            Give Waste a Second Life:{' '}
            <span className="text-sand-200">
              Zero-plastic packaging & verified environmental impact on every order.
            </span>
          </span>
          <span className="hidden sm:inline bg-forest-800 text-accentLime text-[10px] font-bold px-2 py-0.5 rounded-full border border-forest-700">
            CIRCULAR
          </span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-sand-300 hover:text-white p-1 rounded transition-colors"
          aria-label="Dismiss announcement banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
