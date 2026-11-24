import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Intro } from './components/Intro';
import { Nav, type PageId } from './components/Nav';
import { useReducedMotion } from './hooks/useReducedMotion';
import './styles/app.css';

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const PathfindingLab = lazy(() => import('./pages/PathfindingLab').then((m) => ({ default: m.PathfindingLab })));
const SortingLab = lazy(() => import('./pages/SortingLab').then((m) => ({ default: m.SortingLab })));
const StackQueueLab = lazy(() => import('./pages/StackQueueLab').then((m) => ({ default: m.StackQueueLab })));

const INTRO_KEY = 'dsa-guru-intro-complete';

export default function App() {
  const reduced = useReducedMotion();
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem(INTRO_KEY) === '1' || reduced);
  const [page, setPage] = useState<PageId>('home');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  const completeIntro = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    setIntroDone(true);
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#stage">Skip to content</a>
      <Nav page={page} onNavigate={setPage} />

      <main id="stage" key={page} className="app__stage">
        <Suspense fallback={<div className="app__loading mono"><span className="app__loading-dot" /> Loading module…</div>}>
          {page === 'home' && <Home onNavigate={setPage} />}
          {page === 'pathfinding' && <PathfindingLab />}
          {page === 'sorting' && <SortingLab />}
          {page === 'stackqueue' && <StackQueueLab />}
        </Suspense>
      </main>

      <footer className="app__footer mono">
        <span className="app__footer-brand">DSA GURU <i>·</i> ALGORITHMS IN MOTION</span>
        <span>ALL LABS RUN IN YOUR BROWSER · NO NETWORK REQUIRED</span>
        <span>THREE LABS · ONE FIELD GUIDE</span>
      </footer>

      {!introDone && <Intro reduced={reduced} onEnter={completeIntro} />}
    </div>
  );
}
