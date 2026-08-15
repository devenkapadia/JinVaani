import { useState, useEffect, useRef } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

const ALL_PLAYLISTS = data.playlists.sort((a, b) => a.order - b.order);

function preload(src) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4.5L20 12 6 19.5V4.5z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5" y="4" width="4" height="16" rx="1.5" />
      <rect x="15" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}
function IconBuffer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
    </svg>
  );
}

// Animated bars icon for "now playing"
function NowPlayingBars() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" className="bars-anim">
      <rect x="1" y="6" width="2" height="8" rx="1" className="bar bar-1" />
      <rect x="5" y="3" width="2" height="11" rx="1" className="bar bar-2" />
      <rect x="9" y="1" width="2" height="13" rx="1" className="bar bar-3" />
      <rect x="13" y="4" width="2" height="10" rx="1" className="bar bar-4" />
    </svg>
  );
}

export default function Playlists() {
  const { loadPlaylist, currentPlaylist, isPlaying, isBuffering } = useMusicPlayer();
  const [selectedId, setSelectedId] = useState(ALL_PLAYLISTS[0]?.id ?? null);
  const [bgA, setBgA]     = useState(ALL_PLAYLISTS[0]?.heroImage ?? '');
  const [bgB, setBgB]     = useState('');
  const [showB, setShowB] = useState(false);

  const selected = ALL_PLAYLISTS.find((p) => p.id === selectedId) ?? ALL_PLAYLISTS[0];
  const isSelectedPlaying = currentPlaylist?.id === selectedId && isPlaying;
  const isSelectedBuffering = currentPlaylist?.id === selectedId && isBuffering;

  useEffect(() => {
    document.title = `Playlists | ${data.site.name}`;
    analyticsService.pageView('/playlists', 'Playlists');
    if (ALL_PLAYLISTS[1]?.heroImage) preload(ALL_PLAYLISTS[1].heroImage);
  }, []);

  // Crossfade on selection change
  useEffect(() => {
    if (!selected?.heroImage) return;
    const nextImg = selected.heroImage;
    const currentImg = showB ? bgB : bgA;
    if (nextImg === currentImg) return;

    if (!showB) {
      preload(nextImg);
      setBgB(nextImg);
      const t = setTimeout(() => setShowB(true), 40);
      return () => clearTimeout(t);
    } else {
      preload(nextImg);
      setBgA(nextImg);
      const t = setTimeout(() => setShowB(false), 40);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function handleSelect(id) {
    setSelectedId(id);
    const others = ALL_PLAYLISTS.filter((p) => p.id !== id);
    if (others[0]?.heroImage) preload(others[0].heroImage);
  }

  function handlePlay() {
    if (!selected) return;
    if (currentPlaylist?.id === selectedId) return; // already playing
    loadPlaylist(selected);
    analyticsService.playlistPlayed(selected.id);
  }

  return (
    <div className="pl-page">
      {/* Crossfade backgrounds */}
      <div className="pl-bg" style={{ backgroundImage: `url(${bgA})`, opacity: showB ? 0 : 1 }} aria-hidden="true" />
      <div className="pl-bg" style={{ backgroundImage: `url(${bgB})`, opacity: showB ? 1 : 0 }} aria-hidden="true" />
      <div className="pl-overlay" aria-hidden="true" />

      <div className="pl-content">

        {/* Left: playlist list */}
        <nav className="pl-nav" aria-label="Playlists">
          <p className="pl-nav-label">Playlists</p>
          {ALL_PLAYLISTS.map((pl) => {
            const isActive = selectedId === pl.id;
            const isNowPlaying = currentPlaylist?.id === pl.id && isPlaying;
            return (
              <button
                key={pl.id}
                className={`pl-nav-item${isActive ? ' active' : ''}${isNowPlaying ? ' playing' : ''}`}
                onClick={() => handleSelect(pl.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="pl-nav-text">
                  <span className="pl-nav-title">{pl.subtitle}</span>
                  <span className="pl-nav-hindi">{pl.title}</span>
                </span>
                {isNowPlaying && (
                  <span className="pl-nav-bars" aria-label="Now playing">
                    <NowPlayingBars />
                  </span>
                )}
                {!isNowPlaying && isActive && (
                  <span className="pl-nav-chevron" aria-hidden="true">›</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: selected playlist detail */}
        {selected && (
          <div className="pl-detail">
            <p className="pl-detail-category">{selected.category?.toUpperCase()}</p>
            <h1 className="pl-detail-title">{selected.title}</h1>
            <p className="pl-detail-subtitle">{selected.subtitle}</p>
            <p className="pl-detail-desc">{selected.description}</p>

            <div className="pl-detail-actions">
              {/* Only show Play if not already loaded */}
              {currentPlaylist?.id !== selectedId ? (
                <button
                  className="pl-play-btn"
                  onClick={handlePlay}
                  aria-label={`Play ${selected.subtitle}`}
                  style={{ '--pl-color': selected.color }}
                >
                  <span className="pl-play-icon"><IconPlay /></span>
                  <span>Play</span>
                </button>
              ) : (
                <button
                  className="pl-play-btn active"
                  aria-label={`Playing ${selected.subtitle}`}
                  style={{ '--pl-color': selected.color }}
                  disabled
                >
                  <span className="pl-play-icon">
                    {isSelectedBuffering ? <IconBuffer /> : isSelectedPlaying ? <IconPause /> : <IconPlay />}
                  </span>
                  <span>{isSelectedBuffering ? 'Loading…' : isSelectedPlaying ? 'Playing' : 'Paused'}</span>
                </button>
              )}

              {currentPlaylist?.id === selectedId && isPlaying && (
                <span className="pl-now-playing">
                  <NowPlayingBars />
                  <span>Now playing</span>
                </span>
              )}
            </div>

            {/* Playlist hint if placeholder */}
            {selected.youtubePlaylistId?.startsWith('REPLACE') && (
              <p className="pl-placeholder-notice">
                ℹ Update <code>youtubePlaylistId</code> in data.json to enable this playlist.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
