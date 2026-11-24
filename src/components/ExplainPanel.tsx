import { EXPLANATIONS } from '../data/explanations';
import './explain.css';

export function ExplainPanel({ id, defaultOpen = false }: { id: string; defaultOpen?: boolean }) {
  const info = EXPLANATIONS[id];
  if (!info) return null;

  return (
    <details className="explain" open={defaultOpen}>
      <summary className="explain__summary">
        <span className="explain__tag mono">FIELD NOTES</span>
        <span className="explain__title">{info.title}</span>
        <span className="explain__toggle mono" aria-hidden="true" />
      </summary>
      <div className="explain__body">
        <p className="explain__lead">{info.what}</p>
        <h4>How it works</h4>
        <ol>
          {info.how.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <h4>Why it matters</h4>
        <p>{info.why}</p>
        <h4>Real-world use</h4>
        <div className="explain__chips">
          {info.applications.map((app) => <span key={app}>{app}</span>)}
        </div>
        <div className="explain__complexity">
          <div><span className="mono">TIME</span><strong>{info.time}</strong></div>
          <div><span className="mono">SPACE</span><strong>{info.space}</strong></div>
        </div>
      </div>
    </details>
  );
}
