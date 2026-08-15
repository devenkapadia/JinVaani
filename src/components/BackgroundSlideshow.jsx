import { useState, useEffect, useRef } from 'react';

/**
 * BackgroundSlideshow
 * Props:
 *   images        – string[] of image URLs (required)
 *   interval      – ms between slides (default 6000)
 *   overlayStyle  – override overlay gradient (optional)
 *   children      – content rendered above the slideshow
 */
export default function BackgroundSlideshow({
  images = [],
  interval = 6000,
  overlayStyle,
  children,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const timerRef = useRef(null);

  // Preload images eagerly (current + next)
  useEffect(() => {
    if (!images.length) return;

    const preload = (idx) => {
      if (!images[idx] || loadedImages[idx]) return;
      const img = new Image();
      img.onload = () =>
        setLoadedImages((prev) => ({ ...prev, [idx]: true }));
      img.onerror = () =>
        setLoadedImages((prev) => ({ ...prev, [idx]: true })); // mark even on error
      img.src = images[idx];
    };

    preload(currentIndex);
    preload((currentIndex + 1) % images.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, images]);

  // Auto-advance slides
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [images.length, interval]);

  if (!images.length) {
    // Fallback: dark gradient background
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #2a1a08, #3d2510)',
          zIndex: 0,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="bg-slideshow" aria-hidden="true">
      {images.map((src, idx) => (
        <div
          key={src + idx}
          className={`bg-slide${idx === currentIndex ? ' visible' : ''}`}
          style={{
            backgroundImage: loadedImages[idx] ? `url(${src})` : undefined,
            backgroundColor: '#2a1a08',
          }}
        />
      ))}
      {/* Dark overlay so text stays readable */}
      <div
        className="bg-overlay"
        style={overlayStyle}
      />
      {children}
    </div>
  );
}
