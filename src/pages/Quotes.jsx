import { useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

export default function Quotes() {
  useEffect(() => {
    document.title = `Wisdom | ${data.site.name}`;
    analyticsService.pageView('/quotes', 'Quotes');
  }, []);

  return (
    <div className="scroll-page" style={{ backgroundImage: "url('/images/quotes.jpg')" }}>
      <div className="scroll-page-content">

        <header className="scroll-page-header">
          <p className="scroll-page-eyebrow">जैन ज्ञान</p>
          <h1 className="scroll-page-title">Wisdom & Quotes</h1>
          <p className="scroll-page-sub">Teachings from Jain scripture and philosophy</p>
        </header>

        {data.quotes.length === 0 ? (
          <p className="scroll-page-empty">Quotes coming soon. Add them to data.json → quotes.</p>
        ) : (
          <div className="quotes-list">
            {data.quotes.map((q, i) => (
              <article key={q.id} className="quote-item" style={{ '--item-index': i }}>
                <div className="quote-item-ornament" aria-hidden="true">॥</div>
                <p className="quote-item-text">{q.text}</p>
                <p className="quote-item-translation">{q.translation}</p>
                <div className="quote-item-footer">
                  <span className="quote-item-source">
                    — {q.author}
                    {q.source && q.source !== q.author ? <em> · {q.source}</em> : null}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
