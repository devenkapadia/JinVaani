import { useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

export default function Katha() {
  useEffect(() => {
    document.title = `Katha | ${data.site.name}`;
    analyticsService.pageView('/katha', 'Katha');
  }, []);

  const kathaList = data.katha ?? [];

  return (
    <div className="scroll-page" style={{ backgroundImage: "url('/images/katha.jpg')" }}>
      <div className="scroll-page-content">

        <header className="scroll-page-header">
          <p className="scroll-page-eyebrow">जैन कथाएँ</p>
          <h1 className="scroll-page-title">Katha & Stories</h1>
          <p className="scroll-page-sub">Inspiring stories and teachings from the Jain tradition</p>
        </header>

        {kathaList.length === 0 ? (
          <p className="scroll-page-empty">Katha stories coming soon. Add them to data.json → katha.</p>
        ) : (
          <div className="katha-scroll-list">
            {kathaList.map((k, i) => (
              <article key={k.id} className="katha-scroll-item" style={{ '--item-index': i }}>
                <header className="katha-scroll-item-header">
                  <div className="katha-scroll-item-meta">
                    <p className="katha-scroll-item-subtitle">{k.subtitle}</p>
                    {k.date && (
                      <time className="katha-scroll-item-date" dateTime={k.date}>
                        {new Date(k.date).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </time>
                    )}
                  </div>
                  <h2 className="katha-scroll-item-title">{k.title}</h2>
                </header>

                {k.image && (
                  <img
                    src={k.image}
                    alt={k.title}
                    className="katha-scroll-item-image"
                    loading="lazy"
                  />
                )}

                <p className="katha-scroll-item-excerpt">{k.excerpt}</p>

                {k.content && k.content !== k.excerpt && (
                  <details className="katha-scroll-item-details">
                    <summary className="katha-scroll-item-read-more">
                      <span>पूरी कथा पढ़ें</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <p className="katha-scroll-item-content">{k.content}</p>
                  </details>
                )}

                {k.tags && k.tags.length > 0 && (
                  <div className="katha-scroll-item-tags">
                    {k.tags.map((tag) => (
                      <span key={tag} className="katha-scroll-item-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
