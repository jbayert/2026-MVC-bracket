// Bracket structure (11 teams, 4 rounds):
//
// FIRST ROUND (seeds 6-11 play):
//   R1A: (6) vs (11)
//   R1B: (7) vs (10)
//   R1C: (8) vs (9)
//
// QUARTERFINALS:
//   QF1: (1) vs R1C winner
//   QF2: (4) vs (5)
//   QF3: (2) vs R1B winner
//   QF4: (3) vs R1A winner
//
// SEMIFINALS:
//   SF1: QF1 winner vs QF2 winner
//   SF2: QF3 winner vs QF4 winner
//
// CHAMPIONSHIP:
//   F: SF1 winner vs SF2 winner

export function computeBracketSlots(seeds, bracketPicks) {
  const s = (n) => seeds[n - 1] || null; // 1-indexed seed → team name

  const slots = {
    R1A: { teamA: s(6),  teamB: s(11), winner: bracketPicks.R1A || null },
    R1B: { teamA: s(7),  teamB: s(10), winner: bracketPicks.R1B || null },
    R1C: { teamA: s(8),  teamB: s(9),  winner: bracketPicks.R1C || null },
  };

  slots.QF1 = { teamA: s(1), teamB: slots.R1C.winner, winner: bracketPicks.QF1 || null };
  slots.QF2 = { teamA: s(4), teamB: s(5),              winner: bracketPicks.QF2 || null };
  slots.QF3 = { teamA: s(2), teamB: slots.R1B.winner, winner: bracketPicks.QF3 || null };
  slots.QF4 = { teamA: s(3), teamB: slots.R1A.winner, winner: bracketPicks.QF4 || null };

  slots.SF1 = { teamA: slots.QF1.winner, teamB: slots.QF2.winner, winner: bracketPicks.SF1 || null };
  slots.SF2 = { teamA: slots.QF3.winner, teamB: slots.QF4.winner, winner: bracketPicks.SF2 || null };

  slots.F = { teamA: slots.SF1.winner, teamB: slots.SF2.winner, winner: bracketPicks.F || null };

  return slots;
}

// Downstream dependency map: picking gameId clears these games too
const DOWNSTREAM = {
  R1A: ['QF4', 'SF2', 'F'],
  R1B: ['QF3', 'SF2', 'F'],
  R1C: ['QF1', 'SF1', 'F'],
  QF1: ['SF1', 'F'],
  QF2: ['SF1', 'F'],
  QF3: ['SF2', 'F'],
  QF4: ['SF2', 'F'],
  SF1: ['F'],
  SF2: ['F'],
  F:   [],
};

export function clearDownstream(bracketPicks, gameId) {
  const newPicks = { ...bracketPicks };
  for (const id of DOWNSTREAM[gameId] || []) {
    delete newPicks[id];
  }
  return newPicks;
}
