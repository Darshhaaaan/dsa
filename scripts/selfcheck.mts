import assert from 'node:assert/strict';
import {
  COLS,
  ROWS,
  generateSolvableWalls,
  replayPath,
  shortestDistance,
  tracePath,
  type PathKind,
} from '../src/algorithms/pathfinding.ts';
import { generateArray, replaySort, traceSort, type SortKind } from '../src/algorithms/sorting.ts';

const START = 3 * COLS + 3;
const GOAL = 10 * COLS + 20;
const KINDS: PathKind[] = ['astar', 'bfs', 'dijkstra'];
const SORTS: SortKind[] = ['bubble', 'selection', 'insertion', 'merge', 'quick'];

function pathCost(events: ReturnType<typeof tracePath>['events']): number {
  return events.filter((event) => event.type === 'path').length - 1;
}

let grids = 0;
for (let seed = 0; seed < 200; seed++) {
  const field = generateSolvableWalls(COLS, ROWS, START, GOAL, seed);
  const grid = { cols: COLS, rows: ROWS, walls: field.walls, start: START, goal: GOAL };
  assert.ok(field.attempts <= 60, 'generation respects its retry limit');
  assert.ok(shortestDistance(grid) >= 0, `grid ${seed} is solvable`);

  const expected = shortestDistance(grid);
  for (const kind of KINDS) {
    const trace = tracePath(grid, kind);
    assert.equal(trace.found, true, `${kind} finds a route on grid ${seed}`);
    assert.equal(pathCost(trace.events), expected, `${kind} is optimal on grid ${seed}`);
    assert.equal(replayPath(trace.events, trace.events.length).path.length - 1, expected);
  }
  grids++;
}

const sealed = new Set<number>();
for (const offset of [-1, 1, -COLS, COLS]) sealed.add(GOAL + offset);
for (const kind of KINDS) {
  assert.equal(tracePath({ cols: COLS, rows: ROWS, walls: sealed, start: START, goal: GOAL }, kind).found, false);
}

let sorts = 0;
for (const size of [10, 25, 40]) {
  for (let seed = 1; seed <= 5; seed++) {
    const input = generateArray(size, seed * 7919);
    for (const kind of SORTS) {
      const trace = traceSort(kind, input);
      const frame = replaySort(input, trace.events, trace.events.length);
      assert.deepEqual(frame.values, [...input].sort((a, b) => a - b), `${kind} sorts size ${size}`);
      assert.ok(trace.comparisons > 0, `${kind} counts comparisons`);
      assert.ok(frame.sorted.every(Boolean), `${kind} marks every value sorted`);
      sorts++;
    }
  }
}

console.log(`selfcheck passed: ${grids} pathfinding grids, 3 sealed-goal traces, ${sorts} sort traces`);
