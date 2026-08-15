import { useRef } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';

function formatTime(s) {
  if (!s || isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Clean SVG icons ───────────────────────────────────────────────────────────
function IconPrev() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="2.5" height="16" rx="1" />
      <path d="M19 4.5L8.5 12 19 19.5V4.5z" />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="17.5" y="4" width="2.5" height="16" rx="1" />
      <path d="M5 4.5L15.5 12 5 19.5V4.5z" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4.5L20 12 6 19.5V4.5z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5" y="4" width="4" height="16" rx="1.5" />
      <rect x="15" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}

function IconBuffer() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
      style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
    </svg>
  );
}

// Rewind / forward: arc arrow + number
function IconRewind() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* CCW arc */}
      <path d="M12 5a7 7 0 100 14 7 7 0 000-7" />
      {/* arrowhead pointing CCW at top */}
      <polyline points="8,2 12,5 8,8" />
    </svg>
  );
}

function IconForward() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* CW arc */}
      <path d="M12 5a7 7 0 110 14 7 7 0 000-7" />
      {/* arrowhead pointing CW at top */}
      <polyline points="16,2 12,5 16,8" />
    </svg>
  );
}

function IconVolume({ muted, level }) {
  if (muted || level === 0) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  if (level > 50) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 010 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 6a9 9 0 010 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 010 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MusicPlayer() {
  const {
    currentTrack,
    currentPlaylist,
    isPlaying,
    isBuffering,
    isError,
    errorMessage,
    progress,
    volume,
    isMuted,
    togglePlay,
    next,
    prev,
    seekTo,
    seekRelative,
    setVolume,
    mute,
    unmute,
  } = useMusicPlayer();

  const progressBarRef = useRef(null);

  if (!currentTrack) return null;

  const { currentTime, duration, percentage } = progress;

  function handleProgressClick(e) {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(frac * duration);
    analyticsService.playerSeek({ currentTime: frac * duration, playlistId: currentPlaylist?.id });
  }

  function handleProgressKeyDown(e) {
    if (e.key === 'ArrowRight') seekRelative(5);
    if (e.key === 'ArrowLeft')  seekRelative(-5);
  }

  function handleTogglePlay() {
    isPlaying
      ? analyticsService.playerPause({ playlistId: currentPlaylist?.id })
      : analyticsService.playerPlay({ playlistId: currentPlaylist?.id });
    togglePlay();
  }

  function handleNext() { analyticsService.playerNext({ playlistId: currentPlaylist?.id }); next(); }
  function handlePrev() { analyticsService.playerPrev({ playlistId: currentPlaylist?.id }); prev(); }

  return (
    <div className="music-player" role="region" aria-label="Music player">

      {/* ── Left: track info ────────────────────────────────────── */}
      <div className="music-player-track">
        <span className="track-title" title={currentTrack.title}>
          {currentTrack.title || 'Loading…'}
        </span>
        {currentPlaylist && (
          <span className="track-playlist">{currentPlaylist.subtitle || currentPlaylist.title}</span>
        )}
        {isBuffering && <span className="player-buffering">Buffering…</span>}
        {isError && !isBuffering && (
          <span className="player-error" title={errorMessage}>⚠ {errorMessage || 'Playback error'}</span>
        )}
      </div>

      {/* ── Centre: controls + progress bar ─────────────────────── */}
      <div className="music-player-center">
        <div className="player-controls">

          {/* Previous */}
          <button className="player-btn" onClick={handlePrev} aria-label="Previous track" title="Previous">
            <IconPrev />
          </button>

          {/* Rewind 10 */}
          <button className="player-btn skip-btn" onClick={() => seekRelative(-10)} aria-label="Rewind 10 seconds" title="-10s">
            <span className="skip-arrow"><IconRewind /></span>
            <span className="skip-num">10s</span>
          </button>

          {/* Play / Pause / Buffer */}
          <button
            className="player-btn play-btn"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? <IconBuffer /> : isPlaying ? <IconPause /> : <IconPlay />}
          </button>

          {/* Forward 10 */}
          <button className="player-btn skip-btn" onClick={() => seekRelative(10)} aria-label="Forward 10 seconds" title="+10s">
            <span className="skip-arrow"><IconForward /></span>
            <span className="skip-num">10s</span>
          </button>

          {/* Next */}
          <button className="player-btn" onClick={handleNext} aria-label="Next track" title="Next">
            <IconNext />
          </button>

        </div>

        {/* Progress bar */}
        <div className="player-progress-row">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div
            ref={progressBarRef}
            className="player-progress-bar"
            onClick={handleProgressClick}
            onKeyDown={handleProgressKeyDown}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          >
            <div className="player-progress-fill" style={{ width: `${percentage}%` }} />
          </div>
          <span className="player-time right">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ── Right: volume ────────────────────────────────────────── */}
      <div className="music-player-right">
        <button
          className="player-btn"
          onClick={isMuted ? unmute : mute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <IconVolume muted={isMuted} level={volume} />
        </button>
        <input
          type="range"
          className="volume-slider"
          min={0} max={100}
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v === 0) mute();
            else { unmute(); setVolume(v); }
          }}
          aria-label="Volume"
          title={`Volume: ${volume}%`}
        />
      </div>

    </div>
  );
}
