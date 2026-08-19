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

// WhatsApp icon SVG
function WAIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.054-1.107l-.29-.173-3.007.789.803-2.927-.19-.302A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
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
            href="https://whatsapp.com/channel/0029VbDA1mTEFeXpV1Sm4m26"
            target="_blank"
            rel="noopener noreferrer"
            className="anubhav-wa-btn"
            aria-label="Join our WhatsApp channel to share your experience"
          >
            <WAIcon />
            <span>अपना अनुभव लिखें</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.75, letterSpacing: '0.04em' }}>WhatsApp Channel</span>
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
