"use client";

import React, { useState } from 'react';
import FloatingItem from '../components/FloatingItem';
import SimpleGlobe from '../components/SimpleGlobe';
import LevelHeader from '../components/LevelHeader';
import Breadcrumb from '../components/Breadcrumb';
import SelectedItemCard from '../components/SelectedItemCard';
import { supplyChainData } from '../data/supplyChainData';
import { levelInfo } from '../data/levelInfo';
import { X } from 'lucide-react'; // Import the X icon

// NEW: Function to calculate perfectly centered grid positions
function calculateNonOverlappingPositions(items) {
  const positions = [];
  const count = items.length;
  
  if (count === 0) return [];

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const maxGridWidth = 55; 
  const maxGridHeight = 50;

  const xStep = cols > 1 ? maxGridWidth / (cols - 1) : 0;
  const yStep = rows > 1 ? maxGridHeight / (rows - 1) : 0;

  const gridTotalWidth = (cols - 1) * xStep;
  const gridTotalHeight = (rows - 1) * yStep;
  
  const startX = 45 - (gridTotalWidth / 2);
  const startY = 40 - (gridTotalHeight / 2);

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const isLastRow = row === rows - 1;
    const itemsInLastRow = count % cols === 0 ? cols : count % cols;
    
    let x;

    if (isLastRow && itemsInLastRow < cols) {
      const lastRowWidth = (itemsInLastRow - 1) * xStep;
      const lastRowStartX = 50 - (lastRowWidth / 2);
      x = lastRowStartX + (col * xStep);
    } else {
      x = startX + (col * xStep);
    }

    const y = startY + (row * yStep);

    const jitterX = (Math.random() - 0.5) * 4; 
    const jitterY = (Math.random() - 0.5) * 4;

    positions.push({
      x: x + jitterX,
      y: y + jitterY
    });
  }

  return positions;
}

export default function GPUSupplyChain() {
  const [history, setHistory] = useState([{ level: 0, items: supplyChainData.gpus, selectedItem: null }]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [itemPositions, setItemPositions] = useState([]);

  const currentState = history[history.length - 1];
  const currentLevelInfo = levelInfo[currentState.level];
  const canGoBack = history.length > 1;

  React.useEffect(() => {
    setItemPositions(calculateNonOverlappingPositions(currentState.items));
  }, [currentState.items]);

  function handleItemClick(item) {
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
      return;
    }
    setSelectedItem(item);
  }

  function handleDrillDown(item) {
    if (item.next && item.next.length > 0 && currentState.level < levelInfo.length - 1) {
      setIsTransitioning(true);
      setSelectedItem(null); 
      
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
    }
  }

  function handleBack() {
    if (!canGoBack) return;

    setIsTransitioning(true);
    setSelectedItem(null); 
    
    setTimeout(() => {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setIsTransitioning(false);
    }, 300);
  }

  const allLocations = currentState.items.flatMap(item => item.locations);
  const highlightLocation = selectedItem ? selectedItem.locations[0] : null;
  const hoverLocations = hoveredItem ? hoveredItem.locations : [];

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

  const locationChain = [];
  history.forEach((historyItem, idx) => {
    if (historyItem.selectedItem && historyItem.selectedItem.locations) {
      const primaryLocation = historyItem.selectedItem.locations[0];
      locationChain.push({
        location: primaryLocation,
        level: idx,
        itemName: historyItem.selectedItem.name
      });
    }
  });

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

          <div className="flex-1 relative bg-slate-900/30 rounded-2xl border border-slate-800 mt-6 transition-all duration-300 overflow-hidden">
            <div 
              className={`absolute inset-0 transition-all duration-500 ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              } ${selectedItem ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
            >
              {currentState.items.map((item, idx) => (
                <FloatingItem
                  key={item.id}
                  item={item}
                  index={idx}
                  position={itemPositions[idx] || { x: 50, y: 50 }}
                  onClick={handleItemClick}
                  onHover={setHoveredItem}
                  isSelected={selectedItem && selectedItem.id === item.id}
                  showHoverEffects={!selectedItem}
                />
              ))}
            </div>

            {selectedItem && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 p-8 overflow-y-auto animate-fade-in">
                {/* Close Button added here */}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 rounded-full transition-colors z-[60]"
                  aria-label="Close details"
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-6 mb-6">
                    <FloatingItem
                      item={selectedItem}
                      index={0}
                      position={{ x: 0, y: 0 }}
                      onClick={handleItemClick}
                      onHover={() => {}}
                      isSelected={true}
                      showHoverEffects={false}
                      inPopup={true}
                    />
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{selectedItem.name}</h2>
                      <div className="flex gap-3 mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedItem.risk >= 8 ? 'bg-red-500' : selectedItem.risk >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                        } text-white`}>
                          Risk Level: {selectedItem.risk}/10
                        </div>
                        {selectedItem.locations && (
                          <div className="px-3 py-1 rounded-full text-sm font-bold bg-slate-700 text-white">
                            {selectedItem.locations.map(loc => loc.name).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-slate-200">Risk Analysis</h3>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedItem.riskAnalysis || 'No detailed risk analysis available for this item.'}
                    </div>

                    {selectedItem.next && selectedItem.next.length > 0 && (
                      <button
                        onClick={() => handleDrillDown(selectedItem)}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50"
                      >
                        Explore Supply Chain →
                      </button>
                    )}
                  </div>

                  {selectedItem.shipping && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
                      <h3 className="text-xl font-semibold mb-4 text-slate-200">Logistics Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col">
                          <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Estimated Time</span>
                          <span className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-blue-400 text-lg">⏱</span> {selectedItem.shipping.time}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col">
                          <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Shipping Cost</span>
                          <span className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-green-400 text-lg">💰</span> {selectedItem.shipping.cost}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col">
                          <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Transport Method</span>
                          <span className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-purple-400 text-lg">✈️</span> {selectedItem.shipping.method}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Risk Breakdown Section (SORTED) */}
                  {selectedItem.riskScores && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-4">
                      <h3 className="text-xl font-semibold mb-6 text-slate-200">Risk Breakdown</h3>
                      
                      {/* Flex container for the whole chart */}
                      <div className="flex gap-2 px-2 items-end justify-between">
                        {Object.entries(selectedItem.riskScores)
                          // SORTING LOGIC ADDED HERE: Descending order (highest score first)
                          .sort(([,a], [,b]) => b - a)
                          .map(([key, value]) => {
                            const percentage = (value / 10) * 100;
                            const bgColor = value >= 8 ? 'bg-red-500' : value >= 5 ? 'bg-yellow-500' : 'bg-green-500';
                            const label = key.charAt(0).toUpperCase() + key.slice(1);
                            
                            return (
                              <div key={key} className="flex-1 flex flex-col items-center group relative">
                                {/* Hover Tooltip */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mb-2 pointer-events-none">
                                  <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap shadow-xl">
                                    {label}: {value}/10
                                  </div>
                                </div>

                                {/* Bar Container - FIXED HEIGHT (h-32) makes percentage height work */}
                                <div className="h-32 w-full flex items-end justify-center bg-slate-800/30 rounded-t-sm">
                                    <div 
                                      className={`w-full max-w-[20px] ${bgColor} rounded-t-sm transition-all duration-500 hover:brightness-110`}
                                      style={{ height: `${percentage}%` }}
                                    ></div>
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-[10px] text-slate-400 font-medium truncate w-full text-center">
                                  {key.slice(0, 3).toUpperCase()}
                                </div>
                              </div>
                            );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 mb-6 text-center text-slate-400 text-sm">
                    Click the item card again to close
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-[512px] flex-shrink-0 p-6 border-t lg:border-t-0 lg:border-l border-slate-800 transition-all duration-500">
          <h2 className="text-xl font-semibold mb-4 transition-all duration-300">Supply Chain Map</h2>
          <div className="h-[calc(100vh-120px)] transition-all duration-500">
            <SimpleGlobe locations={allLocations} highlight={highlightLocation} hoverLocations = {hoverLocations} locationChain={locationChain}/>
          </div>
        </div>
      </div>
      
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