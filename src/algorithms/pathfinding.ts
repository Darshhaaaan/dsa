/** Local, independently testable grid search: A*, BFS and Dijkstra. */

export const COLS = 24;
export const ROWS = 14;

export type PathKind = 'astar' | 'bfs' | 'dijkstra';

export const PATH_ALGORITHMS: { id: PathKind; label: string; note: string }[] = [
  { id: 'astar', label: 'A* · MANHATTAN', note: 'Heuristic-guided search' },
  { id: 'bfs', label: 'BREADTH-FIRST', note: 'Layer-by-layer search' },
  { id: 'dijkstra', label: 'DIJKSTRA', note: 'Uniform-cost search' },
];

export interface PathGrid {
  cols: number;
  rows: number;
  walls: Set<number>;
  start: number;
  goal: number;
}

export type PathEvent =
  | { type: 'frontier'; cell: number; g: number; f: number }
  | { type: 'visit'; cell: number; g: number; f: number }
  | { type: 'path'; cell: number }
  | { type: 'done'; found: boolean };

export interface PathTrace {
  events: PathEvent[];
  found: boolean;
}

export interface WallField {
  walls: Set<number>;
  attempts: number;
  fallback: boolean;
}

interface HeapItem {
  cell: number;
  g: number;
  priority: number;
  seq: number;
}

class MinHeap {
  private items: HeapItem[] = [];
  private seq = 0;

  get size() { return this.items.length; }

  private less(a: HeapItem, b: HeapItem) {
    return a.priority !== b.priority ? a.priority < b.priority : a.seq < b.seq;
  }

  push(cell: number, g: number, priority: number) {
    const item = { cell, g, priority, seq: this.seq++ };
    let i = this.items.length;
    this.items.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(item, this.items[parent])) break;
      this.items[i] = this.items[parent];
      i = parent;
    }
    this.items[i] = item;
  }

  pop(): HeapItem {
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = left + 1;
        let best = i;
        if (left < this.items.length && this.less(this.items[left], this.items[best])) best = left;
        if (right < this.items.length && this.less(this.items[right], this.items[best])) best = right;
        if (best === i) break;
        [this.items[i], this.items[best]] = [this.items[best], this.items[i]];
        i = best;
      }
    }
    return top;
  }
}

function neighbours(cell: number, cols: number, rows: number): number[] {
  const col = cell % cols;
  const row = Math.floor(cell / cols);
  return [
    col > 0 ? cell - 1 : -1,
    col < cols - 1 ? cell + 1 : -1,
    row > 0 ? cell - cols : -1,
    row < rows - 1 ? cell + cols : -1,
  ].filter((next) => next >= 0);
}

export function tracePath(grid: PathGrid, kind: PathKind = 'astar'): PathTrace {
  const { cols, rows, walls, start, goal } = grid;
  const total = cols * rows;
  const g = new Float64Array(total).fill(Infinity);
  const cameFrom = new Int32Array(total).fill(-1);
  const closed = new Uint8Array(total);
  const events: PathEvent[] = [];
  const heuristic = (cell: number) =>
    Math.abs((cell % cols) - (goal % cols)) + Math.abs(Math.floor(cell / cols) - Math.floor(goal / cols));
  const priorityFor = (cell: number, cost: number) => (kind === 'astar' ? cost + heuristic(cell) : cost);

  g[start] = 0;
  events.push({ type: 'frontier', cell: start, g: 0, f: priorityFor(start, 0) });

  let found = false;
  let current = start;

  if (kind === 'bfs') {
    const queue = [start];
    for (let head = 0; head < queue.length; head++) {
      current = queue[head];
      if (closed[current]) continue;
      closed[current] = 1;
      events.push({ type: 'visit', cell: current, g: g[current], f: 0 });

      if (current === goal) { found = true; break; }

      for (const next of neighbours(current, cols, rows)) {
        if (closed[next] || walls.has(next) || g[next] !== Infinity) continue;
        cameFrom[next] = current;
        g[next] = g[current] + 1;
        queue.push(next);
        events.push({ type: 'frontier', cell: next, g: g[next], f: 0 });
      }
    }
  } else {
    const open = new MinHeap();
    open.push(start, 0, priorityFor(start, 0));
    while (open.size) {
      const item = open.pop();
      current = item.cell;
      if (closed[current] || item.g !== g[current]) continue;
      closed[current] = 1;
      events.push({ type: 'visit', cell: current, g: item.g, f: item.priority });

      if (current === goal) { found = true; break; }

      for (const next of neighbours(current, cols, rows)) {
        if (closed[next] || walls.has(next)) continue;
        const tentative = g[current] + 1;
        if (tentative >= g[next]) continue;
        cameFrom[next] = current;
        g[next] = tentative;
        const priority = priorityFor(next, tentative);
        open.push(next, tentative, priority);
        events.push({ type: 'frontier', cell: next, g: tentative, f: priority });
      }
    }
  }

  if (found) {
    let cell = goal;
    while (cell !== -1) {
      events.push({ type: 'path', cell });
      cell = cameFrom[cell];
    }
  }
  events.push({ type: 'done', found });
  return { events, found };
}

/** BFS distance used both for solvability checks and optimality self-checks. */
export function shortestDistance(grid: PathGrid): number {
  const { cols, rows, walls, start, goal } = grid;
  const seen = new Uint8Array(cols * rows);
  const distance = new Int32Array(cols * rows).fill(-1);
  const queue = [start];
  seen[start] = 1;
  distance[start] = 0;
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head];
    if (cell === goal) return distance[cell];
    for (const next of neighbours(cell, cols, rows)) {
      if (seen[next] || walls.has(next)) continue;
      seen[next] = 1;
      distance[next] = distance[cell] + 1;
      queue.push(next);
    }
  }
  return -1;
}

export function hasRoute(grid: PathGrid): boolean {
  return shortestDistance(grid) >= 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generates wall clusters, retries up to 60 times, and falls back to a verified sparse field. */
export function generateSolvableWalls(
  cols: number,
  rows: number,
  start: number,
  goal: number,
  seed = Date.now(),
): WallField {
  const manhattan = Math.abs((start % cols) - (goal % cols)) + Math.abs(Math.floor(start / cols) - Math.floor(goal / cols));
  const interesting = manhattan + 5;
  const attemptsAllowed = 60;
  let best = new Set<number>();
  let bestLength = -1;

  for (let attempt = 0; attempt < attemptsAllowed; attempt++) {
    const random = mulberry32(seed + attempt * 7919);
    const walls = new Set<number>();
    const add = (col: number, row: number) => {
      if (col < 1 || col >= cols - 1 || row < 1 || row >= rows - 1) return;
      const cell = row * cols + col;
      if (cell !== start && cell !== goal) walls.add(cell);
    };

    for (let stroke = 0; stroke < Math.round(cols * rows * 0.055); stroke++) {
      const col = 1 + Math.floor(random() * (cols - 2));
      const row = 1 + Math.floor(random() * (rows - 2));
      const vertical = random() < 0.5;
      const length = 2 + Math.floor(random() * 4);
      for (let step = 0; step < length; step++) {
        add(col + (vertical ? 0 : step), row + (vertical ? step : 0));
      }
    }
    for (let dot = 0; dot < Math.round(cols * rows * 0.05); dot++) {
      add(1 + Math.floor(random() * (cols - 2)), 1 + Math.floor(random() * (rows - 2)));
    }

    const length = shortestDistance({ cols, rows, walls, start, goal });
    if (length < 0) continue;
    if (length >= interesting) return { walls, attempts: attempt + 1, fallback: false };
    if (length > bestLength) {
      best = walls;
      bestLength = length;
    }
  }

  if (bestLength > manhattan) return { walls: best, attempts: attemptsAllowed, fallback: false };

  const fallback = new Set<number>();
  for (const col of [6, 12, 18]) {
    const gap = Math.floor(rows / 2) + (col === 12 ? 1 : 0);
    for (let row = 1; row < rows - 1; row++) if (row !== gap) fallback.add(row * cols + col);
  }
  fallback.delete(start);
  fallback.delete(goal);
  if (!hasRoute({ cols, rows, walls: fallback, start, goal })) fallback.clear();
  return { walls: fallback, attempts: attemptsAllowed, fallback: true };
}

export interface PathFrame {
  open: Set<number>;
  closed: Set<number>;
  path: number[];
  current: number | null;
  score: Map<number, { g: number; f: number }>;
  found: boolean | null;
}

export function replayPath(events: PathEvent[], cursor: number): PathFrame {
  const frame: PathFrame = {
    open: new Set(),
    closed: new Set(),
    path: [],
    current: null,
    score: new Map(),
    found: null,
  };
  for (let i = 0; i < Math.min(cursor, events.length); i++) {
    const event = events[i];
    if (event.type === 'frontier') {
      frame.open.add(event.cell);
      frame.score.set(event.cell, { g: event.g, f: event.f });
    } else if (event.type === 'visit') {
      frame.open.delete(event.cell);
      frame.closed.add(event.cell);
      frame.current = event.cell;
      frame.score.set(event.cell, { g: event.g, f: event.f });
    } else if (event.type === 'path') {
      frame.path.unshift(event.cell);
    } else {
      frame.current = null;
      frame.found = event.found;
    }
  }
  return frame;
}
