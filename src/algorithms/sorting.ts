export type SortEvent =
  | { type: 'compare'; i: number; j: number }
  | { type: 'compare-key'; i: number; value: number }
  | { type: 'swap'; i: number; j: number }
  | { type: 'write'; i: number; value: number }
  | { type: 'sorted'; i: number };

export type SortKind = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';

export interface SortTrace {
  events: SortEvent[];
  comparisons: number;
  swaps: number;
  writes: number;
  elapsedMs: number;
}

export function generateArray(size: number, seed = Date.now()): number[] {
  let state = seed >>> 0;
  const values: number[] = [];
  for (let i = 0; i < size; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    values.push(8 + Math.floor((state / 4294967296) * 92));
  }
  return values;
}

export function traceSort(kind: SortKind, input: number[]): SortTrace {
  const a = [...input];
  const events: SortEvent[] = [];
  let comparisons = 0;
  let swaps = 0;
  let writes = 0;
  const started = performance.now();

  const compare = (i: number, j: number) => {
    comparisons++;
    events.push({ type: 'compare', i, j });
    return a[i] > a[j];
  };
  const swap = (i: number, j: number) => {
    if (i === j) return;
    swaps++;
    [a[i], a[j]] = [a[j], a[i]];
    events.push({ type: 'swap', i, j });
  };
  const write = (i: number, value: number) => {
    writes++;
    a[i] = value;
    events.push({ type: 'write', i, value });
  };
  const sorted = (i: number) => events.push({ type: 'sorted', i });

  switch (kind) {
    case 'bubble': {
      for (let end = a.length - 1; end > 0; end--) {
        let moved = false;
        for (let i = 0; i < end; i++) {
          if (compare(i, i + 1)) {
            swap(i, i + 1);
            moved = true;
          }
        }
        sorted(end);
        if (!moved) {
          for (let i = end - 1; i >= 0; i--) sorted(i);
          break;
        }
      }
      if (a.length) sorted(0);
      break;
    }
    case 'selection': {
      for (let i = 0; i < a.length - 1; i++) {
        let min = i;
        for (let j = i + 1; j < a.length; j++) if (compare(min, j)) min = j;
        swap(i, min);
        sorted(i);
      }
      if (a.length) sorted(a.length - 1);
      break;
    }
    case 'insertion': {
      for (let i = 1; i < a.length; i++) {
        const key = a[i];
        let j = i - 1;
        while (j >= 0) {
          comparisons++;
          events.push({ type: 'compare-key', i: j, value: key });
          if (a[j] <= key) break;
          write(j + 1, a[j]);
          j--;
        }
        write(j + 1, key);
      }
      for (let i = 0; i < a.length; i++) sorted(i);
      break;
    }
    case 'merge': {
      const merge = (left: number, mid: number, right: number) => {
        const temp: number[] = [];
        let i = left;
        let j = mid;
        while (i < mid && j < right) {
          comparisons++;
          events.push({ type: 'compare', i, j });
          temp.push(a[i] <= a[j] ? a[i++] : a[j++]);
        }
        while (i < mid) temp.push(a[i++]);
        while (j < right) temp.push(a[j++]);
        temp.forEach((value, offset) => write(left + offset, value));
      };
      const divide = (left: number, right: number) => {
        if (right - left < 2) return;
        const mid = Math.floor((left + right) / 2);
        divide(left, mid);
        divide(mid, right);
        merge(left, mid, right);
      };
      divide(0, a.length);
      for (let i = 0; i < a.length; i++) sorted(i);
      break;
    }
    case 'quick': {
      const partition = (low: number, high: number): number => {
        let store = low;
        for (let i = low; i < high; i++) {
          if (!compare(i, high)) swap(i, store++);
        }
        swap(store, high);
        return store;
      };
      const quick = (low: number, high: number) => {
        if (low >= high) {
          if (low === high) sorted(low);
          return;
        }
        const p = partition(low, high);
        sorted(p);
        quick(low, p - 1);
        quick(p + 1, high);
      };
      quick(0, a.length - 1);
      break;
    }
  }

  return { events, comparisons, swaps, writes, elapsedMs: Math.max(performance.now() - started, 0.01) };
}

export function replaySort(input: number[], events: SortEvent[], cursor: number): { values: number[]; sorted: boolean[]; active: number[] } {
  const values = [...input];
  const done = new Set<number>();
  let active: number[] = [];
  for (let i = 0; i < Math.min(cursor, events.length); i++) {
    const event = events[i];
    if (event.type === 'swap') {
      [values[event.i], values[event.j]] = [values[event.j], values[event.i]];
      active = [event.i, event.j];
    } else if (event.type === 'write') {
      values[event.i] = event.value;
      active = [event.i];
    } else if (event.type === 'compare' || event.type === 'compare-key') {
      active = event.type === 'compare' ? [event.i, event.j] : [event.i];
    } else {
      done.add(event.i);
    }
  }
  return { values, sorted: values.map((_, i) => done.has(i)), active };
}
