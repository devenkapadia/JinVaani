import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const MusicPlayerContext = createContext(null);

const YT_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

const LS_KEYS = {
  LAST_PLAYLIST_ID: 'jv_lastPlaylistId',
  VOLUME: 'jv_volume',
};

// Load the YT IFrame API script exactly once — idempotent
function loadYTScript() {
  // Already loaded
  if (window.YT && window.YT.Player) return Promise.resolve();

  // Script tag already injected — wait for the global callback
  if (window.__ytScriptInjected) {
    return new Promise((resolve) => {
      const prev = window.__ytReadyCallbacks || [];
      window.__ytReadyCallbacks = [...prev, resolve];
    });
  }

  // First time — inject script and set up callback array
  window.__ytScriptInjected = true;
  window.__ytReadyCallbacks = [];

  return new Promise((resolve) => {
    window.__ytReadyCallbacks.push(resolve);

    window.onYouTubeIframeAPIReady = () => {
      const cbs = window.__ytReadyCallbacks || [];
      cbs.forEach((cb) => cb());
      window.__ytReadyCallbacks = [];
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

export function MusicPlayerProvider({ children }) {
  const playerRef        = useRef(null);
  const playerReadyRef   = useRef(false);
  const intervalRef      = useRef(null);
  const pendingActionRef = useRef(null);
  // Stable callback refs so YT event closures always see current handlers
  const onStateCbRef     = useRef(null);
  const onErrorCbRef     = useRef(null);
  const initializedRef   = useRef(false);  // guard against StrictMode double-run

  const [currentPlaylist,  setCurrentPlaylist]  = useState(null);
  const [currentTrack,     setCurrentTrack]     = useState(null);
  const [currentVideoId,   setCurrentVideoId]   = useState(null);
  const [isPlaying,       setIsPlaying]       = useState(false);
  const [isPaused,        setIsPaused]        = useState(false);
  const [isBuffering,     setIsBuffering]     = useState(false);
  const [isError,         setIsError]         = useState(false);
  const [errorMessage,    setErrorMessage]    = useState('');
  const [progress,        setProgress]        = useState({ currentTime: 0, duration: 0, percentage: 0 });
  const [isMuted,         setIsMuted]         = useState(false);
  const [volume,          setVolumeState]     = useState(() => {
    try { return Number(localStorage.getItem(LS_KEYS.VOLUME) ?? 80) || 80; }
    catch { return 80; }
  });

  // ── Progress ticker (stable — only touches refs, not state directly) ─────────
  const startTicker = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p || !playerReadyRef.current) return;
      try {
        const currentTime = p.getCurrentTime() ?? 0;
        const duration    = p.getDuration()    ?? 0;
        const percentage  = duration > 0 ? (currentTime / duration) * 100 : 0;
        setProgress({ currentTime, duration, percentage });
      } catch (_) { /* player not ready */ }
    }, 500);
  }, []);

  const stopTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Keep callback refs current (so YT closures always see latest) ────────────
  useEffect(() => {
    onStateCbRef.current = (event) => {
      const state = event.data;

      if (state === YT_STATES.PLAYING) {
        setIsPlaying(true);
        setIsPaused(false);
        setIsBuffering(false);
        setIsError(false);
        setErrorMessage('');
        // Sync title from YT metadata
        try {
          const vd = event.target.getVideoData();
          if (vd?.title) {
            setCurrentTrack((prev) => prev ? { ...prev, title: vd.title } : prev);
          }
        } catch (_) { /* ignore */ }
        startTicker();

      } else if (state === YT_STATES.PAUSED) {
        setIsPlaying(false);
        setIsPaused(true);
        setIsBuffering(false);
        // Keep ticker running while paused so duration/progress stays accurate
        startTicker();

      } else if (state === YT_STATES.BUFFERING) {
        setIsBuffering(true);
        // Start ticker during buffering so duration populates as soon as metadata loads
        startTicker();

      } else if (state === YT_STATES.ENDED) {
        setIsPlaying(false);
        setIsPaused(false);
        setIsBuffering(false);
        stopTicker();
        setProgress({ currentTime: 0, duration: 0, percentage: 0 });

      } else if (state === YT_STATES.UNSTARTED) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    };
  }); // no deps — always current

  useEffect(() => {
    onErrorCbRef.current = (event) => {
      const codes = {
        2:   'Invalid video ID.',
        5:   'HTML5 player error.',
        100: 'Video not found or removed.',
        101: 'Video not allowed for embedded playback.',
        150: 'Video not allowed for embedded playback.',
      };
      setIsError(true);
      setErrorMessage(codes[event.data] || `Playback error (code ${event.data}). Try again.`);
      setIsPlaying(false);
      stopTicker();
    };
  }); // no deps — always current

  // ── One-time player initialisation ───────────────────────────────────────────
  useEffect(() => {
    // StrictMode runs effects twice in dev — guard against that
    if (initializedRef.current) return;
    initializedRef.current = true;

    const savedVolume = (() => {
      try { return Number(localStorage.getItem(LS_KEYS.VOLUME) ?? 80) || 80; }
      catch { return 80; }
    })();

    loadYTScript().then(() => {
      console.log('[JinVaani] YT API ready, creating player. Container:', document.getElementById('yt-player-container'));

      playerRef.current = new window.YT.Player('yt-player-container', {
        width:  '320',
        height: '180',
        playerVars: {
          autoplay:       0,
          controls:       0,
          disablekb:      1,
          fs:             0,
          modestbranding: 1,
          rel:            0,
          playsinline:    1,
          origin:         window.location.origin,
        },
        events: {
          onReady(event) {
            playerReadyRef.current = true;
            event.target.setVolume(savedVolume);
            console.log('[JinVaani] Player ready ✓');
            // Flush any queued action (e.g. user clicked Play before API was ready)
            if (pendingActionRef.current) {
              console.log('[JinVaani] Flushing pending action');
              pendingActionRef.current(event.target);
              pendingActionRef.current = null;
            }
          },
          onStateChange(event) {
            console.log('[JinVaani] State change:', event.data,
              { '-1':'UNSTARTED','0':'ENDED','1':'PLAYING','2':'PAUSED','3':'BUFFERING','5':'CUED' }[event.data] ?? '?'
            );
            onStateCbRef.current?.(event);
          },
          onError(event) {
            console.error('[JinVaani] Player error code:', event.data);
            onErrorCbRef.current?.(event);
          },
        },
      });
    });

    return () => {
      stopTicker();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function execOrQueue(action) {
    if (playerRef.current && playerReadyRef.current) {
      action(playerRef.current);
    } else {
      pendingActionRef.current = action;
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  const loadPlaylist = useCallback((playlist, { shuffle = false } = {}) => {
    setCurrentPlaylist(playlist);
    setCurrentTrack({ title: playlist.title, artist: '', index: 0 });
    setIsError(false);
    setErrorMessage('');
    try { localStorage.setItem(LS_KEYS.LAST_PLAYLIST_ID, playlist.id); } catch (_) {}

    execOrQueue((player) => {
      if (playlist.youtubePlaylistId && !playlist.youtubePlaylistId.startsWith('PL')) {
        player.loadVideoById(playlist.youtubePlaylistId, 0);
      } else {
        player.loadPlaylist({
          list:        playlist.youtubePlaylistId,
          listType:    'playlist',
          index:       0,
          startSeconds: 0,
        });
        if (shuffle) {
          // setShuffle(true) only shuffles *future* tracks, not the first one.
          // playVideoAt() after a short delay jumps to a random position once
          // the playlist has been registered by the API.
          const randomIndex = Math.floor(Math.random() * 20);
          setTimeout(() => {
            try {
              player.setShuffle(true);
              player.playVideoAt(randomIndex);
            } catch (_) {}
          }, 800);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVideo = useCallback((youtubeVideoId, title = '', artist = '') => {
    setCurrentTrack({ title, artist, index: 0 });
    setCurrentVideoId(youtubeVideoId);
    setCurrentPlaylist(null);
    setIsError(false);
    setErrorMessage('');

    execOrQueue((player) => {
      // loadVideoById interrupts any active playlist and autoplays the video.
      // Calling stopVideo() first was racing against it and leaving the player cued.
      player.loadVideoById(youtubeVideoId, 0);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    isPlaying
      ? playerRef.current.pauseVideo()
      : playerRef.current.playVideo();
  }, [isPlaying]);

  const next = useCallback(() => {
    playerRef.current?.nextVideo();
  }, []);

  const prev = useCallback(() => {
    playerRef.current?.previousVideo();
  }, []);

  const seekTo = useCallback((seconds) => {
    playerRef.current?.seekTo(Math.max(0, seconds), true);
  }, []);

  const seekRelative = useCallback((delta) => {
    if (!playerRef.current || !playerReadyRef.current) return;
    const cur = playerRef.current.getCurrentTime() ?? 0;
    playerRef.current.seekTo(Math.max(0, cur + delta), true);
  }, []);

  const setVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(100, val));
    setVolumeState(v);
    try { localStorage.setItem(LS_KEYS.VOLUME, String(v)); } catch (_) {}
    playerRef.current?.setVolume(v);
  }, []);

  const mute = useCallback(() => {
    playerRef.current?.mute();
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    playerRef.current?.unMute();
    setIsMuted(false);
  }, []);

  const value = {
    currentPlaylist,
    currentTrack,
    currentVideoId,
    isPlaying,
    isPaused,
    isBuffering,
    isError,
    errorMessage,
    progress,
    isMuted,
    volume,
    loadPlaylist,
    loadVideo,
    play,
    pause,
    togglePlay,
    next,
    prev,
    seekTo,
    seekRelative,
    setVolume,
    mute,
    unmute,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {/*
        The YouTube IFrame API replaces this div with an <iframe>.
        Rules:
          1. Must stay in the DOM forever — never unmount.
          2. Must be in the visible viewport (not off-screen at -9999px) —
             Chromium throttles/suspends iframes outside the viewport.
          3. Must have a real rendered size so the YT player initialises.
          4. We hide it visually behind the bottom player bar (z-index -1,
             opacity 0, pointer-events none) so users never see it.
      */}
      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          bottom:        0,
          left:          0,
          width:         '320px',
          height:        '180px',
          opacity:       0,
          pointerEvents: 'none',
          zIndex:        1,          // above fixed page overlays so Chromium never throttles it
          overflow:      'hidden',
        }}
      >
        <div id="yt-player-container" />
      </div>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return ctx;
}

export default MusicPlayerContext;
