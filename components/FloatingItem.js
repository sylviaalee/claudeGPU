import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function FloatingItem({ item, index, onClick, onHover = () => {}, allPositions = [], onPositionCalculated }) {
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(null);
  const itemRef = useRef(null);
  const randomDelay = index * 0.1;

  // Calculate non-overlapping position
  useEffect(() => {
    // Item dimensions in percentage of container
    const itemWidthPercent = 12; // ~140px on most screens
    const itemHeightPercent = 15; // ~120px on most screens
    const paddingPercent = 10; // Extra spacing
    
    const checkOverlap = (x, y) => {
      return allPositions.some(pos => {
        // Calculate if rectangles overlap
        const xOverlap = Math.abs(pos.x - x) < (itemWidthPercent + paddingPercent);
        const yOverlap = Math.abs(pos.y - y) < (itemHeightPercent + paddingPercent);
        return xOverlap && yOverlap;
      });
    };
    
    let attempts = 0;
    let newX, newY;
    const maxX = 85 - itemWidthPercent; // Leave room for item width
    const maxY = 80 - itemHeightPercent; // Leave room for item height
    
    // Try to find a non-overlapping position
    do {
      newX = 5 + Math.random() * maxX;
      newY = 5 + Math.random() * maxY;
      attempts++;
    } while (checkOverlap(newX, newY) && attempts < 100);
    
    setPosition({ x: newX, y: newY });
    if (onPositionCalculated) {
      onPositionCalculated({ x: newX, y: newY });
    }
  }, []);

  useEffect(() => {
    if (showRiskPopup && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setPopupPosition({
        x: rect.right + 16,
        y: rect.top
      });
    }
  }, [showRiskPopup]);
  
  // Determine risk colors
  const getRiskColors = (risk) => {
    if (risk >= 8) {
      return {
        glow: 'bg-red-500/20',
        ripple: 'border-red-400/30',
        gradient: 'from-red-900/90 to-red-950/90',
        border: 'border-red-700',
        hoverShadow: 'hover:shadow-red-500/20',
        hoverBorder: 'hover:border-red-500/50',
        textGradient: 'group-hover:from-red-400 group-hover:to-orange-400'
      };
    } else if (risk >= 6) {
      return {
        glow: 'bg-yellow-500/20',
        ripple: 'border-yellow-400/30',
        gradient: 'from-yellow-900/90 to-amber-950/90',
        border: 'border-yellow-700',
        hoverShadow: 'hover:shadow-yellow-500/20',
        hoverBorder: 'hover:border-yellow-500/50',
        textGradient: 'group-hover:from-yellow-400 group-hover:to-amber-400'
      };
    } else {
      return {
        glow: 'bg-green-500/20',
        ripple: 'border-green-400/30',
        gradient: 'from-green-900/90 to-emerald-950/90',
        border: 'border-green-700',
        hoverShadow: 'hover:shadow-green-500/20',
        hoverBorder: 'hover:border-green-500/50',
        textGradient: 'group-hover:from-green-400 group-hover:to-emerald-400'
      };
    }
  };
  
  const colors = getRiskColors(item.risk || 5);
  
  // Don't render until position is calculated
  if (!position) return null;
  
  return (
    <>
      <div
        ref={itemRef}
        onClick={() => onClick(item)}
        onMouseEnter={() => { onHover(item); setShowRiskPopup(true); }}
        onMouseLeave={() => { onHover(null); setShowRiskPopup(false); }}
        className="absolute cursor-pointer group transition-all duration-500 ease-out animate-fade-in"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          animationDelay: `${randomDelay}s`,
        }}
      >
      {/* Pulsing glow effect */}
      <div className={`absolute inset-0 ${colors.glow} rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500`} />
      
      {/* Ripple effect on hover */}
      <div className={`absolute inset-0 rounded-xl border-2 ${colors.ripple} opacity-0 group-hover:opacity-100 group-hover:animate-ping`} />
      
      {/* Main item container */}
      <div className={`relative bg-gradient-to-br ${colors.gradient} backdrop-blur-sm rounded-2xl p-4 border ${colors.border} shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl ${colors.hoverShadow} ${colors.hoverBorder} hover:-translate-y-2`}>
        {/* Item emoji with bounce animation */}
        <div className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
          {item.image}
        </div>
        
        {/* Item name with gradient on hover */}
        <div className={`text-sm font-semibold text-center min-w-[100px] transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colors.textGradient}`}>
          {item.name}
        </div>
        
        {/* Risk indicator badge */}
        {item.risk && (
          <div className={`absolute -top-2 -left-2 ${item.risk >= 8 ? 'bg-red-500' : item.risk >= 6 ? 'bg-yellow-500' : 'bg-green-500'} text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-125`}>
            {item.risk}
          </div>
        )}
        
        {/* Location count badge */}
        {item.locations && item.locations.length > 1 && (
          <div className={`absolute -top-2 -right-2 ${item.risk >= 8 ? 'bg-red-600' : item.risk >= 6 ? 'bg-yellow-600' : 'bg-green-600'} text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12`}>
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
      </div>

      {/* Risk Analysis Popup - Rendered via Portal to top layer */}
      {showRiskPopup && item.riskAnalysis && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[99999] pointer-events-none animate-fade-in"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
        >
          <div className="bg-slate-900/98 backdrop-blur-md rounded-lg border-2 border-slate-700 shadow-2xl p-4 w-80">
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                item.risk >= 8 ? 'bg-red-500' : item.risk >= 6 ? 'bg-yellow-500' : 'bg-green-500'
              } text-white`}>
                Risk Level: {item.risk}/10
              </div>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed">
              {item.riskAnalysis}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}