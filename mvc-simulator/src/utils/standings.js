import { INITIAL_STANDINGS, REMAINING_GAMES } from '../constants';

export function computeStandings(picks) {
  const standings = {};
  for (const team of Object.keys(INITIAL_STANDINGS)) {
    standings[team] = { ...INITIAL_STANDINGS[team] };
  }
  for (const game of REMAINING_GAMES) {
    const winner = picks[game.id];
    if (!winner) continue;
    const loser = winner === game.away ? game.home : game.away;
    standings[winner].w += 1;
    standings[loser].l += 1;
  }
  return standings;
}

export function getPct(w, l) {
  const total = w + l;
  if (total === 0) return 0;
  return w / total;
}

export function getGB(leaderW, leaderL, teamW, teamL) {
  return ((leaderW - teamW) + (teamL - leaderL)) / 2;
}
