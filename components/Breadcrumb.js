import React from 'react';

export default function Breadcrumb({ history, levelInfo }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
      {history.map((h, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>→</span>}
          <span className={idx === history.length - 1 ? 'text-blue-400' : ''}>
            {levelInfo[h.level].title}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}