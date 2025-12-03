import React from 'react';

export default function Breadcrumb({ history, levelInfo }) {
  return (
    <div className="flex items-center gap-2 text-xs mt-3 min-w-max pb-2">
      {history.map((h, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-gray-600">→</span>}
          <div className="flex flex-col flex-shrink-0">
            <span className={idx === history.length - 1 ? 'text-blue-400 font-medium' : 'text-gray-400'}>
              {levelInfo[h.level].title}
            </span>
            {h.selectedItem && (
              <span className="text-gray-500 text-[10px] mt-0.5">
                {h.selectedItem.name}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}