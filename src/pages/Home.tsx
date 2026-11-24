import type { PageId } from '../components/Nav';
import './home.css';

const MODULES: { id: PageId; code: string; name: string; text: string; tag: string }[] = [
  {
    id: 'pathfinding',
    code: '01',
    name: 'Pathfinding Lab',
    text: 'Generate solvable walls, move the endpoints, and compare A*, BFS and Dijkstra one cell at a time.',
    tag: 'A* · BFS · DIJKSTRA',
  },
  {
    id: 'sorting',
    code: '02',
    name: 'Sorting Lab',
    text: 'Five classic sorting algorithms, replayed as comparison bars with accurate live statistics.',
    tag: '5 ALGORITHMS',
  },
  {
    id: 'stackqueue',
    code: '03',
    name: 'Stack & Queue',
    text: 'Push, pop, enqueue and dequeue against a live structure, with every value sliding in and out.',
    tag: 'LIFO · FIFO',
  },
];

export function Home({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__copy">
          <p className="home__eyebrow mono">
            <span className="home__eyebrow-rule" /> FIELD GUIDE · ALGORITHMS IN MOTION
          </p>
          <h1 className="home__title">
            Watch the<br /><em>logic move.</em>
          </h1>
          <p className="home__lead">
            DSA Guru turns algorithms into things you can touch. Build a maze, run a search,
            replay a sort, and inspect every decision without a server in sight.
          </p>
          <div className="home__actions">
            <button className="btn btn--primary" onClick={() => onNavigate('pathfinding')}>
              Open Pathfinding Lab
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="btn btn--quiet" onClick={() => onNavigate('sorting')}>Explore Sorting Lab</button>
          </div>
          <p className="home__note mono">No backend · no API keys · every lab runs in your browser</p>
        </div>

        <aside className="home__ledger">
          <div className="home__ledger-head mono">
            <span>SYSTEM LEDGER</span>
            <span className="home__online"><i /> LOCAL</span>
          </div>
          <div className="home__figure">
            <strong>03</strong>
            <span>INTERACTIVE LABS</span>
          </div>
          <svg className="home__route-motif" viewBox="0 0 320 54" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 44 C 58 44, 62 12, 120 12 S 198 46, 246 46 S 290 18, 318 18" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="120" cy="12" r="4" />
            <circle cx="246" cy="46" r="4" />
            <circle cx="318" cy="18" r="4" />
          </svg>
          <dl className="home__ledger-stats mono">
            <div><dt>LABS</dt><dd>03</dd></div>
            <div><dt>ENGINE</dt><dd>IN-BROWSER</dd></div>
            <div><dt>NETWORK</dt><dd>NOT REQUIRED</dd></div>
          </dl>
        </aside>
      </section>

      <section className="home__index" aria-labelledby="index-title">
        <div className="home__index-head">
          <h2 id="index-title" className="mono">THE INDEX</h2>
          <p>Three labs, one field guide.</p>
        </div>
        <ol className="home__modules">
          {MODULES.map((module) => (
            <li key={module.id}>
              <button className="home__module" onClick={() => onNavigate(module.id)}>
                <span className="home__module-code mono">{module.code}</span>
                <span className="home__module-body">
                  <strong>{module.name}</strong>
                  <span>{module.text}</span>
                </span>
                <span className="home__module-tag mono">{module.tag}</span>
                <span className="home__module-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="home__method" aria-label="How it works">
        <p className="mono">01 — BUILD A PROBLEM</p>
        <p className="mono">02 — RUN THE ALGORITHM</p>
        <p className="mono">03 — WATCH EVERY STEP</p>
      </section>
    </div>
  );
}
