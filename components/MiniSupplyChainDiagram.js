import React from 'react';

export default function MiniSupplyChainDiagram() {
  // Define the tree structure
  const tree = {
    name: "final assembly and testing",
    children: [
      {
        name: "2.5D advanced packaging merge",
        children: [
          {
            name: "hbm3e (memory)",
            children: [
              {
                name: "dram cells",
                children: [
                  {
                    name: "silicon wafers",
                    children: [
                      { name: "high purity quartz" }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "the substrate (abf)",
            children: [
              {
                name: "abf film",
                children: [
                  { name: "base polymers/solvents" }
                ]
              },
              {
                name: "copper clad laminates",
                children: [
                  { name: "copper and resin" }
                ]
              }
            ]
          },
          {
            name: "gpu die",
            children: [
              {
                name: "photoresist",
                children: [
                  { name: "base polymers/solvents" }
                ]
              },
              {
                name: "silicon wafers",
                children: [
                  { name: "high purity quartz" }
                ]
              }
            ]
          }
        ]
      },
      { name: "pcb/motherboard" },
      {
        name: "coolers/heat sinks",
        children: [
          { name: "aluminium/copper" }
        ]
      }
    ]
  };

  // Recursive component to render nodes
  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div className="flex flex-col items-center">
        {/* Node box */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500/30 px-2 py-1 rounded text-[7px] text-center mb-1 whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis text-blue-200 shadow-lg">
          {node.name}
        </div>
        
        {/* Children container */}
        {hasChildren && (
          <>
            {/* Vertical line down */}
            <div className="w-px h-2 bg-blue-400/50"></div>
            
            {/* Horizontal container for children */}
            <div className="flex items-start gap-1 relative">
              {/* Horizontal line across children */}
              {node.children.length > 1 && (
                <div className="absolute top-0 left-0 right-0 h-px bg-blue-400/30" style={{ 
                  width: 'calc(100% - 2px)',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}></div>
              )}
              
              {node.children.map((child, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {/* Vertical line to child */}
                  <div className="w-px h-2 bg-blue-400/50"></div>
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
        <div className="text-xs text-gray-500">Technical Overview</div>
      </div>
      <div className="w-full flex justify-center">
        <TreeNode node={tree} />
      </div>
    </div>
  );
}