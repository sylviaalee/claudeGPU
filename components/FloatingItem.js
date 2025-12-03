import React, { useState } from 'react';

export default function FloatingItem({ item, onClick, index }) {
  const [position] = useState({
    x: 10 + (index * 25) % 80,
    y: 10 + (index * 17) % 70,
    delay: index * 0.3
  });

  return (
    <div
      className="absolute cursor-pointer transform transition-all duration-300 hover:scale-110"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animation: `float ${3 + index % 3}s ease-in-out infinite`,
        animationDelay: `${position.delay}s`
      }}
      onClick={() => onClick(item)}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl group-hover:bg-blue-400/50 transition-all" />
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-blue-500/30 group-hover:border-blue-400/60 transition-all shadow-lg">
          <div className="text-5xl mb-2">{item.image}</div>
          <div className="text-sm font-medium text-white text-center whitespace-nowrap">{item.name}</div>
        </div>
      </div>
    </div>
  );
}