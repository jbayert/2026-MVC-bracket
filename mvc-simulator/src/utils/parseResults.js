import resultsRaw from '../data/results.csv?raw';

export function parseResults() {
  const lines = resultsRaw.trim().split('\n');
  if (lines.length <= 1) return [];
  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(',');
      return {
        away: parts[0]?.trim(),
        home: parts[1]?.trim(),
        winner: parts[2]?.trim(),
      };
    })
    .filter((g) => g.away && g.home && g.winner);
}
