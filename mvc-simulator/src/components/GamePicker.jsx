import { REMAINING_GAMES } from '../constants';
import GameCard from './GameCard';

function groupByDate(games) {
  const groups = {};
  for (const game of games) {
    if (!groups[game.date]) groups[game.date] = [];
    groups[game.date].push(game);
  }
  return groups;
}

export default function GamePicker({ picks, onPick }) {
  const groups = groupByDate(REMAINING_GAMES);
  const total = REMAINING_GAMES.length;
  const selected = REMAINING_GAMES.filter((g) => picks[g.id]).length;
  const allPicked = selected === total;

  return (
    <div className="bg-gray-900 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Remaining Games
        </h2>
        <a
          href="https://mvc-sports.com/calendar.aspx?path=mbball"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-indigo-400 transition-colors"
          title="MVC Schedule"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
        <span className="ml-auto flex items-center gap-1.5">
          {allPicked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <span className="text-xs text-gray-500">{selected}/{total}</span>
          )}
        </span>
      </div>
      {Object.entries(groups).map(([date, games]) => (
        <div key={date} className="mb-3">
          <div className="text-xs font-bold text-indigo-400 uppercase mb-1.5 pb-1 border-b border-gray-700">
            {date}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                pick={picks[game.id]}
                onPick={(winner) => onPick(game.id, winner)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
