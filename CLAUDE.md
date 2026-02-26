# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React SPA for simulating MVC (Missouri Valley Conference) 2025-26 basketball tournament scenarios. Users pick regular season game winners to see updated standings and build bracket predictions. Deployed to GitHub Pages.

**All work is done inside `mvc-simulator/`** — that's where `package.json` lives.

## Commands

Run from `mvc-simulator/`:

```bash
npm run dev       # local dev server (Vite HMR)
npm run build     # production build → dist/
npm run preview   # preview production build locally
npm run lint      # ESLint
npm run deploy    # build + push to gh-pages branch
```

No test framework is configured.

## Architecture

**Data flow:**

```
INITIAL_STANDINGS (constants.js)
results.csv (completed games)         ─┐
User picks (regularSeasonPicks state)  ├→ allGames → sortWithTiebreakers() → seeds
                                       │                                     ↓
                                                               computeBracketSlots()
                                                                     ↓
                                                               bracketSlots (10 games)
```

**State lives entirely in `App.jsx`** via React hooks — no external state library. Picks are persisted to both `localStorage` and a URL query param (`?s=base64(JSON)`) for sharing.

## Key Files

| File | Role |
|------|------|
| `src/constants.js` | `INITIAL_STANDINGS` (Feb 22 base), `REMAINING_GAMES` (G1–G10), `NET_RANKINGS` |
| `src/data/results.csv` | Completed game results — user-editable, format: `away,home,winner` |
| `src/utils/tiebreaker.js` | Full MVC tiebreaker: H2H wins → NET ranking; recursive for 3+ tied teams |
| `src/utils/bracket.js` | `computeBracketSlots()` and `clearDownstream()` |
| `src/components/bracket/ArchMadnessBracket.jsx` | Absolute-positioned bracket with SVG connector lines |

## Bracket Format

11 teams, 4 rounds (seeds 1–5 get first-round byes):

```
R1A: (6) v (11) → QF3-B    R1B: (7) v (10) → QF2-B    R1C: (8) v (9) → QF1-B
QF1: (1) v R1C-winner       QF2: (4) v R1B-winner
QF3: (2) v R1A-winner       QF4: (3) v (5)
SF1: QF1w v QF2w            SF2: QF3w v QF4w
F:   SF1w v SF2w
```

## Bracket Layout System

`ArchMadnessBracket.jsx` uses **absolute positioning** with pixel constants:

- `GH=69` (game height), `GG=20` (gap within half), `HG=44` (gap between halves), `CG=28` (col gap), `CW=160` (col width)
- SVG overlay draws connector lines using analytically computed M/H/V paths
- Total canvas: 912×~390px; responsive via outer scroll container

When modifying bracket layout, adjust the Y/X position constants directly — all connector geometry is derived from them.

## Adding Completed Games

Edit `src/data/results.csv`. Each row: `away_team,home_team,winner_team`. Team names must exactly match those in `TEAMS` in `constants.js`.

## Deployment Notes

- `homepage` in `package.json` and `base` in `vite.config.js` must match the GitHub Pages URL path.
- Node 18.16.1 is installed; Vite 5 works fine (only Vite 7+ requires Node 20+).
- Deploy: `npm run deploy` from `mvc-simulator/`.
