import { useState, useMemo, useEffect, useRef } from 'react';
import { REMAINING_GAMES } from './constants';
import { parseResults } from './utils/parseResults';
import { computeStandings } from './utils/standings';
import { sortWithTiebreakers } from './utils/tiebreaker';
import { computeBracketSlots, clearDownstream } from './utils/bracket';
import Header from './components/Header';
import GamePicker from './components/GamePicker';
import StandingsTable from './components/StandingsTable';
import ArchMadnessBracket from './components/bracket/ArchMadnessBracket';
import Toast from './components/Toast';

const COMPLETED_GAMES = parseResults();

export default function App() {
  const [regularSeasonPicks, setRegularSeasonPicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mvc-season-picks')) || {}; } catch { return {}; }
  });
  const [bracketPicks, setBracketPicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mvc-bracket-picks')) || {}; } catch { return {}; }
  });
  const [toast, setToast] = useState(null);
  const prevSeedsRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Merge completed games + user's regular season picks into one game list
  const allGames = useMemo(() => {
    const pickedGames = REMAINING_GAMES
      .filter((g) => regularSeasonPicks[g.id])
      .map((g) => ({ away: g.away, home: g.home, winner: regularSeasonPicks[g.id] }));
    return [...COMPLETED_GAMES, ...pickedGames];
  }, [regularSeasonPicks]);

  const standings = useMemo(() => computeStandings(regularSeasonPicks), [regularSeasonPicks]);
  const seeds = useMemo(() => sortWithTiebreakers(standings, allGames), [standings, allGames]);
  const bracketSlots = useMemo(() => computeBracketSlots(seeds, bracketPicks), [seeds, bracketPicks]);

  // Persist picks to localStorage
  useEffect(() => {
    localStorage.setItem('mvc-season-picks', JSON.stringify(regularSeasonPicks));
  }, [regularSeasonPicks]);

  useEffect(() => {
    localStorage.setItem('mvc-bracket-picks', JSON.stringify(bracketPicks));
  }, [bracketPicks]);

  // Reset bracket whenever seedings change
  useEffect(() => {
    if (prevSeedsRef.current === null) {
      prevSeedsRef.current = seeds;
      return;
    }
    const changed = seeds.some((t, i) => t !== prevSeedsRef.current[i]);
    if (changed) {
      setBracketPicks({});
      prevSeedsRef.current = seeds;
      showToast('Standings updated — bracket reset.');
    }
  }, [seeds]);

  function showToast(msg) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  function handleGamePick(gameId, winner) {
    setRegularSeasonPicks((prev) => ({ ...prev, [gameId]: winner }));
  }

  function handleBracketPick(gameId, winner) {
    setBracketPicks((prev) => {
      const cleared = clearDownstream(prev, gameId);
      return { ...cleared, [gameId]: winner };
    });
  }

  function handleResetAll() {
    setRegularSeasonPicks({});
    setBracketPicks({});
  }

  function handleResetBracket() {
    setBracketPicks({});
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header onResetAll={handleResetAll} />
      <div className="flex flex-col lg:flex-row gap-4 p-3 lg:p-4">
        {/* Game Picker — full width on mobile, fixed sidebar on desktop */}
        <div className="w-full lg:w-[420px] lg:shrink-0">
          <GamePicker picks={regularSeasonPicks} onPick={handleGamePick} />
        </div>
        {/* Standings + Bracket */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-x-auto">
          <StandingsTable standings={standings} seeds={seeds} />
          <ArchMadnessBracket
            bracketSlots={bracketSlots}
            seeds={seeds}
            onPick={handleBracketPick}
            onResetBracket={handleResetBracket}
          />
        </div>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  );
}
