# DSA Guru — Frontend

A self-contained, interactive field guide to algorithms. All traces, statistics,
wall generation and playback run locally in the browser. There is no backend,
API base URL, `.env` file or network dependency.

## Run it

Prerequisites: Node 22+ (`npm run selfcheck` uses Node's TypeScript strip support).

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

Production build:

```bash
npm run build
npm run preview
```

## What is here

- **Overview** — an index of the three labs and the local-first system ledger.
- **Pathfinding Lab** — A*, BFS and Dijkstra on a 4-connected grid. Generate
  random walls with bounded retries and BFS reachability checks, move the
  endpoints, then replay every frontier, visit and path decision.
- **Sorting Lab** — bubble, selection, insertion, merge and quick sort traces
  generated in the browser with accurate live comparison/swap/write counts.
- **Stack & Queue** — push/pop and enqueue/dequeue on a live animated structure
  with working `IS EMPTY`, `SIZE`, `PEEK` (stack only) and `IS FULL` readouts.

Every lab shares `useEventPlayback` and `PlaybackControls`, so play, pause,
resume, step, reset, replay, seek and speed behave consistently.

## Local algorithm modules

Algorithms live outside React and can be tested independently:

- `src/algorithms/pathfinding.ts` — A*, BFS, Dijkstra, BFS solvability checks,
  bounded random-wall generation with a verified safe fallback, and trace
  replay.
- `src/algorithms/sorting.ts` — trace generation and replay for five sorts.
- `scripts/selfcheck.mts` — assert-based checks for optimality, solvability,
  sealed-goal handling and sorted final arrays.

```bash
npm run selfcheck
```

## Themes

The header switches between **Warm Cherry**
(`#f2f7f9` / `#89c9c9` / `#dafc92` / `#02261e`) and **Playful Orchid**
(`#EFEFEF` / `#EAA2E5` / `#E8F9A2` / `#5F0032`). The choice is stored in
`localStorage` under `dsa-guru-theme` and applied before React mounts. All
colours come from `src/styles/tokens.css`.

The intro plays once per browser tab and never replays on navigation;
reduced-motion users skip it.

## Typography

The identity uses OFL-licensed **Syne** (display), **Fraunces** (editorial
accent), **Space Grotesk** (UI/body) and **IBM Plex Mono** (data labels),
installed via `@fontsource`.
