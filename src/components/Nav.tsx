import { useTheme } from '../hooks/useTheme';
import './nav.css';

export type PageId = 'home' | 'pathfinding' | 'sorting' | 'stackqueue';

const ITEMS: { id: PageId; label: string; short: string; code: string }[] = [
  { id: 'home', label: 'Overview', short: 'Home', code: '00' },
  { id: 'pathfinding', label: 'Pathfinding', short: 'Paths', code: '01' },
  { id: 'sorting', label: 'Sorting Lab', short: 'Sort', code: '02' },
  { id: 'stackqueue', label: 'Stack & Queue', short: 'Stack', code: '03' },
];

export function Nav({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="nav">
      <button className="nav__brand" onClick={() => onNavigate('home')} aria-label="DSA Guru — overview">
        <span className="nav__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 25L13 8l6 12 8-13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5" cy="25" r="2.4" fill="currentColor" stroke="none" />
            <circle cx="27" cy="7" r="2.4" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="nav__brand-text">
          <strong>DSA Guru</strong>
          <small className="mono">LOCAL ALGORITHM STUDIO</small>
        </span>
      </button>

      <nav className="nav__items" aria-label="Main navigation">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav__item ${page === item.id ? 'nav__item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={page === item.id ? 'page' : undefined}
            aria-label={item.label}
          >
            <span className="nav__code mono">{item.code}</span>
            <span className="nav__label-full">{item.label}</span>
            <span className="nav__label-short">{item.short}</span>
          </button>
        ))}
      </nav>

      <button
        className="nav__theme"
        onClick={toggle}
        aria-label={`Switch to ${theme === 'cherry' ? 'Playful Orchid' : 'Warm Cherry'} theme`}
        aria-pressed={theme === 'orchid'}
      >
        <span className="nav__theme-track" aria-hidden="true"><i /></span>
        <span className="mono">{theme === 'cherry' ? 'WARM CHERRY' : 'PLAYFUL ORCHID'}</span>
      </button>

      <div className="nav__signal mono" aria-hidden="true">
        <i /> 3 LABS · 0 DEPENDENCIES
      </div>
    </header>
  );
}
