import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ExplainPanel } from '../components/ExplainPanel';
import { Panel, SectionHeading } from '../components/Hud';
import { clamp } from '../utils/geo';
import './stackqueue.css';

type Mode = 'stack' | 'queue';
type Item = { id: number; value: number };
type Answer = { label: string; value: string; ok: boolean | null };

const CAPACITY = 8;
const SEED = [42, 17, 88, 5];

export function StackQueueLab() {
  const [mode, setMode] = useState<Mode>('stack');
  const [items, setItems] = useState<Item[]>(() => SEED.map((value, i) => ({ id: i + 1, value })));
  const [value, setValue] = useState('23');
  const [leaving, setLeaving] = useState<{ item: Item; mode: Mode } | null>(null);
  const [focusId, setFocusId] = useState<number | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [status, setStatus] = useState('Seeded with four values. Pick an operation.');
  const nextId = useRef(SEED.length + 1);

  useEffect(() => {
    if (!answer) return;
    const timer = window.setTimeout(() => setAnswer(null), 2800);
    return () => window.clearTimeout(timer);
  }, [answer]);

  const isStack = mode === 'stack';
  const edge = items.length ? (isStack ? items[items.length - 1] : items[0]) : null;
  const front = edge?.value ?? null;

  const insert = () => {
    if (items.length >= CAPACITY) return;
    const parsed = Number.parseInt(value, 10);
    const next = Number.isFinite(parsed) ? clamp(parsed, -999, 999) : 1 + Math.floor(Math.random() * 99);
    setLeaving(null);
    setFocusId(null);
    setAnswer(null);
    setItems((prev) => [...prev, { id: nextId.current++, value: next }]);
    setStatus(`${isStack ? 'Pushed' : 'Enqueued'} ${next}.`);
  };

  const remove = () => {
    if (!items.length) return;
    const item = isStack ? items[items.length - 1] : items[0];
    setLeaving({ item, mode });
    setFocusId(null);
    setAnswer(null);
    setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    setStatus(`${isStack ? 'Popped' : 'Dequeued'} ${item.value}.`);
  };

  const inspect = (operation: 'empty' | 'size' | 'peek' | 'full') => {
    const empty = items.length === 0;
    const messages = {
      empty: `${isStack ? 'Stack' : 'Queue'} is ${empty ? 'empty' : 'not empty'}.`,
      size: `Size = ${items.length}.`,
      peek: empty
        ? `${isStack ? 'Stack' : 'Queue'} is empty; nothing to peek.`
        : `${isStack ? 'Top' : 'Front'} = ${front}.`,
      full: `${isStack ? 'Stack' : 'Queue'} is ${items.length >= CAPACITY ? 'full' : 'not full'}.`,
    };
    setFocusId(operation === 'peek' ? edge?.id ?? null : null);
    setAnswer(
      operation === 'empty'
        ? { label: 'IS EMPTY', value: empty ? 'TRUE' : 'FALSE', ok: empty }
        : operation === 'full'
          ? { label: 'IS FULL', value: items.length >= CAPACITY ? 'TRUE' : 'FALSE', ok: items.length >= CAPACITY }
          : operation === 'size'
            ? { label: 'SIZE', value: String(items.length), ok: null }
            : { label: 'PEEK · TOP', value: front === null ? 'EMPTY' : String(front), ok: null },
    );
    setStatus(messages[operation]);
  };

  const clear = () => {
    setLeaving(null);
    setFocusId(null);
    setAnswer(null);
    setItems([]);
    setStatus('Cleared.');
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setLeaving(null);
    setFocusId(null);
    setAnswer(null);
    setMode(next);
    setStatus(`Switched to ${next}.`);
  };

  return (
    <div className="sq lab">
      <aside className="sq__panel lab__panel">
        <SectionHeading
          index="04"
          title="Stack & Queue"
          subtitle="Two ways to line up data. Watch every entry and exit."
          tone="moss"
        />

        <Panel title="Control deck" code={isStack ? 'LIFO' : 'FIFO'} tone="moss" dark>
          <div className="sq__modes" role="group" aria-label="Data structure">
            <button className="btn btn--quiet" aria-pressed={isStack} onClick={() => switchMode('stack')}>STACK</button>
            <button className="btn btn--quiet" aria-pressed={!isStack} onClick={() => switchMode('queue')}>QUEUE</button>
          </div>

          <label className="hud-label" htmlFor="sq-value">Value</label>
          <input
            id="sq-value"
            className="field"
            type="number"
            value={value}
            min={-999}
            max={999}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insert(); }}
          />

          <div className="sq__actions">
            <button className="btn btn--primary" onClick={insert} disabled={items.length >= CAPACITY}>
              {isStack ? 'PUSH' : 'ENQUEUE'}
            </button>
            <button className="btn btn--gold" onClick={remove} disabled={items.length === 0}>
              {isStack ? 'POP' : 'DEQUEUE'}
            </button>
            <button className="btn btn--quiet" onClick={() => inspect('empty')}>IS EMPTY</button>
            <button className="btn btn--quiet" onClick={() => inspect('size')}>SIZE</button>
            {isStack && <button className="btn btn--quiet" onClick={() => inspect('peek')}>PEEK</button>}
            <button className="btn btn--quiet" onClick={() => inspect('full')}>IS FULL</button>
          </div>
          <p className="sq__status mono" role="status" aria-live="polite">{status}</p>
          <button className="btn btn--quiet sq__clear" onClick={clear} disabled={items.length === 0}>CLEAR ALL</button>
        </Panel>

        <ExplainPanel id={mode} />
      </aside>

      <main className="sq__stage lab__stage">
        <div className="sq__stage-head mono">
          <span>{isStack ? 'STACK · LAST IN FIRST OUT' : 'QUEUE · FIRST IN FIRST OUT'}</span>
          <span>{items.length}/{CAPACITY} SLOTS</span>
        </div>

        <div className={`sq__holder sq__holder--${mode}`} key={mode}>
          <div className={`sq__items sq__items--${mode}`} role="list" aria-label={`${mode} contents`}>
            {items.map((item, index) => {
              const edge = isStack ? index === items.length - 1 : index === 0;
              return (
                <div
                  className={`sq__item ${edge ? 'sq__item--edge' : ''} ${focusId === item.id ? 'sq__item--focus' : ''}`}
                  key={item.id}
                  role="listitem"
                  style={{ '--delay': `${index * 70}ms` } as CSSProperties}
                >
                  <span className="mono sq__index">{String(index).padStart(2, '0')}</span>
                  <strong className="mono">{item.value}</strong>
                  {edge && <span className="mono sq__tag">{isStack ? 'TOP' : 'FRONT'}</span>}
                  {!isStack && index === items.length - 1 && <span className="mono sq__tag sq__tag--rear">REAR</span>}
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="sq__empty mono" role="status">
                {isStack ? 'STACK EMPTY · PUSH TO BEGIN' : 'QUEUE EMPTY · ENQUEUE TO BEGIN'}
              </p>
            )}
          </div>

          {leaving?.mode === mode && (
            <div
              key={leaving.item.id}
              className={`sq__ghost sq__ghost--${mode}`}
              onAnimationEnd={() => setLeaving(null)}
              aria-hidden="true"
            >
              <strong className="mono">{leaving.item.value}</strong>
            </div>
          )}
        </div>
      </main>

      {answer && (
        <div
          className={`sq__answer sq__answer--${answer.ok === true ? 'true' : answer.ok === false ? 'false' : 'value'}`}
          role="status"
          aria-live="assertive"
        >
          <span className="mono sq__answer-label">{answer.label}</span>
          <strong className="mono sq__answer-value">{answer.value}</strong>
          <button className="sq__answer-close" onClick={() => setAnswer(null)} aria-label="Dismiss answer">×</button>
        </div>
      )}
    </div>
  );
}
