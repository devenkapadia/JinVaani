import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LiveVisitors from '../components/LiveVisitors';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

const featuredPlaylists = data.playlists
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

// SVG Play icon
function IconPlay({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4.5L20 12 6 19.5V4.5z" />
    </svg>
  );
}
function IconPause({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5" y="4" width="4" height="16" rx="1.5" />
      <rect x="15" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}
function IconSpinner({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
    </svg>
  );
}

// Small arrow for playlist tiles
function IconArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Pick the "all-songs" playlist (has a real playlist ID); fall back to first playlist
const allSongsPlaylist =
  data.playlists.find((p) => p.id === 'all-songs') ?? data.playlists[0];

export default function Home() {
  const { loadPlaylist, currentPlaylist, isPlaying, isBuffering, togglePlay } = useMusicPlayer();
  const isRadioActive = currentPlaylist?.id === allSongsPlaylist?.id;
  const [showPlaylists, setShowPlaylists] = useState(false);
  const playlistRowRef = useRef(null);
  useEffect(() => {
    document.title = data.seo.defaultTitle;
    analyticsService.pageView('/', 'Home');
  }, []);

  // Close playlist row on outside click
  useEffect(() => {
    if (!showPlaylists) return;
    const handler = (e) => {
      if (playlistRowRef.current && !playlistRowRef.current.contains(e.target)) {
        setShowPlaylists(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlaylists]);

  function handleRadioPlay() {
    if (!allSongsPlaylist?.youtubePlaylistId) return;
    if (isRadioActive) {
      togglePlay();
    } else {
      // Use YouTube's built-in shuffle so we never exceed the playlist length
      loadPlaylist(allSongsPlaylist, { shuffle: true });
      analyticsService.pageView('/', 'Home – Random Play');
    }
  }

  return (
    <div className="home-fullscreen">
      {/* Static full-screen background */}
      <div className="home-bg" aria-hidden="true" />

      {/* Centred hero content */}
      <div className="home-center">

        {/* Brand */}
        <div className="home-brand">
          <h1 className="home-logo">{data.site.name}</h1>
          <p className="home-tagline">{data.site.tagline}</p>
        </div>

        {/* Random play button */}
        <button
          className="home-play-btn"
          onClick={handleRadioPlay}
          aria-label={isRadioActive && isPlaying ? 'Pause' : 'Play a random devotional song'}
          title="Play a random Jain devotional song"
        >
          {isBuffering && isRadioActive
            ? <IconSpinner size={30} />
            : isRadioActive && isPlaying
              ? <IconPause size={30} />
              : <IconPlay size={30} />}
        </button>

        {/* Label below button */}
        <p className="home-play-label">जिन भक्ति</p>

        {/* Live visitors */}
        {/* <div className="home-visitors">
          <LiveVisitors dark />
        </div> */}
      </div>

      {/* Bottom quick-nav */}
      <div className="home-bottom-bar">
        {/* Playlist tiles toggle */}
        <div className="home-pl-wrap" ref={playlistRowRef}>
          <button
            className="home-hint-btn"
            onClick={() => setShowPlaylists((v) => !v)}
            aria-expanded={showPlaylists}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Playlists
          </button>

          {/* Expandable playlist tiles */}
          <div className={`home-playlist-row${showPlaylists ? ' visible' : ''}`}>
            {featuredPlaylists.map((pl) => (
              <Link
                key={pl.id}
                to="/playlists"
                className="home-playlist-tile"
                style={{ '--tile-color': pl.color }}
                title={pl.subtitle}
                onClick={() => setShowPlaylists(false)}
              >
                <span className="home-playlist-name">{pl.subtitle}</span>
                <span className="home-playlist-arrow"><IconArrow /></span>
              </Link>
            ))}
            <Link
              to="/playlists"
              className="home-playlist-tile all"
              onClick={() => setShowPlaylists(false)}
            >
              <span className="home-playlist-name">All Songs</span>
              <span className="home-playlist-arrow"><IconArrow /></span>
            </Link>
          </div>
        </div>

        <span className="home-hint-sep" aria-hidden="true">·</span>

        <Link to="/quotes" className="home-hint-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Wisdom
        </Link>

        <span className="home-hint-sep" aria-hidden="true">·</span>

        <Link to="/navkar-mantra" className="home-hint-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l2 2" />
          </svg>
          Navkar
        </Link>

        <span className="home-hint-sep" aria-hidden="true">·</span>

        <Link to="/anubhav" className="home-hint-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          Anubhav
        </Link>
      </div>
    </div>
  );
}
