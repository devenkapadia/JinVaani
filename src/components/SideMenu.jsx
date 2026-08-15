import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import data from '../data/data.json';

const NAV_ITEMS = data.navbarLinks;
const SOCIAL    = data.socialLinks || {};
const INFO_LINKS = [
  { label: 'About',                path: '/about' },
  { label: 'Contact',              path: '/contact' },
  { label: 'Copyright / DMCA',     path: '/dmca' },
  { label: 'Privacy Policy',       path: '/privacy' },
  { label: 'Music Content Policy', path: '/music-policy' },
];

// Social platform SVG icons
function YTIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.4 2.8 12 2.8 12 2.8s-4.4 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.8 9.2.8 11.5v2.1C.8 16 1 18.2 1 18.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 22.4 12 22.4 12 22.4s4.4 0 6.8-.2c.6-.1 1.9-.1 3-1.2.9-.8 1.2-2.8 1.2-2.8s.2-2.2.2-4.5v-2.1C23.2 9.2 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z" />
    </svg>
  );
}
function IGIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FBIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function SideMenu() {
  const [open, setOpen]         = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const menuRef = useRef(null);
  const infoRef = useRef(null);
  const location = useLocation();

  // Close both menus on route change
  useEffect(() => {
    setOpen(false);
    setInfoOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open && !infoOpen) return;
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (infoRef.current && !infoRef.current.contains(e.target)) setInfoOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, infoOpen]);

  return (
    <>
      {/* ── Hamburger menu (top-left) ─────────────────────────── */}
      <div ref={menuRef} className="sidemenu-anchor sidemenu-left">

        {/* Burger button */}
        <button
          className="sidemenu-burger"
          onClick={() => { setOpen(v => !v); setInfoOpen(false); }}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span className={`burger-line${open ? ' open-0' : ''}`} />
          <span className={`burger-line${open ? ' open-1' : ''}`} />
          <span className={`burger-line${open ? ' open-2' : ''}`} />
        </button>

        {/* Slide-down nav panel */}
        <nav
          className={`sidemenu-panel${open ? ' open' : ''}`}
          aria-label="Main navigation"
          aria-hidden={!open}
        >
          {/* Brand inside panel */}
          <div className="sidemenu-brand">
            <span className="sidemenu-brand-name">{data.site.name}</span>
            <span className="sidemenu-brand-tag">{data.site.tagline}</span>
          </div>

          {/* Nav links */}
          <div className="sidemenu-nav-links">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidemenu-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Social links */}
          {Object.keys(SOCIAL).length > 0 && (
            <div className="sidemenu-social">
              {SOCIAL.youtube && (
                <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer"
                  className="sidemenu-social-link" title="YouTube" aria-label="JinVaani on YouTube">
                  <YTIcon />
                </a>
              )}
              {SOCIAL.instagram && (
                <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                  className="sidemenu-social-link" title="Instagram" aria-label="JinVaani on Instagram">
                  <IGIcon />
                </a>
              )}
              {SOCIAL.facebook && (
                <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                  className="sidemenu-social-link" title="Facebook" aria-label="JinVaani on Facebook">
                  <FBIcon />
                </a>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* ── Info button (top-right) ───────────────────────────── */}
      <div ref={infoRef} className="sidemenu-anchor sidemenu-right">
        <button
          className="sidemenu-info-btn"
          onClick={() => { setInfoOpen(v => !v); setOpen(false); }}
          aria-label="Info and legal links"
          aria-expanded={infoOpen}
          aria-haspopup="true"
        >
          <InfoIcon />
        </button>

        <div
          className={`sidemenu-info-panel${infoOpen ? ' open' : ''}`}
          aria-hidden={!infoOpen}
        >
          {INFO_LINKS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="sidemenu-info-link"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
