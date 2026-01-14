'use client';
import React, { useState } from 'react';
// Make sure these paths match where you saved your files!
import GPUGlobe from '../components/GPUGlobe'; 
import SimulationPage from '../components/SimulationPage';

// Import the level info structure
import { levelInfo } from '../data/levelInfo';

export default function Home() {
  const [view, setView] = useState('selection'); // 'selection' or 'simulation'
  const [vendorSelections, setVendorSelections] = useState({});
  
  // This function is passed into GPUGlobe. 
  // It gets called when the user completes their vendor selections.
  // selections should be an object mapping component IDs to chosen vendors:
  // {
  //   "quartz_gpu": { id: "silicon-raw", name: "Spruce Pine Quartz", risk: 8.9, cost: 100, ... },
  //   "gpu_die": { id: "tsmc", name: "TSMC (4nm/5nm)", risk: 8.7, cost: 1000, ... },
  //   ...
  // }
  const handleSimulate = (selections) => {
    console.log('Vendor selections:', selections);
    setVendorSelections(selections);
    setView('simulation');
  };
  
  // Function to go back to selection
  const handleBackToSelection = () => {
    setView('selection');
    setVendorSelections({}); // Clear the selections when going back
  };
  
  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      {view === 'selection' ? (
        /* Pass levelInfo and handleSimulate to GPUGlobe */
        <GPUGlobe 
          levelInfo={levelInfo[0]} 
          onSimulate={handleSimulate} 
        />
      ) : (
        /* Pass both levelInfo and vendorSelections to SimulationPage */
        <SimulationPage 
          levelInfo={levelInfo[0]}
          vendorSelections={vendorSelections} 
          onRestart={handleBackToSelection}
        />
      )}
    </main>
  );
}