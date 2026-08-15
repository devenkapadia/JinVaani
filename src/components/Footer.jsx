import { Link } from 'react-router-dom';
import data from '../data/data.json';

const SOCIAL_ICONS = {
  youtube: '▶',
  instagram: '📷',
  facebook: 'f',
  whatsapp: '💬',
};

export default function Footer() {
  const { site, footerLinks, socialLinks, contact } = data;

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand column */}
        <div>
          <div className="footer-brand-name">{site.name}</div>
          <div className="footer-brand-tagline">{site.tagline}</div>
          <p className="footer-brand-desc">{site.description}</p>

          <div className="footer-social-links" style={{ marginTop: '1rem' }}>
            {Object.entries(socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label={platform}
              >
                <span>{SOCIAL_ICONS[platform] || '🔗'}</span>
                <span style={{ textTransform: 'capitalize' }}>{platform}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Links column */}
        <div>
          <div className="footer-col-title">Quick Links</div>
          <ul className="footer-links-list">
            {footerLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <div className="footer-col-title">Contact</div>
          <ul className="footer-links-list">
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
          </ul>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="footer-col-title">Disclaimer</div>
            <p style={{ fontSize: '0.75rem', color: '#806050', lineHeight: '1.5' }}>
              All audio content is sourced from YouTube via the official YouTube IFrame API.
              JinVaani does not host, download, or redistribute any audio files.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {site.year} {site.name}. All rights reserved.</span>
        <span>Made with devotion · {site.tagline}</span>
      </div>
    </footer>
  );
}
