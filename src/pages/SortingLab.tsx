import { useMemo, useState, type CSSProperties } from 'react';
import { ExplainPanel } from '../components/ExplainPanel';
import { Panel, SectionHeading, Stat } from '../components/Hud';
import { PlaybackControls } from '../components/PlaybackControls';
import { generateArray, replaySort, traceSort, type SortKind } from '../algorithms/sorting';
import { EXPLANATIONS } from '../data/explanations';
import { useEventPlayback } from '../hooks/useEventPlayback';
import { clamp } from '../utils/geo';
import './sorting.css';

const ALGORITHMS: SortKind[] = ['bubble', 'selection', 'insertion', 'merge', 'quick'];

export function SortingLab() {
  const [kind, setKind] = useState<SortKind>('bubble');
  const [size, setSize] = useState(40);
  const [initial, setInitial] = useState<number[]>(() => generateArray(40));
  const trace = useMemo(() => traceSort(kind, initial), [kind, initial]);
  const playback = useEventPlayback(trace.events.length, 80);
  const frame = useMemo(() => replaySort(initial, trace.events, playback.cursor), [initial, trace.events, playback.cursor]);

  const live = useMemo(() => {
    const slice = trace.events.slice(0, playback.cursor);
    return {
      comparisons: slice.filter((e) => e.type === 'compare' || e.type === 'compare-key').length,
      swaps: slice.filter((e) => e.type === 'swap').length,
      writes: slice.filter((e) => e.type === 'write').length,
    };
  }, [trace.events, playback.cursor]);

  const regenerate = () => {
    setInitial(generateArray(size));
    playback.seek(0);
  };

  const changeSize = (value: number) => {
    const next = clamp(value, 10, 90);
    setSize(next);
    setInitial(generateArray(next));
    playback.seek(0);
  };

  const info = EXPLANATIONS[kind];
  const sorted = trace.events.length > 0 && playback.cursor === trace.events.length;

  return (
    <div className="sorting lab">
      <aside className="sorting__panel lab__panel">
        <SectionHeading
          index="03"
          title="Sorting Lab"
          subtitle="Five sorts. One array. Every comparison visible."
          tone="plum"
        />

        <Panel title="Control deck" code="SORT" tone="plum" dark>
          <label className="hud-label" htmlFor="algorithm-select">Algorithm</label>
          <select
            id="algorithm-select"
            className="field"
            value={kind}
            onChange={(e) => { setKind(e.target.value as SortKind); playback.seek(0); }}
          >
            {ALGORITHMS.map((name) => <option key={name} value={name}>{name.toUpperCase()} SORT</option>)}
          </select>

          <label className="hud-label sorting__size-label" htmlFor="size-range">Array size · {size}</label>
          <input
            id="size-range"
            className="range"
            type="range"
            min={10}
            max={90}
            value={size}
            onChange={(e) => changeSize(Number(e.target.value))}
            aria-label="Array size"
            style={{ '--progress': `${((size - 10) / 80) * 100}%` } as CSSProperties}
          />

          <div className="sorting__actions">
            <button className="btn btn--gold" onClick={regenerate}>Generate new array</button>
          </div>

          <div className="sorting__complexity">
            <div><span className="hud-label">Time</span><strong className="mono">{info.time}</strong></div>
            <div><span className="hud-label">Space</span><strong className="mono">{info.space}</strong></div>
          </div>
        </Panel>

        <Panel title="Playback" code={`${trace.events.length} EVENTS`} tone="saffron" dark>
          <PlaybackControls api={playback} length={trace.events.length} />
        </Panel>

        <ExplainPanel id={kind} />
      </aside>

      <main className="sorting__stage lab__stage">
        <div className="sorting__stage-head mono">
          <span>ARRAY VISUALISATION · {kind.toUpperCase()}</span>
          <span className={sorted ? 'sorting__sorted' : ''}>{sorted ? 'SORTED' : 'IN PROGRESS'}</span>
        </div>

        <div className="sorting__bars" role="img" aria-label={`Array of ${size} values being sorted with ${kind} sort`}>
          {frame.values.map((value, index) => {
            const active = frame.active.includes(index);
            const done = frame.sorted[index];
            const className = `sort-bar ${done ? 'sort-bar--done' : active ? 'sort-bar--active' : ''}`;
            return (
              <div className="sort-bar-slot" key={index}>
                <div className={className} style={{ '--h': value / 100 } as CSSProperties} />
              </div>
            );
          })}
        </div>

        <div className="sorting__stats">
          <div className="stat-grid stat-grid--5">
            <Stat label="Comparisons" value={live.comparisons.toLocaleString()} tone="saffron" />
            <Stat label="Swaps" value={live.swaps.toLocaleString()} />
            <Stat label="Writes" value={live.writes.toLocaleString()} />
            <Stat label="Execution" value={`${trace.elapsedMs.toFixed(2)} ms`} tone="moss" />
            <Stat label="Events" value={`${playback.cursor}/${trace.events.length}`} />
          </div>
          <div className="sorting__legend mono" aria-label="Bar colour legend">
            <span><i className="sorting__swatch sorting__swatch--active" />COMPARING</span>
            <span><i className="sorting__swatch sorting__swatch--done" />SORTED</span>
            <span><i className="sorting__swatch sorting__swatch--idle" />UNSORTED</span>
          </div>
        </div>
      </main>
    </div>
  );
}
