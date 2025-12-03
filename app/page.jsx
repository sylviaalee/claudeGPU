"use client";

import React, { useState } from 'react';
import FloatingItem from '../components/FloatingItem';
import SimpleGlobe from '../components/SimpleGlobe';
import LevelHeader from '../components/LevelHeader';
import Breadcrumb from '../components/Breadcrumb';
import SelectedItemCard from '../components/SelectedItemCard';
import { supplyChainData } from '../data/supplyChainData';
import { levelInfo } from '../data/levelInfo';

export default function GPUSupplyChain() {
  const [history, setHistory] = useState([{ level: 0, items: supplyChainData.gpus, selectedItem: null }]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentState = history[history.length - 1];
  const currentLevelInfo = levelInfo[currentState.level];
  const canGoBack = history.length > 1;

  function handleItemClick(item) {
    setSelectedItem(item);
    
    if (item.next && item.next.length > 0 && currentState.level < levelInfo.length - 1) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        const nextLevelIndex = currentState.level + 1;
        const nextLevelKey = levelInfo[nextLevelIndex].key;
        const nextItems = supplyChainData[nextLevelKey].filter(i => item.next.includes(i.id));

        const newHistory = history.map(h => ({ ...h }));
        newHistory[newHistory.length - 1] = {
          ...newHistory[newHistory.length - 1],
          selectedItem: item,
          parent: newHistory[newHistory.length - 1].parent ?? null,
        };

        newHistory.push({
          level: nextLevelIndex,
          items: nextItems,
          parent: item,
          selectedItem: null,
        });

        setHistory(newHistory);
        setIsTransitioning(false);
      }, 400);
    } else {
      const newHistory = history.map(h => ({ ...h }));
      newHistory[newHistory.length - 1] = {
        ...newHistory[newHistory.length - 1],
        selectedItem: item,
      };
      setHistory(newHistory);
    }
  }

  function handleBack() {
    if (!canGoBack) return;

    setIsTransitioning(true);
    
    setTimeout(() => {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setSelectedItem(newHistory[newHistory.length - 1]?.selectedItem ?? null);
      setIsTransitioning(false);
    }, 300);
  }

  const allLocations = currentState.items.flatMap(item => item.locations);
  const highlightLocation = selectedItem ? selectedItem.locations[0] : null;
  const hoverLocations = hoveredItem ? hoveredItem.locations : [];

  // Generate particle positions only on client side
  const [particles, setParticles] = useState([]);
  
  React.useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
      }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-zinc-900 text-white overflow-hidden">
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 flex flex-col p-6 overflow-x-auto">
          <div className="transition-all duration-500 ease-out">
            <LevelHeader
              levelInfo={currentLevelInfo}
              levelNumber={currentState.level + 1}
              totalLevels={levelInfo.length}
              canGoBack={canGoBack}
              onBack={handleBack}
            />
          </div>
          
          <div className="transform transition-all duration-500 ease-out overflow-x-auto overflow-y-hidden">
            <Breadcrumb history={history} levelInfo={levelInfo} />
          </div>

          <div className="flex-1 relative bg-slate-900/30 rounded-2xl border border-slate-800 mt-6 transition-all duration-300" style={{ overflow: 'visible' }}>
            <div 
              className={`absolute inset-0 transition-all duration-500 ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {currentState.items.map((item, idx) => (
                <FloatingItem
                  key={item.id}
                  item={item}
                  index={idx}
                  onClick={handleItemClick}
                  onHover={setHoveredItem}
                />
              ))}
            </div>

            <div className="transition-all duration-300 ease-out">
              <SelectedItemCard item={selectedItem} />
            </div>
          </div>
        </div>

        <div className="w-[512px] flex-shrink-0 p-6 border-t lg:border-t-0 lg:border-l border-slate-800 transition-all duration-500">
          <h2 className="text-xl font-semibold mb-4 transition-all duration-300">Supply Chain Map</h2>
          <div className="h-[calc(100vh-120px)] transition-all duration-500">
            <SimpleGlobe locations={allLocations} highlight={highlightLocation} hoverLocations={hoverLocations} />
          </div>
        </div>
      </div>
      
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}