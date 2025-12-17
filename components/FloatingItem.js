import React, { useState, useEffect, useRef } from 'react';

export default function FloatingItem({ item, index, onClick, onHover = () => {}, position, isSelected = false, showHoverEffects = true, inPopup = false }) {
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const itemRef = useRef(null);
  const randomDelay = index * 0.1;

  // Determine risk colors
  const getRiskColors = (risk) => {
    if (risk >= 8) {
      return {
        glow: 'bg-red-500/20',
        gradient: 'from-red-900/80 to-red-950/90',
        border: 'border-red-500/50',
        text: 'text-red-200'
      };
    } else if (risk >= 5) {
      return {
        glow: 'bg-yellow-500/20',
        gradient: 'from-yellow-900/80 to-amber-950/90',
        border: 'border-yellow-500/50',
        text: 'text-yellow-200'
      };
    } else {
      return {
        glow: 'bg-blue-500/20',
        gradient: 'from-slate-900/80 to-slate-950/90',
        border: 'border-blue-500/50',
        text: 'text-blue-200'
      };
    }
  };
  
  const colors = getRiskColors(item.risk || 5);
  const itemPosition = position || { x: 50, y: 50 };
  
  return (
    <div
      ref={itemRef}
      onClick={() => onClick(item)}
      onMouseEnter={() => { 
        if (showHoverEffects) {
          onHover(item); 
          setShowRiskPopup(true);
        }
      }}
      onMouseLeave={() => { 
        if (showHoverEffects) {
          onHover(null); 
          setShowRiskPopup(false);
        }
      }}
      className={`pointer-events-auto cursor-pointer group transition-all duration-500 ease-out ${inPopup ? 'relative' : 'absolute animate-fade-in'}`}
      style={inPopup ? {} : {
        left: `${itemPosition.x}%`,
        top: `${itemPosition.y}%`,
        // Center the item on its coordinates
        transform: 'translate(-50%, -50%)',
        animationDelay: `${randomDelay}s`,
      }}
    >
      {/* Sci-fi Connection Point (where the line attaches) */}
      {!inPopup && <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-0 opacity-50" />}

      {/* Main Container */}
      <div className={`
        relative backdrop-blur-md rounded-xl p-3 border ${colors.border} 
        bg-gradient-to-br ${colors.gradient}
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        transform transition-all duration-300
        ${showHoverEffects ? 'hover:scale-110 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]' : ''}
        ${isSelected && inPopup ? 'scale-100 shadow-none border-none bg-transparent' : ''}
      `}>
        
        {/* Content Layout */}
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          <div className="text-3xl filter drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
            {item.image}
          </div>
          
          <div className={`text-xs font-bold tracking-wide uppercase ${colors.text} text-center`}>
            {item.name}
          </div>

          {/* Mini Risk Indicator Bar */}
          {!inPopup && (
             <div className="w-full h-1 bg-black/50 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full ${item.risk >= 8 ? 'bg-red-500' : item.risk >= 5 ? 'bg-yellow-500' : 'bg-blue-400'}`} 
                  style={{width: `${(item.risk/10)*100}%`}}
                />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}