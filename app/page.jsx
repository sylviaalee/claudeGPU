"use client";

import React, { useState } from 'react';
import FloatingItem from '../components/FloatingItem';
import SimpleGlobe from '../components/SimpleGlobe';
import LevelHeader from '../components/LevelHeader';
import Breadcrumb from '../components/Breadcrumb';
import SelectedItemCard from '../components/SelectedItemCard';
import { supplyChainData } from '../data/supplyChainData';
import { levelInfo } from '../data/levelInfo';

// Function to calculate non-overlapping positions
function calculateNonOverlappingPositions(items, containerWidth = 100, containerHeight = 100) {
  const positions = [];
  const itemSize = 12; // Approximate size of each item as percentage
  const minDistance = itemSize + 8; // Minimum distance between centers
  const maxAttempts = 300;
  const padding = 10; // Padding from edges

  for (let i = 0; i < items.length; i++) {
    let position;
    let attempts = 0;
    let validPosition = false;

    while (!validPosition && attempts < maxAttempts) {
      // Generate random position in 2D space
      position = {
        x: padding + Math.random() * (containerWidth - 2 * padding - itemSize),
        y: padding + Math.random() * (containerHeight - 2 * padding - itemSize),
      };

      // Check if position overlaps with existing positions using 2D distance
      validPosition = true;
      for (const existingPos of positions) {
        const distance = Math.sqrt(
          Math.pow(position.x - existingPos.x, 2) + 
          Math.pow(position.y - existingPos.y, 2)
        );
        
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }

    // If we couldn't find a valid position after max attempts, use a grid fallback
    if (!validPosition) {
      const cols = Math.ceil(Math.sqrt(items.length));
      const row = Math.floor(i / cols);
      const col = i % cols;
      position = {
        x: padding + (col * (containerWidth - 2 * padding - itemSize) / cols),
        y: padding + (row * (containerHeight - 2 * padding - itemSize) / cols),
      };
    }

    positions.push(position);
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

  // Recalculate positions whenever items change
  React.useEffect(() => {
    setItemPositions(calculateNonOverlappingPositions(currentState.items));
  }, [currentState.items]);

  function handleItemClick(item) {
    // If clicking the same item that's already selected, toggle the popup off
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
      return;
    }
    
    setSelectedItem(item);
  }

  function handleDrillDown(item) {
    if (item.next && item.next.length > 0 && currentState.level < levelInfo.length - 1) {
      setIsTransitioning(true);
      setSelectedItem(null); // Close popup when drilling down
      
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
    setSelectedItem(null); // Close popup when going back
    
    setTimeout(() => {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
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

  // Build the chain of locations from history
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

            {/* Fullscreen popup for selected item */}
            {selectedItem && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 p-8 overflow-y-auto animate-fade-in">
                <div className="flex flex-col h-full">
                  {/* Top section with item card */}
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
                          selectedItem.risk >= 8 ? 'bg-red-500' : selectedItem.risk >= 6 ? 'bg-yellow-500' : 'bg-green-500'
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

                  {/* Risk Analysis Section */}
                  <div className="flex-1 bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-slate-200">Risk Analysis</h3>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedItem.riskAnalysis || 'No detailed risk analysis available for this item.'}
                    </div>

                    {/* Drill down button if available */}
                    {selectedItem.next && selectedItem.next.length > 0 && (
                      <button
                        onClick={() => handleDrillDown(selectedItem)}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50"
                      >
                        Explore Supply Chain →
                      </button>
                    )}
                  </div>

                  {/* Logistics Profile (NEW SECTION) */}
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
                  
                  {/* Risk Breakdown Section */}
                  {selectedItem.riskScores && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-4">
                      <h3 className="text-xl font-semibold mb-4 text-slate-200">Risk Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(selectedItem.riskScores).map(([key, value]) => {
                          const percentage = (value / 10) * 100;
                          const bgColor = value >= 8 ? 'bg-red-500' : value >= 6 ? 'bg-yellow-500' : 'bg-green-500';
                          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                          
                          return (
                            <div key={key} className="bg-slate-900/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-300">{label}</span>
                                <span className="text-sm font-bold text-white">{value}/10</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`${bgColor} h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                />
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