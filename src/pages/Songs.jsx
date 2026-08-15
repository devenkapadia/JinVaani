import { useState, useEffect } from 'react';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

const ALL_CATEGORIES = ['all', ...new Set(data.songs.map((s) => s.category).filter(Boolean))];
const BG_IMAGES = data.playlists.flatMap((p) => p.backgroundImages?.slice(0, 1) || []);

function SongRow({ song, isPlaying, onClick }) {
  const playlist = data.playlists.find((p) => p.id === song.playlistId);
  return (
    <article
      className={`song-row${isPlaying ? ' playing' : ''}`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Play ${song.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="song-num" aria-hidden="true">
        {isPlaying ? <span style={{ color: 'var(--color-saffron)', fontSize: '0.8rem' }}>♫</span> : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="song-info-title">{song.title}</div>
        <div className="song-info-artist">
          {song.artist}
          {playlist && (
            <span style={{ marginLeft: '0.5rem', opacity: 0.65 }}>· {playlist.subtitle}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {song.category && (
          <span className="song-tag">{song.category}</span>
        )}
        {song.duration && (
          <span className="song-duration">{song.duration}</span>
        )}
      </div>
    </article>
  );
}

export default function Songs() {
  const { loadPlaylist, loadVideo, currentVideoId, currentPlaylist, isPlaying } = useMusicPlayer();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    document.title = `Songs | ${data.site.name}`;
    analyticsService.pageView('/songs', 'Songs');
  }, []);

  const filtered = data.songs.filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.artist && s.artist.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = category === 'all' || s.category === category;
    return matchesSearch && matchesCat;
  });

  function handleSongClick(song) {
    if (song.youtubeVideoId && !song.youtubeVideoId.startsWith('REPLACE')) {
      loadVideo(song.youtubeVideoId, song.title, song.artist);
      analyticsService.songPlayed(song.id, song.title, song.playlistId);
    } else {
      // Fall back to loading the song's playlist
      const playlist = data.playlists.find((p) => p.id === song.playlistId);
      if (playlist && !playlist.youtubePlaylistId.startsWith('REPLACE')) {
        loadPlaylist(playlist);
        analyticsService.playlistPlayed(playlist.id);
      }
    }
  }

  function isRowPlaying(song) {
    if (song.youtubeVideoId && !song.youtubeVideoId.startsWith('REPLACE')) {
      return currentVideoId === song.youtubeVideoId && isPlaying;
    }
    return currentPlaylist?.id === song.playlistId && isPlaying;
  }

  return (
    <div className="page-container has-bg" style={{ position: 'relative' }}>
      <BackgroundSlideshow
        images={BG_IMAGES}
        interval={11000}
        overlayStyle={{ background: 'linear-gradient(to bottom, rgba(12,7,2,0.9) 0%, rgba(12,7,2,0.8) 100%)' }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="page-header">
        <h1>🎵 सभी गीत</h1>
        <p>All Songs – Browse and play from the complete collection</p>
      </div>

      {/* Search + filter bar */}
      <div className="songs-search-bar">
        <input
          type="search"
          className="songs-search-input"
          placeholder="Search songs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search songs"
        />
        <select
          className="songs-filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Song list */}
      {filtered.length > 0 ? (
        <div className="songs-list">
          {filtered.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              isPlaying={isRowPlaying(song)}
              onClick={() => handleSongClick(song)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <div className="empty-state-text">
            {search || category !== 'all'
              ? 'No songs match your search.'
              : 'Songs coming soon. Add them to data.json → songs.'}
          </div>
        </div>
      )}

      {/* Note about placeholders */}
      {data.songs.every((s) => s.youtubeVideoId?.startsWith('REPLACE')) && (
        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: 'rgba(200,185,155,0.7)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          ℹ️ Individual song video IDs are placeholders. Update <code>data.json → songs</code> with real YouTube video IDs, or clicking a song will load its playlist instead.
        </p>
      )}
      </div>
    </div>
  );
}
