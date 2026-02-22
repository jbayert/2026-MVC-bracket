export default function Header({ onResetAll }) {
  return (
    <header className="bg-indigo-950 border-b border-indigo-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            MVC 2025-26 Scenario Simulator
          </h1>
          <p className="text-indigo-400 text-xs mt-0.5">
            Arch Madness · March 5–8, 2026 · Enterprise Center, St. Louis
          </p>
        </div>
        <button
          onClick={onResetAll}
          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-medium rounded transition-colors"
        >
          Reset All Picks
        </button>
      </div>
    </header>
  );
}
