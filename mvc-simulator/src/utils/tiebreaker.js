import { getPct } from './standings';
import { NET_RANKINGS } from '../constants';

// H2H wins for teamA against teamB across all games
function h2hWins(teamA, teamB, allGames) {
  return allGames.filter(
    (g) =>
      g.winner === teamA &&
      ((g.away === teamA && g.home === teamB) ||
        (g.away === teamB && g.home === teamA))
  ).length;
}

// Two-team tiebreaker: returns negative if teamA should be seeded higher, positive if teamB
// Step 1: H2H record
// Step 2: NET ranking (lower number = better)
function twoTeamCmp(teamA, teamB, allGames) {
  // Step 1: H2H
  const aWins = h2hWins(teamA, teamB, allGames);
  const bWins = h2hWins(teamB, teamA, allGames);
  if (aWins > bWins) return -1;
  if (bWins > aWins) return 1;

  // Step 2: NET ranking (lower rank = higher seed)
  const aNet = NET_RANKINGS[teamA] ?? 999;
  const bNet = NET_RANKINGS[teamB] ?? 999;
  return aNet - bNet; // negative = teamA higher seed, positive = teamB higher seed
}

// Sort a tied group (2+ teams) recursively
function sortTiedGroup(tiedTeams, allGames) {
  if (tiedTeams.length === 1) return tiedTeams;

  if (tiedTeams.length === 2) {
    const [a, b] = tiedTeams;
    const cmp = twoTeamCmp(a, b, allGames);
    return cmp <= 0 ? [a, b] : [b, a];
  }

  // Multi-team: round-robin H2H win% among tied teams only
  const pctMap = {};
  for (const team of tiedTeams) {
    let wins = 0, games = 0;
    for (const opp of tiedTeams) {
      if (opp === team) continue;
      wins += h2hWins(team, opp, allGames);
      games += h2hWins(team, opp, allGames) + h2hWins(opp, team, allGames);
    }
    pctMap[team] = games > 0 ? wins / games : 0;
  }

  // Group by H2H win%
  const byPct = {};
  for (const team of tiedTeams) {
    const key = pctMap[team].toFixed(6);
    if (!byPct[key]) byPct[key] = [];
    byPct[key].push(team);
  }

  const sortedPcts = Object.keys(byPct).sort((a, b) => Number(b) - Number(a));

  const result = [];
  for (const pct of sortedPcts) {
    const subGroup = byPct[pct];
    if (subGroup.length === 1) {
      // Fully separated — done
      result.push(subGroup[0]);
    } else if (subGroup.length === 2) {
      // Exactly 2 remain tied — revert to two-team tiebreaker (H2H → NET)
      const [a, b] = subGroup;
      const cmp = twoTeamCmp(a, b, allGames);
      result.push(cmp <= 0 ? a : b, cmp <= 0 ? b : a);
    } else {
      // 3+ teams all had identical round-robin records — rank by NET
      result.push(...subGroup.sort((a, b) => (NET_RANKINGS[a] ?? 999) - (NET_RANKINGS[b] ?? 999)));
    }
  }
  return result;
}

// Main export: returns seeds array (index 0 = #1 seed)
export function sortWithTiebreakers(standings, allGames) {
  const teams = Object.keys(standings);

  // Group teams by W-L record
  const groups = {};
  for (const team of teams) {
    const { w, l } = standings[team];
    const key = `${w}:${l}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(team);
  }

  // Sort group keys by win% descending
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const [aw, al] = a.split(':').map(Number);
    const [bw, bl] = b.split(':').map(Number);
    return getPct(bw, bl) - getPct(aw, al);
  });

  const result = [];
  for (const key of sortedKeys) {
    const group = groups[key];
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      result.push(...sortTiedGroup(group, allGames));
    }
  }
  return result;
}
