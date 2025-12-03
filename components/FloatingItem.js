import React from 'react';

export default function FloatingItem({ item, index, onClick }) {
  const randomX = 10 + (index * 15) % 80;
  const randomY = 10 + (index * 23) % 80;
  const randomDelay = index * 0.1;

  return (
    <div
      onClick={() => onClick(item)}
      className="absolute cursor-pointer group transition-all duration-500 ease-out animate-fade-in"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        animationDelay: `${randomDelay}s`,
      }}
    >
      {/* Pulsing glow effect */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-150 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping opacity-0 group-hover:opacity-100" />
      
      {/* Main item container */}
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 hover:-translate-y-2">
        {/* Item emoji with bounce animation */}
        <div className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
          {item.image}
        </div>
        
        {/* Item name with gradient on hover */}
        <div className="text-sm font-semibold text-center min-w-[100px] transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400">
          {item.name}
        </div>
        
        {/* Location count badge */}
        {item.locations && item.locations.length > 1 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">
            {item.locations.length}
          </div>
        )}
        
        {/* Next indicator with animated arrow */}
        {item.next && item.next.length > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full px-2 py-1 shadow-lg transform transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-emerald-500/50">
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        )}
      </div>
      
      {/* Sparkle effects */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.1s' }} />
    </div>
  );
}