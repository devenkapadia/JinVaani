import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import data from '../data/data.json';

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    const close = () => setDrawerOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  // Close drawer when clicking outside
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.navbar') && !e.target.closest('.navbar-drawer')) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <Link to="/" className="navbar-brand" onClick={() => setDrawerOpen(false)}>
          {data.site.name}
          <span className="tagline">{data.site.tagline}</span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar-links">
          {data.navbarLinks.map((link) => (
            <li key={link.id}>
              <NavLink
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger button */}
        <button
          className="navbar-menu-btn"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
        >
          <span
            style={drawerOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}}
          />
          <span style={drawerOpen ? { opacity: 0 } : {}} />
          <span
            style={drawerOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <ul>
          {data.navbarLinks.map((link) => (
            <li key={link.id}>
              <NavLink
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={() => setDrawerOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
