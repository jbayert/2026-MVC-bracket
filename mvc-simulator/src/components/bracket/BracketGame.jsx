// A single bracket matchup: two clickable team slots
// Each slot is exactly 34px tall → total game height = 68px + 1px divider = 69px
export default function BracketGame({ gameId, teamA, teamB, winner, onPick, seedA, seedB }) {
  const canPick = Boolean(teamA && teamB);

  return (
    <div className="border border-gray-600 rounded overflow-hidden bg-gray-800 w-40 shrink-0">
      <TeamSlot
        team={teamA}
        seed={seedA}
        isWinner={winner === teamA}
        isLoser={Boolean(winner && winner !== teamA)}
        canPick={canPick}
        onClick={() => canPick && onPick(gameId, teamA)}
      />
      <div className="border-t border-gray-600" />
      <TeamSlot
        team={teamB}
        seed={seedB}
        isWinner={winner === teamB}
        isLoser={Boolean(winner && winner !== teamB)}
        canPick={canPick}
        onClick={() => canPick && onPick(gameId, teamB)}
      />
    </div>
  );
}

function TeamSlot({ team, seed, isWinner, isLoser, canPick, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!canPick}
      style={{ height: 34 }}
      className={[
        'w-full text-left px-2 flex items-center gap-1.5 transition-colors text-xs overflow-hidden',
        canPick && !isWinner ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-default',
        isWinner ? 'bg-indigo-800 text-white font-semibold' : '',
        isLoser ? 'text-gray-600 line-through' : '',
        !isWinner && !isLoser ? 'text-gray-200' : '',
        !team ? 'text-gray-600 italic' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {seed != null && (
        <span className="text-gray-500 font-normal shrink-0 w-5">({seed})</span>
      )}
      <span className="truncate">{team ?? 'TBD'}</span>
    </button>
  );
}
