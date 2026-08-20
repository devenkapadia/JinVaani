import { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import analyticsService from "../services/analyticsService";
import data from "../data/data.json";

const featuredPlaylists = data.playlists
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

// Small arrow for playlist tiles
function IconArrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Pick the "all-songs" playlist (has a real playlist ID); fall back to first playlist
const allSongsPlaylist =
  data.playlists.find((p) => p.id === "all-songs") ?? data.playlists[0];

/* ─── Particle data: 120 entries, deterministic pseudo-random values ───────── */
function buildParticles() {
  // Seeded LCG — same sequence every render, no Math.random()
  let seed = 0xdeadbeef;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  return Array.from({ length: 200 }, (_, i) => ({
    id: i,
    x: `${(rng() * 98 + 1).toFixed(2)}%`, // 1–99% horizontal
    // scatter starting height so screen is full on load (not all at bottom)
    y: `${(rng() * 110).toFixed(2)}%`, // 0–110% from bottom
    size: `${(rng() * 3.5 + 1.2).toFixed(2)}px`, // 1.2–4.7 px
    dur: `${(rng() * 12 + 7).toFixed(2)}s`, // 7–19 s
    tdur: `${(rng() * 3 + 1.8).toFixed(2)}s`, // 1.8–4.8 s twinkle
    delay: `-${(rng() * 20).toFixed(2)}s`, // negative = already in-flight
    drift: `${(rng() * 70 - 35).toFixed(1)}px`, // −35 to +35 px sideways
    ophi: `${(rng() * 0.45 + 0.5).toFixed(2)}`, // 0.50–0.95 bright phase
    oplo: `${(rng() * 0.18 + 0.04).toFixed(2)}`, // 0.04–0.22 dim phase
  }));
}

export default function Home() {
  const { loadPlaylist, currentTrack } = useMusicPlayer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particles = useMemo(() => buildParticles(), []);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const playlistRowRef = useRef(null);

  useEffect(() => {
    document.title = data.seo.defaultTitle;
    analyticsService.pageView("/", "Home");
  }, []);

  function handleStartPlaying() {
    if (!allSongsPlaylist?.youtubePlaylistId) return;
    loadPlaylist(allSongsPlaylist, { shuffle: true });
    analyticsService.pageView("/", "Home – Start Playing");
  }

  // Close support modal on Escape
  useEffect(() => {
    if (!showSupport) return;
    const handler = (e) => { if (e.key === "Escape") setShowSupport(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showSupport]);

  // Close playlist row on outside click
  useEffect(() => {
    if (!showPlaylists) return;
    const handler = (e) => {
      if (
        playlistRowRef.current &&
        !playlistRowRef.current.contains(e.target)
      ) {
        setShowPlaylists(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlaylists]);

  return (
    <div className="home-fullscreen">
      {/* Static full-screen background */}
      <div className="home-bg" aria-hidden="true" />

      {/* Layer 1 — golden particles drifting upward */}
      <div className="home-particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="hp"
            style={{
              "--hp-x": p.x,
              "--hp-y": p.y,
              "--hp-size": p.size,
              "--hp-dur": p.dur,
              "--hp-tdur": p.tdur,
              "--hp-delay": p.delay,
              "--hp-drift": p.drift,
              "--hp-ophi": p.ophi,
              "--hp-oplo": p.oplo,
            }}
          />
        ))}
      </div>

      {/* Layer 2 — soft aura glow orbiting the meditating figure.
          Three nesting levels so orbit and pulse never fight over transform:
            .home-aura-wrap  → static anchor (no animation)
            .home-aura-orbit → orbit translate only
            .home-aura       → pulse scale + opacity only              */}
      <div className="home-aura-wrap" aria-hidden="true">
        <div className="home-aura-orbit">
          <div className="home-aura" />
        </div>
      </div>

      {/* Centred hero content */}
      <div className="home-center">
        <div className="home-brand">
          <h1 className="home-logo">{data.site.name}</h1>
          <p className="home-tagline">{data.site.tagline}</p>
        </div>
      </div>

      {/* Bottom start bar — sits where the player will appear, vanishes once loaded */}
      {!currentTrack && (
        <div className="home-start-bar">
          <button
            className="home-start-btn"
            onClick={handleStartPlaying}
            aria-label="Start playing Jain devotional music"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4.5L20 12 6 19.5V4.5z" />
            </svg>
          </button>
        </div>
      )}

      {/* Bottom quick-nav */}
      <div className="home-bottom-bar">
        {/* Playlist tiles toggle */}
        <div className="home-pl-wrap" ref={playlistRowRef}>
          <button
            className="home-hint-btn"
            onClick={() => setShowPlaylists((v) => !v)}
            aria-expanded={showPlaylists}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Playlists
          </button>

          {/* Expandable playlist tiles */}
          <div
            className={`home-playlist-row${showPlaylists ? " visible" : ""}`}
          >
            {featuredPlaylists.map((pl) => (
              <Link
                key={pl.id}
                to="/playlists"
                className="home-playlist-tile"
                style={{ "--tile-color": pl.color }}
                title={pl.subtitle}
                onClick={() => setShowPlaylists(false)}
              >
                <span className="home-playlist-name">{pl.subtitle}</span>
                <span className="home-playlist-arrow">
                  <IconArrow />
                </span>
              </Link>
            ))}
            <Link
              to="/playlists"
              className="home-playlist-tile all"
              onClick={() => setShowPlaylists(false)}
            >
              <span className="home-playlist-name">All Songs</span>
              <span className="home-playlist-arrow">
                <IconArrow />
              </span>
            </Link>
          </div>
        </div>

        <span className="home-hint-sep" aria-hidden="true">
          ·
        </span>

        <Link to="/quotes" className="home-hint-btn">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Wisdom
        </Link>

        <span className="home-hint-sep" aria-hidden="true">
          ·
        </span>

        <Link to="/navkar-mantra" className="home-hint-btn">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l2 2" />
          </svg>
          Navkar
        </Link>

        <span className="home-hint-sep" aria-hidden="true">
          ·
        </span>

        <Link to="/anubhav" className="home-hint-btn">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          Anubhav
        </Link>
      </div>
      {/* Social buttons — bottom-left, stacked */}
      <div className="home-social-btns">
        {/* WhatsApp channel */}
        <a
          href="https://whatsapp.com/channel/0029VbDA1mTEFeXpV1Sm4m26"
          target="_blank"
          rel="noopener noreferrer"
          className="home-wa-btn"
          aria-label="Join our WhatsApp channel for Jain devotional content"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.006-1.371l-.36-.214-3.76.896.952-3.658-.235-.374A9.812 9.812 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          Join Channel
        </a>

        {/* Instagram */}
        <a
          href={data.socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="home-ig-btn"
          aria-label="Follow us on Instagram"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Follow for more
        </a>
      </div>

      {/* Support button — bottom-right */}
      <button
        className="home-support-btn"
        onClick={() => setShowSupport(true)}
        aria-label="Support Jinvaani"
      >
        {/* Heart icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        {data.jinsevaa.buttonLabel}
      </button>

      {/* JinSevaa modal */}
      {showSupport && (
        <div
          className="support-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSupport(false); }}
          role="dialog"
          aria-modal="true"
          aria-label={data.jinsevaa.modalTitle}
        >
          <div className="support-modal">
            <button
              className="support-modal-close"
              onClick={() => setShowSupport(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="support-modal-emoji">{data.jinsevaa.modalEmoji}</div>
            <h2 className="support-modal-title">{data.jinsevaa.modalTitle}</h2>
            <p className="support-modal-body">{data.jinsevaa.modalBody}</p>
            <img
              src={data.jinsevaa.qrImage}
              alt="Payment QR code"
              className="support-modal-qr"
            />
            <p className="support-modal-note">{data.jinsevaa.qrNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
