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

// Two-team tiebreaker with reason strings for each team
function twoTeamCmpWithReason(teamA, teamB, allGames) {
  const aWins = h2hWins(teamA, teamB, allGames);
  const bWins = h2hWins(teamB, teamA, allGames);

  if (aWins !== bWins) {
    return {
      cmp: aWins > bWins ? -1 : 1,
      reasonA: `H2H vs ${teamB}: ${aWins}–${bWins}`,
      reasonB: `H2H vs ${teamA}: ${bWins}–${aWins}`,
    };
  }

  const aNet = NET_RANKINGS[teamA] ?? 999;
  const bNet = NET_RANKINGS[teamB] ?? 999;
  const prefix = aWins + bWins > 0 ? `H2H split (${aWins}–${bWins}) → ` : '';
  return {
    cmp: aNet - bNet,
    reasonA: `${prefix}NET ranking: #${aNet} vs #${bNet}`,
    reasonB: `${prefix}NET ranking: #${bNet} vs #${aNet}`,
  };
}

// Sort a tied group (2+ teams) recursively; returns { sorted, reasons }
function sortTiedGroup(tiedTeams, allGames) {
  const reasons = {};

  if (tiedTeams.length === 1) return { sorted: tiedTeams, reasons };

  if (tiedTeams.length === 2) {
    const [a, b] = tiedTeams;
    const { cmp, reasonA, reasonB } = twoTeamCmpWithReason(a, b, allGames);
    reasons[a] = reasonA;
    reasons[b] = reasonB;
    return { sorted: cmp <= 0 ? [a, b] : [b, a], reasons };
  }

  // Multi-team: round-robin H2H win% among tied teams only
  const winsMap = {};
  const gamesMap = {};
  for (const team of tiedTeams) {
    let wins = 0, games = 0;
    for (const opp of tiedTeams) {
      if (opp === team) continue;
      const w = h2hWins(team, opp, allGames);
      const l = h2hWins(opp, team, allGames);
      wins += w;
      games += w + l;
    }
    winsMap[team] = wins;
    gamesMap[team] = games;
  }

  const pctMap = {};
  for (const team of tiedTeams) {
    pctMap[team] = gamesMap[team] > 0 ? winsMap[team] / gamesMap[team] : 0;
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
      const team = subGroup[0];
      const w = winsMap[team], g = gamesMap[team];
      reasons[team] = g > 0
        ? `Round-robin H2H: ${w}–${g - w} vs group`
        : 'NET ranking (no H2H games played yet)';
      result.push(team);
    } else if (subGroup.length === 2) {
      const [a, b] = subGroup;
      const wa = winsMap[a], ga = gamesMap[a];
      const rrNote = ga > 0 ? `Round-robin H2H split (${wa}–${ga - wa}) → ` : '';
      const { cmp, reasonA, reasonB } = twoTeamCmpWithReason(a, b, allGames);
      reasons[a] = rrNote + reasonA;
      reasons[b] = rrNote + reasonB;
      result.push(cmp <= 0 ? a : b, cmp <= 0 ? b : a);
    } else {
      // 3+ teams all had identical round-robin records — rank by NET
      const sorted = [...subGroup].sort((a, b) => (NET_RANKINGS[a] ?? 999) - (NET_RANKINGS[b] ?? 999));
      for (const team of sorted) {
        const w = winsMap[team], g = gamesMap[team];
        const rrNote = g > 0 ? `Round-robin H2H split (${w}–${g - w}) → ` : '';
        reasons[team] = `${rrNote}NET ranking: #${NET_RANKINGS[team] ?? 999}`;
      }
      result.push(...sorted);
    }
  }
  return { sorted: result, reasons };
}

// Main export: returns { seeds, tiebreakerReasons }
// tiebreakerReasons: map of team name → { tiedWith: [...], description: string }
export function sortWithTiebreakers(standings, allGames) {
  const teams = Object.keys(standings);
  const tiebreakerReasons = {};

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

  const seeds = [];
  for (const key of sortedKeys) {
    const group = groups[key];
    if (group.length === 1) {
      seeds.push(group[0]);
    } else {
      const { sorted, reasons } = sortTiedGroup(group, allGames);
      seeds.push(...sorted);
      for (const team of sorted) {
        tiebreakerReasons[team] = {
          tiedWith: sorted.filter((t) => t !== team),
          description: reasons[team] || null,
        };
      }
    }
  }
  return { seeds, tiebreakerReasons };
}
