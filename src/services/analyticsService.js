/**
 * analyticsService.js
 * Abstraction over GA4 (gtag.js).
 * All methods are no-ops when analytics is disabled or not initialised.
 */

let _enabled = false;

function gtag(...args) {
  if (!_enabled) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag(...args);
}

function injectGtagScript(measurementId) {
  if (document.getElementById('ga4-script')) return;
  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
}

const analyticsService = {
  /**
   * Initialise GA4. Call once on app mount.
   * @param {{ ga4MeasurementId: string, enabled: boolean }} config
   */
  init(config) {
    if (!config?.enabled || !config?.ga4MeasurementId) return;
    _enabled = true;
    injectGtagScript(config.ga4MeasurementId);
  },

  /** Track a page view. */
  pageView(path, title) {
    gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  },

  /** Track any custom event. */
  event(name, params = {}) {
    gtag('event', name, params);
  },

  // ── Convenience wrappers ────────────────────────────────────────────────────

  playlistOpened(playlistId, playlistTitle) {
    gtag('event', 'playlist_opened', { playlist_id: playlistId, playlist_title: playlistTitle });
  },

  playlistPlayed(playlistId) {
    gtag('event', 'playlist_played', { playlist_id: playlistId });
  },

  songPlayed(songId, title, playlistId) {
    gtag('event', 'song_played', { song_id: songId, song_title: title, playlist_id: playlistId });
  },

  playerPlay(context = {}) {
    gtag('event', 'player_play', context);
  },

  playerPause(context = {}) {
    gtag('event', 'player_pause', context);
  },

  playerNext(context = {}) {
    gtag('event', 'player_next', context);
  },

  playerPrev(context = {}) {
    gtag('event', 'player_prev', context);
  },

  playerSeek(context = {}) {
    gtag('event', 'player_seek', context);
  },

  navkarMantraPlayed() {
    gtag('event', 'navkar_mantra_played');
  },

  listeningDuration(seconds, playlistId) {
    gtag('event', 'listening_duration', { seconds, playlist_id: playlistId });
  },
};

export default analyticsService;
