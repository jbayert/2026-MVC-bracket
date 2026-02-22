export default function GameCard({ game, pick, onPick }) {
  return (
    <div className="bg-gray-800 rounded p-2 flex flex-col gap-1.5">
      <div className="text-xs text-gray-500 truncate">{game.location}</div>
      <TeamBtn
        label={game.away}
        selected={pick === game.away}
        onPick={() => onPick(pick === game.away ? null : game.away)}
      />
      <TeamBtn
        label={game.home}
        selected={pick === game.home}
        onPick={() => onPick(pick === game.home ? null : game.home)}
      />
    </div>
  );
}

function TeamBtn({ label, selected, onPick }) {
  return (
    <button
      onClick={onPick}
      className={`w-full text-xs py-2 px-2 rounded font-medium transition-all leading-tight text-center
        ${selected
          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
    >
      {label}
    </button>
  );
}
