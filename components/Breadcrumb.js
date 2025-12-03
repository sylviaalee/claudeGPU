export default function Breadcrumb({ history, levelInfo }) {
  return (
    <div className="flex items-start space-x-6 text-sm text-slate-300">
      {history.map((state, idx) => {
        const level = levelInfo[state.level];
        return (
          <div key={idx} className="flex items-start space-x-2">
            
            <div className="flex flex-col">
              <span className="text-slate-400">{level.title}</span>

              {/* ⭐ Show selected item under the level */}
              {state.selectedItem && (
                <span className="text-white">
                  {state.selectedItem.name}
                </span>
              )}
            </div>

            {/* Separator arrow (except last item) */}
            {idx < history.length - 1 && (
              <span className="text-slate-600">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
