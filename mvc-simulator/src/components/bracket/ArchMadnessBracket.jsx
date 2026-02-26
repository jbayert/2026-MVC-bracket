import BracketGame from './BracketGame';
import Champion from './Champion';

// Layout constants (all in px)
const GH = 69;   // game height (34px slot + 1px divider + 34px slot)
const GG = 20;   // gap between adjacent games in the same half
const HG = 44;   // extra gap between the two bracket halves
const CG = 28;   // horizontal gap between round columns
const CW = 160;  // column width (w-40)

// Vertical positions (top of each game box)
const QF3_Y = 0;
const QF4_Y = GH + GG;                         // 89
const QF1_Y = QF4_Y + GH + HG;                 // 202
const QF2_Y = QF1_Y + GH + GG;                 // 291

const SF2_Y = Math.round((QF3_Y + QF4_Y) / 2 + GH / 2 - GH / 2);
// = midpoint of QF3.top and QF4.top = 89/2 ≈ 44 → adjust for center:
// SF2 center should be midpoint of QF3.center and QF4.center
// = ((QF3_Y + GH/2) + (QF4_Y + GH/2)) / 2 - GH/2
const _sf2c = (QF3_Y + GH / 2 + QF4_Y + GH / 2) / 2;
const SF2_Y_REAL = Math.round(_sf2c - GH / 2);  // 44

const _sf1c = (QF1_Y + GH / 2 + QF2_Y + GH / 2) / 2;
const SF1_Y_REAL = Math.round(_sf1c - GH / 2);  // 247

const _fc = (SF2_Y_REAL + GH / 2 + SF1_Y_REAL + GH / 2) / 2;
const F_Y = Math.round(_fc - GH / 2);           // 145

// Horizontal column left-edge positions
const R1_X = 0;
const QF_X = CW + CG;        // 188
const SF_X = 2 * (CW + CG);  // 376
const F_X  = 3 * (CW + CG);  // 564
const CH_X = 4 * (CW + CG);  // 752

const TOTAL_W = CH_X + CW;   // 912
const TOTAL_H = QF2_Y + GH + 16; // some bottom padding

// SVG connector paths (bracket lines between rounds)
function buildConnectors() {
  const mid = GH / 2;        // vertical midpoint of a game = 34.5
  const slotH = GH / 2;      // half-game = one team slot height ≈ 34px
  const vMid = (x) => x - CG / 2; // x of vertical connector line (between columns)

  return [
    // R1B → QF3: R1B winner enters QF3's team-B slot
    `M ${R1_X + CW} ${QF3_Y + mid} H ${vMid(QF_X)} V ${QF3_Y + slotH + slotH / 2} H ${QF_X}`,

    // R1C → QF1: R1C winner enters QF1's team-B slot
    `M ${R1_X + CW} ${QF1_Y + mid} H ${vMid(QF_X)} V ${QF1_Y + slotH + slotH / 2} H ${QF_X}`,

    // R1A → QF4: R1A winner enters QF4's team-B slot
    `M ${R1_X + CW} ${QF4_Y + mid} H ${vMid(QF_X)} V ${QF4_Y + slotH + slotH / 2} H ${QF_X}`,

    // QF3 + QF4 → SF2
    `M ${QF_X + CW} ${QF3_Y + mid} H ${vMid(SF_X)} V ${QF4_Y + mid} M ${QF_X + CW} ${QF4_Y + mid} H ${vMid(SF_X)} M ${vMid(SF_X)} ${SF2_Y_REAL + mid} H ${SF_X}`,

    // QF1 + QF2 → SF1
    `M ${QF_X + CW} ${QF1_Y + mid} H ${vMid(SF_X)} V ${QF2_Y + mid} M ${QF_X + CW} ${QF2_Y + mid} H ${vMid(SF_X)} M ${vMid(SF_X)} ${SF1_Y_REAL + mid} H ${SF_X}`,

    // SF2 + SF1 → F
    `M ${SF_X + CW} ${SF2_Y_REAL + mid} H ${vMid(F_X)} V ${SF1_Y_REAL + mid} M ${SF_X + CW} ${SF1_Y_REAL + mid} H ${vMid(F_X)} M ${vMid(F_X)} ${F_Y + mid} H ${F_X}`,

    // F → Champion
    `M ${F_X + CW} ${F_Y + mid} H ${CH_X}`,
  ];
}

const CONNECTORS = buildConnectors();

export default function ArchMadnessBracket({ bracketSlots, seeds, onPick, onResetBracket }) {
  const { R1A, R1B, R1C, QF1, QF2, QF3, QF4, SF1, SF2, F } = bracketSlots;
  const s = (n) => seeds[n - 1] ?? null;

  const roundLabels = [
    { label: 'First Round', x: R1_X, w: CW },
    { label: 'Quarterfinals', x: QF_X, w: CW },
    { label: 'Semifinals', x: SF_X, w: CW },
    { label: 'Championship', x: F_X, w: CW },
    { label: '', x: CH_X, w: CW },
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Arch Madness Bracket
          </h2>
          <a
            href="https://mvc-sports.com/sports/arch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-400 transition-colors"
            title="Arch Madness"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
        <button
          onClick={onResetBracket}
          className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          Reset Bracket
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        {/* Round labels row */}
        <div className="relative mb-2" style={{ width: TOTAL_W, height: 18 }}>
          {roundLabels.map(({ label, x, w }) => (
            <div
              key={x}
              className="absolute text-center text-xs text-gray-500 font-medium"
              style={{ left: x, width: w, top: 0 }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bracket canvas */}
        <div className="relative" style={{ width: TOTAL_W, height: TOTAL_H }}>
          {/* SVG connector lines */}
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            width={TOTAL_W}
            height={TOTAL_H}
          >
            {CONNECTORS.map((d, i) => (
              <path key={i} d={d} stroke="#4B5563" strokeWidth={2} fill="none" />
            ))}
          </svg>

          {/* First Round */}
          <div className="absolute" style={{ left: R1_X, top: QF3_Y }}>
            <BracketGame gameId="R1B" {...R1B} seedA={7} seedB={10} onPick={onPick} />
          </div>
          <div className="absolute" style={{ left: R1_X, top: QF4_Y }}>
            <BracketGame gameId="R1A" {...R1A} seedA={6} seedB={11} onPick={onPick} />
          </div>
          <div className="absolute" style={{ left: R1_X, top: QF1_Y }}>
            <BracketGame gameId="R1C" {...R1C} seedA={8} seedB={9} onPick={onPick} />
          </div>

          {/* Quarterfinals */}
          <div className="absolute" style={{ left: QF_X, top: QF3_Y }}>
            <BracketGame gameId="QF3" {...QF3} seedA={2} onPick={onPick} />
          </div>
          <div className="absolute" style={{ left: QF_X, top: QF4_Y }}>
            <BracketGame gameId="QF4" {...QF4} seedA={3} onPick={onPick} />
          </div>
          <div className="absolute" style={{ left: QF_X, top: QF1_Y }}>
            <BracketGame gameId="QF1" {...QF1} seedA={1} onPick={onPick} />
          </div>
          <div className="absolute" style={{ left: QF_X, top: QF2_Y }}>
            <BracketGame gameId="QF2" {...QF2} seedA={4} seedB={5} onPick={onPick} />
          </div>

          {/* Semifinals */}
          <div className="absolute" style={{ left: SF_X, top: SF2_Y_REAL }}>
            <BracketGame gameId="SF2" {...SF2} onPick={onPick} />
          </div>
          <div className="absolute" style={{ left: SF_X, top: SF1_Y_REAL }}>
            <BracketGame gameId="SF1" {...SF1} onPick={onPick} />
          </div>

          {/* Championship */}
          <div className="absolute" style={{ left: F_X, top: F_Y }}>
            <BracketGame gameId="F" {...F} onPick={onPick} />
          </div>

          {/* Champion display */}
          <div className="absolute" style={{ left: CH_X, top: F_Y }}>
            <Champion team={F?.winner} />
          </div>
        </div>
      </div>
    </div>
  );
}
