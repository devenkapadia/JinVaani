import { useMusicPlayer } from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';

/**
 * PlaylistCard
 * Props:
 *   playlist  – playlist object from data.json
 *   onClick   – optional extra click handler
 */
export default function PlaylistCard({ playlist, onClick }) {
  const { loadPlaylist, currentPlaylist, isPlaying } = useMusicPlayer();

  const isActive = currentPlaylist?.id === playlist.id;

  function handlePlay(e) {
    e.stopPropagation();
    analyticsService.playlistPlayed(playlist.id);
    loadPlaylist(playlist);
    if (onClick) onClick(playlist);
  }

  function handleCardClick() {
    analyticsService.playlistOpened(playlist.id, playlist.title);
    if (onClick) onClick(playlist);
  }

  // Use first background image as cover
  const coverImage = playlist.backgroundImages?.[0];

  return (
    <article
      className={`playlist-card${isActive ? ' playlist-card-playing' : ''}`}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`${playlist.title} – ${playlist.subtitle}`}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      <div className="playlist-card-image">
        {coverImage ? (
          <img
            src={coverImage}
            alt={playlist.subtitle}
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              background: `linear-gradient(135deg, #f0e8d0, #e8dfc8)`,
            }}
          >
            {playlist.icon || '🎵'}
          </div>
        )}
        <div className="playlist-card-overlay" />

        {/* Icon badge */}
        {playlist.icon && (
          <div className="playlist-card-icon" aria-hidden="true">
            {playlist.icon}
          </div>
        )}

        {/* Play button */}
        <button
          className="playlist-card-play"
          onClick={handlePlay}
          aria-label={`Play ${playlist.subtitle}`}
          title={`Play ${playlist.subtitle}`}
        >
          {isActive && isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div className="playlist-card-body">
        <div className="playlist-card-title">{playlist.title}</div>
        <div className="playlist-card-subtitle">{playlist.subtitle}</div>
        {playlist.description && (
          <p className="playlist-card-desc">{playlist.description}</p>
        )}
        {isActive && isPlaying && (
          <div className="now-playing-badge">
            <span className="now-playing-dot" />
            Now Playing
          </div>
        )}
      </div>
    </article>
  );
}
