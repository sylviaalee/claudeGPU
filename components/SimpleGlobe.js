import React from 'react';
import { MapPin } from 'lucide-react';

export default function SimpleGlobe({ locations, highlight }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-950 to-slate-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-blue-900/20 border-2 border-blue-500/30 relative">
          {/* Globe grid lines */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/10" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/20" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/20" />
          
          {/* Location pins */}
          {locations.map((loc, idx) => {
            const isHighlight = highlight && loc.lat === highlight.lat && loc.lng === highlight.lng;
            const x = 50 + (loc.lng / 180) * 40;
            const y = 50 - (loc.lat / 90) * 40;
            
            return (
              <div
                key={idx}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-3 h-3 rounded-full ${isHighlight ? 'bg-yellow-400 animate-pulse' : 'bg-blue-400'} shadow-lg`} />
                <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isHighlight ? 'opacity-100' : ''}`}>
                  {loc.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-blue-300">
        <MapPin className="inline w-3 h-3 mr-1" />
        {locations.length} location{locations.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}