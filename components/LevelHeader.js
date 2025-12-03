import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function LevelHeader({ levelInfo, levelNumber, totalLevels, canGoBack, onBack }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        {canGoBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="text-xs text-blue-400 mb-1">
            Level {levelNumber} of {totalLevels}
          </div>
          <h1 className="text-3xl font-bold">{levelInfo.title}</h1>
          <p className="text-sm text-gray-400 mt-1">{levelInfo.description}</p>
        </div>
      </div>
    </div>
  );
}