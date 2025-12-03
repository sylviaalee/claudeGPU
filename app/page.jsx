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
  const [history, setHistory] = useState([{ level: 0, items: supplyChainData.gpus }]);
  const [selectedItem, setSelectedItem] = useState(null);

  const currentState = history[history.length - 1];
  const currentLevelInfo = levelInfo[currentState.level];
  const canGoBack = history.length > 1;

  function handleItemClick(item) {
    setSelectedItem(item);
    
    if (item.next && item.next.length > 0 && currentState.level < levelInfo.length - 1) {
      const nextLevelKey = levelInfo[currentState.level + 1].key;
      const nextItems = supplyChainData[nextLevelKey].filter(i => item.next.includes(i.id));
      
      setHistory([...history, {
        level: currentState.level + 1,
        items: nextItems,
        parent: item
      }]);
    }
  }

  function handleBack() {
    if (canGoBack) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setSelectedItem(newHistory[newHistory.length - 1].parent || null);
    }
  }

  const allLocations = currentState.items.flatMap(item => item.locations);
  const highlightLocation = selectedItem ? selectedItem.locations[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-zinc-900 text-white">
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 flex flex-col p-6">
          <LevelHeader
            levelInfo={currentLevelInfo}
            levelNumber={currentState.level + 1}
            totalLevels={levelInfo.length}
            canGoBack={canGoBack}
            onBack={handleBack}
          />
          
          <Breadcrumb history={history} levelInfo={levelInfo} />

          <div className="flex-1 relative bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden mt-6">
            {currentState.items.map((item, idx) => (
              <FloatingItem
                key={item.id}
                item={item}
                index={idx}
                onClick={handleItemClick}
              />
            ))}

            <SelectedItemCard item={selectedItem} />
          </div>
        </div>

        <div className="lg:w-96 p-6 border-t lg:border-t-0 lg:border-l border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Supply Chain Map</h2>
          <div className="h-96 lg:h-[calc(100vh-120px)]">
            <SimpleGlobe locations={allLocations} highlight={highlightLocation} />
          </div>
        </div>
      </div>
    </div>
  );
}