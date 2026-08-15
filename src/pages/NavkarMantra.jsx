import { useEffect } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

const navkarTrack = data.standaloneTracks[0];

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function IconPlay() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4.5L20 12 6 19.5V4.5z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5" y="4" width="4" height="16" rx="1.5" />
      <rect x="15" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}
function IconBuffer() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
      style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
    </svg>
  );
}
function IconRewind() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5a7 7 0 100 14 7 7 0 000-7" />
      <polyline points="8,2 12,5 8,8" />
    </svg>
  );
}
function IconForward() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5a7 7 0 110 14 7 7 0 000-7" />
      <polyline points="16,2 12,5 16,8" />
    </svg>
  );
}

export default function NavkarMantra() {
  const {
    loadVideo, currentVideoId, isPlaying, isBuffering,
    isError, errorMessage, progress, togglePlay, seekRelative, seekTo,
  } = useMusicPlayer();

  const isCurrentTrack = currentVideoId === navkarTrack?.youtubeVideoId;

  useEffect(() => {
    document.title = `Navkar Mantra | ${data.site.name}`;
    analyticsService.pageView('/navkar-mantra', 'Navkar Mantra');
  }, []);

  if (!navkarTrack) return null;

  const { currentTime, duration, percentage } = progress;
  const hasPlaceholder = navkarTrack.youtubeVideoId?.startsWith('REPLACE');

  function handlePlay() {
    if (hasPlaceholder) return;
    if (isCurrentTrack) {
      togglePlay();
    } else {
      loadVideo(navkarTrack.youtubeVideoId, navkarTrack.title, navkarTrack.artist);
      analyticsService.navkarMantraPlayed();
    }
  }

  function handleSeekClick(e) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * duration);
  }

  return (
    <div className="nk-page">
      {/* Static background */}
      <div className="nk-bg" aria-hidden="true" />
      {/* Overlay — very light in centre, darker at edges */}
      <div className="nk-overlay" aria-hidden="true" />

      <div className="nk-layout">

        {/* ── LEFT: mantra text in frosted glass box ── */}
        <aside className="nk-mantra-box" aria-label="Navkar Mantra text">
          <p className="nk-mantra-label">णमोकार मंत्र</p>
          {navkarTrack.lyrics
            ? navkarTrack.lyrics.split('\n').map((line, i) => (
                <p key={i} className="nk-mantra-line">{line}</p>
              ))
            : null}
        </aside>

        {/* ── RIGHT: title + controls ── */}
        <div className="nk-controls">
          <p className="nk-category">Navkar Mantra</p>
          <h1 className="nk-title">{navkarTrack.title}</h1>
          <p className="nk-subtitle">{navkarTrack.subtitle}</p>

          {/* Play button */}
          <button
            className="nk-play-btn"
            onClick={handlePlay}
            aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play Navkar Mantra'}
            disabled={hasPlaceholder}
          >
            {isBuffering && isCurrentTrack ? <IconBuffer /> : isCurrentTrack && isPlaying ? <IconPause /> : <IconPlay />}
          </button>

          {/* Duration hint before playing */}
          {!isCurrentTrack && (
            <p className="nk-duration">~{navkarTrack.duration}</p>
          )}

          {/* Progress + seek when active */}
          {isCurrentTrack && (
            <div className="nk-progress-wrap">
              <div
                className="nk-progress-bar"
                onClick={handleSeekClick}
                role="slider"
                tabIndex={0}
                aria-label="Seek"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') seekRelative(10);
                  if (e.key === 'ArrowLeft')  seekRelative(-10);
                }}
              >
                <div className="nk-progress-fill" style={{ width: `${percentage}%` }} />
              </div>
              <div className="nk-progress-times">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* ±10s skip buttons */}
          {isCurrentTrack && (
            <div className="nk-skip-row">
              <button className="nk-skip-btn" onClick={() => seekRelative(-10)} aria-label="Rewind 10 seconds">
                <IconRewind />
                <span>10s</span>
              </button>
              <button className="nk-skip-btn" onClick={() => seekRelative(10)} aria-label="Forward 10 seconds">
                <IconForward />
                <span>10s</span>
              </button>
            </div>
          )}

          {/* Error */}
          {isCurrentTrack && isError && (
            <p className="nk-error">⚠ {errorMessage}</p>
          )}

          {/* Placeholder notice */}
          {hasPlaceholder && (
            <p className="nk-notice">
              ℹ Update <code>standaloneTracks[0].youtubeVideoId</code> in data.json to enable playback.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
