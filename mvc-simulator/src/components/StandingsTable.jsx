import { getPct, getGB } from '../utils/standings';

export default function StandingsTable({ standings, seeds }) {
  if (!seeds.length) return null;

  const leader = seeds[0];
  const { w: lw, l: ll } = standings[leader];

  // Pre-compute display seed labels (handles co-seeds like "T-5")
  const displaySeeds = seeds.map((team, idx) => {
    const { w, l } = standings[team];
    const groupIndices = seeds.reduce((acc, t, i) => {
      if (standings[t].w === w && standings[t].l === l) acc.push(i);
      return acc;
    }, []);
    return groupIndices.length > 1 ? `T-${groupIndices[0] + 1}` : `${idx + 1}`;
  });

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Conference Standings
        </h2>
        <a
          href="https://mvc-sports.com/standings.aspx?standings=74"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-indigo-400 transition-colors"
          title="MVC Standings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase">
              <th className="text-left pb-2 pr-2 w-10">#</th>
              <th className="text-left pb-2">Team</th>
              <th className="text-right pb-2 w-8">W</th>
              <th className="text-right pb-2 w-8">L</th>
              <th className="text-right pb-2 w-12 hidden sm:table-cell">GB</th>
              <th className="text-right pb-2 w-14">PCT</th>
            </tr>
          </thead>
          <tbody>
            {seeds.map((team, idx) => {
              const { w, l } = standings[team];
              const seed = idx + 1;
              const isBye = seed <= 5;
              const gb = seed === 1 ? '—' : getGB(lw, ll, w, l).toFixed(1);
              const pct = getPct(w, l).toFixed(3).replace(/^0/, '');

              return (
                <tr
                  key={team}
                  className={`border-t border-gray-800 ${isBye ? 'bg-indigo-950/40' : ''}`}
                >
                  <td className="py-1.5 pr-2 text-gray-500 text-xs">{displaySeeds[idx]}</td>
                  <td className="py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={isBye ? 'text-white font-medium' : 'text-gray-300'}>
                        {team}
                      </span>
                      {isBye && (
                        <span className="text-xs bg-indigo-700 text-indigo-200 px-1.5 py-0.5 rounded font-medium">
                          BYE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 text-right text-gray-300">{w}</td>
                  <td className="py-1.5 text-right text-gray-300">{l}</td>
                  <td className="py-1.5 text-right text-gray-500 text-xs hidden sm:table-cell">{gb}</td>
                  <td className="py-1.5 text-right text-gray-500 text-xs">{pct}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Seeds 1–5 receive first-round byes · Seeds 6–11 play in
      </p>
    </div>
  );
}
