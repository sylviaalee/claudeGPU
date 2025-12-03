import React from 'react';

export default function SelectedItemCard({ item }) {
  if (!item) return null;

  return (
    <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-lg p-4 rounded-xl border border-blue-500/30 max-w-md">
      <div className="text-lg font-semibold mb-1">{item.name}</div>
      <div className="text-xs text-gray-300 mb-2">
        {item.locations.map(loc => loc.name).join(', ')}
      </div>
      {item.next && item.next.length > 0 && (
        <div className="text-xs text-blue-400">
          Click to see next step in supply chain →
        </div>
      )}
    </div>
  );
}