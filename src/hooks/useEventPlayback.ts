import { useCallback, useEffect, useRef, useState } from 'react';

/** Drives an index through a locally generated event trace. */
export function useEventPlayback(
  length: number,
  initialSpeed = 40,
  canAdvance?: (cursor: number) => boolean,
  commitIntervalMs = 32,
) {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const cursorRef = useRef(0);
  const lastRef = useRef(0);
  const lastCommitRef = useRef(0);
  const accumulatorRef = useRef(0);
  const canAdvanceRef = useRef(canAdvance);
  canAdvanceRef.current = canAdvance;

  const goTo = useCallback((value: number) => {
    const next = Math.max(0, Math.min(length, value));
    cursorRef.current = next;
    lastCommitRef.current = performance.now();
    setCursor(next);
  }, [length]);

  useEffect(() => {
    goTo(0);
    setPlaying(false);
  }, [goTo]);

  useEffect(() => {
    if (!playing || length === 0) return;
    let frame = 0;
    lastRef.current = performance.now();
    lastCommitRef.current = lastRef.current;
    const tick = (now: number) => {
      const dt = Math.min(now - lastRef.current, 250);
      lastRef.current = now;
      accumulatorRef.current += (dt * speed) / 1000;
      if (accumulatorRef.current >= 1) {
        const step = Math.floor(accumulatorRef.current);
        accumulatorRef.current -= step;
        const next = Math.min(length, cursorRef.current + step);
        if (canAdvanceRef.current && !canAdvanceRef.current(next)) {
          accumulatorRef.current = 0;
          setCursor(cursorRef.current);
          setPlaying(false);
          return;
        }
        cursorRef.current = next;
        if (next >= length || now - lastCommitRef.current >= commitIntervalMs) {
          lastCommitRef.current = now;
          setCursor(next);
        }
        if (next >= length) {
          setPlaying(false);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, length, commitIntervalMs]);

  const play = useCallback(() => {
    if (cursorRef.current >= length) goTo(0);
    accumulatorRef.current = 0;
    lastCommitRef.current = performance.now();
    setPlaying(true);
  }, [goTo, length]);

  const pause = useCallback(() => setPlaying(false), []);
  const reset = useCallback(() => {
    setPlaying(false);
    goTo(0);
    accumulatorRef.current = 0;
  }, [goTo]);
  const stepForward = useCallback(() => {
    setPlaying(false);
    goTo(cursorRef.current + 1);
  }, [goTo]);
  const stepBack = useCallback(() => {
    setPlaying(false);
    goTo(cursorRef.current - 1);
  }, [goTo]);
  const seek = useCallback((value: number) => {
    setPlaying(false);
    goTo(value);
  }, [goTo]);
  const replay = useCallback(() => {
    cursorRef.current = 0;
    accumulatorRef.current = 0;
    lastCommitRef.current = performance.now();
    setCursor(0);
    setPlaying(true);
  }, []);

  return { cursor, playing, speed, setSpeed, play, pause, reset, replay, stepForward, stepBack, seek };
}
