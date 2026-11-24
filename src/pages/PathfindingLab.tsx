import { useMemo, useState, type CSSProperties } from 'react';
import { Panel, SectionHeading, Stat } from '../components/Hud';
import { ExplainPanel } from '../components/ExplainPanel';
import { PlaybackControls } from '../components/PlaybackControls';
import {
  COLS,
  ROWS,
  PATH_ALGORITHMS,
  generateSolvableWalls,
  hasRoute,
  replayPath,
  tracePath,
  type PathKind,
  type WallField,
} from '../algorithms/pathfinding';
import { useEventPlayback } from '../hooks/useEventPlayback';
import './pathfinding.css';

type Tool = 'start' | 'goal';

const START = 3 * COLS + 3;
const GOAL = 10 * COLS + 20;

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'start', label: 'Move start' },
  { id: 'goal', label: 'Move target' },
];

export function PathfindingLab() {
  const [algorithm, setAlgorithm] = useState<PathKind>('astar');
  const [start, setStart] = useState(START);
  const [goal, setGoal] = useState(GOAL);
  const [tool, setTool] = useState<Tool>('start');
  const [field, setField] = useState<WallField>(() => generateSolvableWalls(COLS, ROWS, START, GOAL, 2026));

  const walls = field.walls;
  const grid = useMemo(() => ({ cols: COLS, rows: ROWS, walls, start, goal }), [walls, start, goal]);
  const trace = useMemo(() => tracePath(grid, algorithm), [grid, algorithm]);
  const playback = useEventPlayback(trace.events.length, 60);
  const frame = useMemo(() => replayPath(trace.events, playback.cursor), [trace.events, playback.cursor]);
  const pathSet = useMemo(() => new Set(frame.path), [frame.path]);
  const selected = PATH_ALGORITHMS.find((item) => item.id === algorithm)!;

  const regenerate = (seed = Date.now()) => {
    setField(generateSolvableWalls(COLS, ROWS, start, goal, seed));
    playback.reset();
  };

  const applyCell = (cell: number) => {
    if (walls.has(cell) || cell === start || cell === goal) return;
    const nextStart = tool === 'start' ? cell : start;
    const nextGoal = tool === 'goal' ? cell : goal;
    const moved = { cols: COLS, rows: ROWS, walls, start: nextStart, goal: nextGoal };
    if (!hasRoute(moved)) setField(generateSolvableWalls(COLS, ROWS, nextStart, nextGoal));
    if (tool === 'start') setStart(cell);
    else setGoal(cell);
    playback.reset();
  };

  const status = frame.found !== null
    ? frame.found ? 'TARGET REACHED' : 'NO ROUTE · TARGET WALLED OFF'
    : playback.cursor > 0 ? 'SEARCHING…' : 'READY · PLAY THE SEARCH';

  return (
    <div className="pf lab">
      <aside className="pf__panel lab__panel">
        <SectionHeading
          index="01"
          title="Pathfinding Lab"
          subtitle="Generate verified walls, move the endpoints, then watch three different searches decide where to go next."
          tone="moss"
        />

        <Panel title="Control deck" code={selected.label} tone="moss" dark>
          <label className="hud-label" htmlFor="path-algorithm">Algorithm</label>
          <select
            id="path-algorithm"
            className="field"
            value={algorithm}
            onChange={(event) => { setAlgorithm(event.target.value as PathKind); playback.reset(); }}
          >
            {PATH_ALGORITHMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <p className="pf__hint mono">{selected.note} · every step is computed locally.</p>

          <button className="btn btn--primary pf__generate" onClick={() => regenerate()}>
            Generate random walls
          </button>
          <p className="pf__hint mono">
            {field.fallback ? 'Safe fallback used · ' : ''}
            Solvable in {field.attempts} {field.attempts === 1 ? 'attempt' : 'attempts'} · {walls.size} walls.
          </p>

          <label className="hud-label">Endpoint tool</label>
          <div className="pf__tools" role="group" aria-label="Endpoint editing tool">
            {TOOLS.map((item) => (
              <button
                key={item.id}
                className={`btn ${tool === item.id ? 'btn--gold' : 'btn--quiet'}`}
                onClick={() => setTool(item.id)}
                aria-pressed={tool === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="pf__hint mono">Pick a tool, then click any open cell. The route is re-verified after every move.</p>
        </Panel>

        <Panel title="Playback" code={`${trace.events.length} STEPS`} tone="saffron" dark>
          <PlaybackControls api={playback} length={trace.events.length} />
        </Panel>

        <ExplainPanel id={algorithm} />
      </aside>

      <main className="pf__stage lab__stage">
        <div className="pf__stage-head mono">
          <span>{selected.label} · 4-WAY GRID</span>
          <span className={frame.found ? 'pf__found' : ''}>{status}</span>
        </div>

        <div className="pf__grid" style={{ '--cols': COLS } as CSSProperties} role="grid" aria-label="Pathfinding grid">
          {Array.from({ length: COLS * ROWS }, (_, cell) => {
            const isStart = cell === start;
            const isGoal = cell === goal;
            const isWall = walls.has(cell);
            const classes = [
              'pf-cell',
              isWall && 'pf-cell--wall',
              isStart && 'pf-cell--start',
              isGoal && 'pf-cell--goal',
              !isWall && !isStart && !isGoal && frame.open.has(cell) && 'pf-cell--open',
              !isWall && !isStart && !isGoal && frame.closed.has(cell) && 'pf-cell--closed',
              !isWall && frame.current === cell && 'pf-cell--current',
              pathSet.has(cell) && 'pf-cell--path',
            ].filter(Boolean).join(' ');
            const score = frame.score.get(cell);
            return (
              <button
                type="button"
                className={classes}
                key={cell}
                onClick={() => applyCell(cell)}
                aria-label={`Row ${Math.floor(cell / COLS) + 1}, column ${(cell % COLS) + 1}${isWall ? ', wall' : ''}${isStart ? ', start' : ''}${isGoal ? ', target' : ''}`}
                title={score && !isWall ? `g ${score.g} · f ${score.f}` : undefined}
              >
                {isStart ? 'S' : isGoal ? 'T' : ''}
              </button>
            );
          })}
        </div>

        <div className="pf__legend mono" aria-label="Grid colour legend">
          <span><i className="pf__swatch pf__swatch--open" />FRONTIER</span>
          <span><i className="pf__swatch pf__swatch--closed" />VISITED</span>
          <span><i className="pf__swatch pf__swatch--path" />PATH</span>
          <span><i className="pf__swatch pf__swatch--wall" />WALL</span>
        </div>

        <div className="stat-grid stat-grid--5">
          <Stat label="Visited" value={frame.closed.size} tone="moss" />
          <Stat label="Frontier" value={frame.open.size} tone="saffron" />
          <Stat label="Path length" value={frame.path.length ? frame.path.length - 1 : '—'} />
          <Stat label="Cost" value={frame.path.length ? frame.path.length - 1 : '—'} />
          <Stat label="Walls" value={walls.size} />
        </div>
      </main>
    </div>
  );
}
