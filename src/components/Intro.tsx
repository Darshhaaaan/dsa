import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './intro.css';

gsap.registerPlugin(useGSAP);

export function Intro({ reduced, onEnter }: { reduced: boolean; onEnter: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const onEnterRef = useRef(onEnter);
  const doneRef = useRef(false);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const exitTlRef = useRef<gsap.core.Timeline | null>(null);

  onEnterRef.current = onEnter;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onEnterRef.current();
  }, []);

  const leave = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    introTlRef.current?.kill();
    if (reduced) {
      onEnterRef.current();
      return;
    }
    exitTlRef.current = gsap.timeline({ onComplete: () => onEnterRef.current() })
      .to('.intro__inner', { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power2.in' }, 0)
      .to('.intro__route path', { strokeDashoffset: -900, duration: 0.55, ease: 'power2.in' }, 0)
      .to(rootRef.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.65, ease: 'power3.inOut' }, 0.2);
  }, [reduced]);

  useEffect(() => {
    enterRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') leave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leave]);

  useGSAP(
    () => {
      if (reduced) {
        finish();
        return;
      }
      introTlRef.current = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finish })
        .fromTo('.intro__route path',
          { strokeDashoffset: 900 },
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0)
        .fromTo('.intro__route circle',
          { scale: 0, transformOrigin: 'center', autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.22, ease: 'back.out(2)' }, 0.4)
        .fromTo('.intro__eyebrow', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.15)
        .fromTo('.intro__letter',
          { autoAlpha: 0, yPercent: 115, rotate: 4 },
          { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.075 }, 0.4)
        .fromTo('.intro__sub', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.15)
        .fromTo('.intro__meta', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.45)
        .fromTo('.intro__enter, .intro__skip', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.7)
        .fromTo('.intro__progress span', { scaleX: 0 }, { scaleX: 1, duration: 3.6, ease: 'none' }, 0.45)
        .to('.intro__inner, .intro__skip, .intro__coords', { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 4.4)
        .to('.intro__route path', { strokeDashoffset: -900, duration: 0.5, ease: 'power2.in' }, 4.45)
        .to(rootRef.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power3.inOut' }, 4.65);
    },
    { scope: rootRef, dependencies: [reduced, finish] },
  );

  useEffect(() => () => {
    introTlRef.current?.kill();
    exitTlRef.current?.kill();
  }, []);

  return (
    <div className="intro" ref={rootRef} role="dialog" aria-modal="true" aria-label="DSA Guru introduction">
      <div className="intro__grain" aria-hidden="true" />
      <div className="intro__inner">
        <div className="intro__route" aria-hidden="true">
          <svg viewBox="0 0 900 120" preserveAspectRatio="none">
            <path d="M0 92 C 150 92, 180 28, 320 28 S 520 104, 650 104 S 790 42, 900 42" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="320" cy="28" r="5" />
            <circle cx="650" cy="104" r="5" />
            <circle cx="900" cy="42" r="5" />
          </svg>
        </div>

        <p className="intro__eyebrow mono">DSA GURU · FIELD NOTES FROM THE BROWSER</p>

        <h1 className="intro__title" aria-label="DSA Guru">
          <span className="intro__line" aria-hidden="true">
            {'DSA'.split('').map((letter, i) => <span className="intro__letter" key={`dsa-${i}`}>{letter}</span>)}
          </span>
          <span className="intro__line intro__line--accent" aria-hidden="true">
            {'GURU'.split('').map((letter, i) => <span className="intro__letter" key={`guru-${i}`}>{letter}</span>)}
          </span>
        </h1>

        <p className="intro__sub">Algorithms in motion.</p>
        <p className="intro__meta mono">REAL LOGIC. REAL TRACES. EVERY STEP MADE VISIBLE.</p>

        <button className="intro__enter" ref={enterRef} onClick={leave}>
          <span>Enter the atlas</span>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="intro__progress" aria-hidden="true"><span /></div>
      <button className="intro__skip mono" onClick={leave}>Skip · Esc</button>
      <div className="intro__coords mono" aria-hidden="true">3 LABS &nbsp;·&nbsp; 0 REQUESTS</div>
    </div>
  );
}
