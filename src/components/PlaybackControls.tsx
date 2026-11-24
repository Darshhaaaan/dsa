import type { CSSProperties } from 'react';
import { clamp } from '../utils/geo';
import './playback.css';

interface PlaybackApi {
  cursor: number;
  playing: boolean;
  speed: number;
  setSpeed: (value: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  replay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  seek: (value: number) => void;
}

export function PlaybackControls({ api, length, disabled = false }: { api: PlaybackApi; length: number; disabled?: boolean }) {
  const progress = length ? (api.cursor / length) * 100 : 0;
  const off = disabled || length === 0;
  const playLabel = api.playing
    ? '❚❚  PAUSE'
    : api.cursor === 0 || api.cursor >= length
      ? '▶  START'
      : '▶  RESUME';

  return (
    <div className="playback">
      <div className="playback__row">
        <button className="btn btn--primary playback__play" onClick={api.playing ? api.pause : api.play} disabled={off}>
          {playLabel}
        </button>
        <button className="btn btn--quiet playback__step" onClick={api.stepBack} disabled={off || api.cursor === 0} aria-label="Step backward" title="Step backward">◀</button>
        <button className="btn btn--quiet playback__step" onClick={api.stepForward} disabled={off || api.cursor >= length} aria-label="Step forward" title="Step forward">▶</button>
        <button className="btn btn--quiet playback__reset" onClick={api.reset} disabled={off}>RESET</button>
        <button className="btn btn--gold playback__replay" onClick={api.replay} disabled={off}>REPLAY</button>
      </div>

      <div className="playback__scrub">
        <span className="mono playback__count">{api.cursor} / {length}</span>
        <input
          className="range"
          type="range"
          min={0}
          max={Math.max(length, 1)}
          value={api.cursor}
          onChange={(e) => api.seek(Number(e.target.value))}
          disabled={off}
          aria-label="Event position"
          style={{ '--progress': `${progress}%` } as CSSProperties}
        />
      </div>

      <label className="playback__speed">
        <span className="hud-label">Speed · {api.speed} events/s</span>
        <input
          className="range"
          type="range"
          min={2}
          max={200}
          value={api.speed}
          onChange={(e) => api.setSpeed(clamp(Number(e.target.value), 2, 200))}
          aria-label="Playback speed"
          style={{ '--progress': `${((api.speed - 2) / 198) * 100}%` } as CSSProperties}
        />
      </label>
    </div>
  );
}
