import { useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

// Star rating component
function Stars({ count = 5 }) {
  return (
    <span className="anubhav-stars" aria-label={`${count} stars`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// Instagram icon SVG
function IGIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Anubhav() {
  useEffect(() => {
    document.title = `अनुभव | ${data.site.name}`;
    analyticsService.pageView('/anubhav', 'Anubhav');
  }, []);

  return (
    <div className="scroll-page" style={{ backgroundImage: "url('/images/anubhav.jpg')" }}>
      <div className="scroll-page-content">

        <header className="scroll-page-header">
          <p className="scroll-page-eyebrow">अनुभव</p>
          <h1 className="scroll-page-title">श्रोताओं के अनुभव</h1>
          <p className="scroll-page-sub">Real experiences from our devotees</p>
        </header>

        {/* Share CTA */}
        <div className="anubhav-cta">
          <p className="anubhav-cta-text">
            क्या आपने भी जिनवाणी सुनकर कुछ अनुभव किया? अपना अनुभव हमारे साथ साझा करें।<br />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.7 }}>
              Listened to JinVaani? Share your experience with us!
            </span>
          </p>
          <a
            href={data.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="anubhav-ig-btn"
            aria-label="Share your experience via Instagram DM"
          >
            <IGIcon />
            <span>अपना अनुभव लिखें</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.75, letterSpacing: '0.04em' }}>Instagram DM</span>
          </a>
        </div>

        {data.anubhav.length === 0 ? (
          <p className="scroll-page-empty">Experiences coming soon. Add entries to data.json → anubhav.</p>
        ) : (
          <div className="anubhav-list">
            {data.anubhav.map((a, i) => (
              <article key={a.id} className="anubhav-item" style={{ '--item-index': i }}>
                <Stars count={a.rating || 5} />
                <p className="anubhav-item-text">"{a.text}"</p>
                <div className="anubhav-item-author">
                  <span className="anubhav-item-avatar" aria-hidden="true">
                    {a.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <div>
                    <span className="anubhav-item-name">{a.name}</span>
                    {a.location && (
                      <span className="anubhav-item-loc">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {a.location}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
