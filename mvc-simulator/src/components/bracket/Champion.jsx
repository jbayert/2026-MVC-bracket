export default function Champion({ team }) {
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center w-40 h-16 border-2 border-dashed border-gray-700 rounded text-gray-600 text-xs italic shrink-0">
        Champion TBD
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center w-40 shrink-0 bg-yellow-500/10 border-2 border-yellow-500 rounded px-3 py-3 text-center">
      <span className="text-yellow-400 text-lg leading-none mb-1">🏆</span>
      <span className="text-yellow-300 font-bold text-sm leading-tight">{team}</span>
      <span className="text-yellow-600 text-xs mt-0.5">Arch Madness Champion</span>
    </div>
  );
}
