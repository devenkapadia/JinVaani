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

export default function Anubhav() {
  useEffect(() => {
    document.title = `Anubhav | ${data.site.name}`;
    analyticsService.pageView('/anubhav', 'Anubhav');
  }, []);

  return (
    <div className="scroll-page" style={{ backgroundImage: "url('/images/anubhav.jpg')" }}>
      <div className="scroll-page-content">

        <header className="scroll-page-header">
          <p className="scroll-page-eyebrow">अनुभव</p>
          <h1 className="scroll-page-title">Listener Experiences</h1>
          <p className="scroll-page-sub">Real experiences from our devotees</p>
        </header>

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
