import { useEffect } from 'react';
import BackgroundSlideshow from '../components/BackgroundSlideshow';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

const BG_IMAGES = ['/images/evening-4.jpg', '/images/morning-4.jpg', '/images/evening-2.jpg'];

// Fallback background colours per index
const FALLBACK_COLORS = [
  'linear-gradient(135deg,#2a1a08,#4a2c12)',
  'linear-gradient(135deg,#1a1230,#2d1a50)',
  'linear-gradient(135deg,#0f2a20,#1a4a34)',
];

export default function Darshan() {
  useEffect(() => {
    document.title = `Darshan | ${data.site.name}`;
    analyticsService.pageView('/darshan', 'Darshan');
  }, []);

  return (
    <div className="page-container has-bg" style={{ position: 'relative' }}>
      <BackgroundSlideshow
        images={BG_IMAGES}
        interval={12000}
        overlayStyle={{ background: 'linear-gradient(to bottom, rgba(10,6,2,0.85) 0%, rgba(10,6,2,0.7) 100%)' }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="page-header">
        <h1>🛕 दर्शन</h1>
        <p>Sacred Jain pilgrimage sites and temples</p>
      </div>

      {data.darshan.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛕</div>
          <div className="empty-state-text">
            Darshan entries coming soon. Add them to <code>data.json → darshan</code>.
          </div>
        </div>
      ) : (
        <div className="darshan-grid">
          {data.darshan.map((d, idx) => (
            <article key={d.id} className="darshan-card">
              {d.image ? (
                <img
                  src={d.image}
                  alt={d.subtitle}
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="darshan-card-placeholder"
                  style={{ background: FALLBACK_COLORS[idx % FALLBACK_COLORS.length] }}
                >
                  🛕
                </div>
              )}
              <div className="darshan-card-overlay">
                <h2 className="darshan-card-title">{d.title}</h2>
                <p className="darshan-card-subtitle">{d.subtitle}</p>
                {d.location && (
                  <p className="darshan-card-location">📍 {d.location}</p>
                )}
                {d.description && (
                  <p style={{
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)',
                    marginTop: '0.5rem', lineHeight: 1.6,
                    fontFamily: 'var(--font-hindi)',
                  }}>
                    {d.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
