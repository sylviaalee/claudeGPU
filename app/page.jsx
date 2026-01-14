'use client';
import React, { useState } from 'react';
// Make sure these paths match where you saved your files!
import GPUGlobe from '../components/GPUGlobe'; 
import SimulationPage from '../components/SimulationPage';

// Import the level info structure
import { levelInfo } from '../data/levelInfo';

export default function Home() {
  const [view, setView] = useState('selection');
  const [vendorSelections, setVendorSelections] = useState({});
  
  const handleSimulate = (selections) => {
    console.log('Vendor selections:', selections);
    setVendorSelections(selections);
    setView('simulation');
  };
  
  const handleBackToSelection = () => {
    setView('selection');
    setVendorSelections({});
  };
  
  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      {view === 'selection' ? (
        <GPUGlobe 
          levelInfo={levelInfo[0]} 
          onSimulate={handleSimulate} 
        />
      ) : (
        <SimulationPage 
          vendorSelections={vendorSelections} 
          levelInfo={levelInfo[0]}
          onBackToSelection={handleBackToSelection}  // Add this
        />
      )}
    </main>
  );
}