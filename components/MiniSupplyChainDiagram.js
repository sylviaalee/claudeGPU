import React from 'react';

export default function MiniSupplyChainDiagram({ vendorSelections = {}, currentComponent = null }) {
  // Define the tree structure with component IDs matching your data
  const tree = {
    name: "final assembly and testing",
    id: "final_assembly",
    children: [
      {
        name: "2.5D advanced packaging merge",
        id: "packaging_merge",
        children: [
          {
            name: "hbm3e (memory)",
            id: "hbm3e",
            children: [
              {
                name: "dram cells",
                id: "dram_cells",
                children: [
                  {
                    name: "silicon wafers",
                    id: "silicon_wafers_memory",
                    children: [
                      { name: "high purity quartz", id: "quartz_memory" }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "the substrate (abf)",
            id: "substrate_abf",
            children: [
              {
                name: "abf film",
                id: "abf_film",
                children: [
                  { name: "base polymers/solvents", id: "polymers_abf" }
                ]
              },
              {
                name: "copper clad laminates",
                id: "copper_clad_laminates",
                children: [
                  { name: "copper and resin", id: "copper_resin" }
                ]
              }
            ]
          },
          {
            name: "gpu die",
            id: "gpu_die",
            children: [
              {
                name: "photoresist",
                id: "photoresist",
                children: [
                  { name: "base polymers/solvents", id: "polymers_photoresist" }
                ]
              },
              {
                name: "silicon wafers",
                id: "silicon_wafers_gpu",
                children: [
                  { name: "high purity quartz", id: "quartz_gpu" }
                ]
              }
            ]
          }
        ]
      },
      { name: "pcb/motherboard", id: "pcb_motherboard" },
      {
        name: "coolers/heat sinks",
        id: "coolers_heat_sinks",
        children: [
          { name: "aluminium/copper", id: "aluminium_copper" }
        ]
      }
    ]
  };

  // Check if component is selected
  const isSelected = (nodeId) => {
    return vendorSelections && vendorSelections[nodeId];
  };

  // Check if component is current
  const isCurrent = (nodeId) => {
    return currentComponent && currentComponent.id === nodeId;
  };

  // Recursive component to render nodes
  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const selected = isSelected(node.id);
    const current = isCurrent(node.id);
    
    // Determine node styling based on state
    let nodeClass = "bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500/30 text-blue-200";
    
    if (current) {
      // Current node - bright blue with pulse animation
      nodeClass = "bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-400 text-white animate-pulse shadow-lg shadow-blue-500/50";
    } else if (selected) {
      // Selected node - green
      nodeClass = "bg-gradient-to-br from-blue-700 to-blue-800 border border-blue-500 text-blue-100";
    }
    
    return (
      <div className="flex flex-col items-center">
        {/* Node box */}
        <div className={`${nodeClass} px-2 py-1 rounded text-[7px] text-center mb-1 whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis shadow-lg transition-all duration-300`}>
          {node.name}
          {selected && !current && <span className="ml-1">✓</span>}
          {current && <span className="ml-1">●</span>}
        </div>
        
        {/* Children container */}
        {hasChildren && (
          <>
            {/* Vertical line down */}
            <div className={`w-px h-2 ${selected || current ? 'bg-blue-400/70' : 'bg-blue-400/50'}`}></div>
            
            {/* Horizontal container for children */}
            <div className="flex items-start gap-1 relative">
              {/* Horizontal line across children */}
              {node.children.length > 1 && (
                <div className={`absolute top-0 left-0 right-0 h-px ${selected || current ? 'bg-blue-400/50' : 'bg-blue-400/30'}`} style={{ 
                  width: 'calc(100% - 2px)',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}></div>
              )}
              
              {node.children.map((child, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {/* Vertical line to child */}
                  <div className={`w-px h-2 ${selected || current ? 'bg-blue-400/70' : 'bg-blue-400/50'}`}></div>
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/95 backdrop-blur-md border-2 border-blue-500/30 p-4 rounded-xl shadow-2xl overflow-y-auto max-h-[400px] w-[600px] z-[1500] pointer-events-auto">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Supply Chain Map</div>
      </div>
      <div className="w-full flex justify-center">
        <TreeNode node={tree} />
      </div>
    </div>
  );
}