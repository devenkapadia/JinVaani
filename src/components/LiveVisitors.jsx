import { useState, useEffect } from 'react';
import visitorService from '../services/visitorService';

/**
 * LiveVisitors
 * Shows a real-time "N people listening" badge.
 * Falls back gracefully to nothing if the service is unavailable.
 *
 * Props:
 *   dark  – boolean – use light text for dark backgrounds (default false)
 *   label – optional suffix label override
 */
export default function LiveVisitors({ dark = false, label }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = visitorService.onVisitorCountChange((n) => {
        setCount(n);
      });
    } catch (_) {
      // Service unavailable – show nothing
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  if (count === null) return null;

  const displayLabel = label || `लोग JinVaani सुन रहे हैं`;

  return (
    <span
      className="live-visitors"
      style={
        dark
          ? {
              background: 'rgba(30,18,8,0.55)',
              border: '1px solid rgba(201,146,42,0.3)',
              color: 'rgba(200,180,150,0.9)',
            }
          : {}
      }
      title="Live listener count"
    >
      <span className="live-visitors-dot" />
      🪔&nbsp;
      <span className="live-visitors-count">{count}</span>
      &nbsp;{displayLabel}
    </span>
  );
}
