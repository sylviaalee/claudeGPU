'use client';

import React, { useState } from 'react';
// Make sure these paths match where you saved your files!
import GPUGlobe from '../components/GPUGlobe'; 
import SimulationPage from '../components/SimulationPage';

export default function Home() {
  const [view, setView] = useState('selection'); // 'selection' or 'simulation'
  const [confirmedPath, setConfirmedPath] = useState([]);

  // This function is passed into GPUGlobe. 
  // It gets called when the user clicks the "Simulate" button inside GPUGlobe.
  const handleSimulate = (path) => {
    setConfirmedPath(path);
    setView('simulation');
  };

  // Optional: Function to go back to selection
  const handleBackToSelection = () => {
    setView('selection');
  };

  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      {view === 'selection' ? (
        /* 1. We pass the handleSimulate function down to GPUGlobe */
        <GPUGlobe onSimulate={handleSimulate} />
      ) : (
        /* 2. Once selected, we switch to SimulationPage and pass the data */
        <SimulationPage 
            selectedPath={confirmedPath} 
            // Optional: Pass a way to go back if you want
            // onBack={handleBackToSelection} 
        />
      )}
    </main>
  );
}