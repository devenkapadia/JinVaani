import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import analyticsService from './services/analyticsService';
import visitorService from './services/visitorService';
import data from './data/data.json';

const Home         = lazy(() => import('./pages/Home'));
const Playlists    = lazy(() => import('./pages/Playlists'));
const NavkarMantra = lazy(() => import('./pages/NavkarMantra'));
const Quotes       = lazy(() => import('./pages/Quotes'));
const Anubhav      = lazy(() => import('./pages/Anubhav'));
const Katha        = lazy(() => import('./pages/Katha'));

const SideMenu    = lazy(() => import('./components/SideMenu'));
const MusicPlayer = lazy(() => import('./components/MusicPlayer'));

// ── Simple static info pages ──────────────────────────────────────────────────
function StaticPage({ title, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      padding: '5rem 2rem 6rem',
      maxWidth: '680px',
      margin: '0 auto',
    }}>
      <a href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        color: 'var(--color-gold)', fontSize: '0.8rem', letterSpacing: '0.05em',
        marginBottom: '2rem', opacity: 0.75,
      }}>
        ← Back to JinVaani
      </a>
      <h1 style={{
        color: 'var(--color-gold)',
        fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
        marginBottom: '1.5rem',
        fontFamily: 'var(--font-hindi)',
        letterSpacing: '0.02em',
      }}>
        {title}
      </h1>
      <div style={{ lineHeight: 1.85, fontSize: '0.92rem', color: 'rgba(220,205,180,0.85)' }}>
        {children}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '6rem 1rem',
      color: 'var(--color-text)',
      background: 'var(--color-bg)',
      minHeight: '100vh',
    }}>
      <p style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>॥</p>
      <h2 style={{ fontSize: '1.4rem', color: 'rgba(220,205,180,0.7)', fontWeight: 400 }}>
        Page not found
      </h2>
      <p style={{ marginTop: '0.6rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <a href="/" style={{
        color: 'var(--color-gold)',
        marginTop: '2rem',
        display: 'inline-block',
        fontSize: '0.85rem',
        opacity: 0.8,
      }}>
        ← Back to Home
      </a>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      <span style={{
        color: 'var(--color-gold)',
        fontSize: '1rem',
        letterSpacing: '0.3em',
        opacity: 0.5,
      }}>
        ॰ ॰ ॰
      </span>
    </div>
  );
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

function AppShell() {
  useEffect(() => {
    analyticsService.init(data.analytics);
    visitorService.init({ ...data.visitorCounter, firebaseConfig });
    visitorService.recordVisit();
    return () => visitorService.disconnect();
  }, []);

  return (
    <BrowserRouter>
      {/* Floating side menu — always visible */}
      <Suspense fallback={null}>
        <SideMenu />
      </Suspense>

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/playlists"     element={<Playlists />} />
            <Route path="/navkar-mantra" element={<NavkarMantra />} />
            <Route path="/quotes"        element={<Quotes />} />
            <Route path="/anubhav"       element={<Anubhav />} />
            <Route path="/katha"         element={<Katha />} />

            {/* Static info pages */}
            <Route path="/about" element={
              <StaticPage title="About JinVaani">
                <p>{data.site.description}</p>
                <p style={{ marginTop: '1.25rem' }}>
                  JinVaani is built as a peaceful Jain devotional radio experience: one global music player,
                  beautiful devotional backgrounds, and carefully curated spiritual content from the Jain tradition.
                </p>
              </StaticPage>
            } />

            <Route path="/contact" element={
              <StaticPage title="Contact Developer">
                <p>Email: <a href={`mailto:${data.contact.dev_email}`} style={{ color: 'var(--color-gold)' }}>{data.contact.dev_email}</a></p>
                <p style={{ marginTop: '1rem' }}>
                  Instagram: <a href={data.contact.dev_insta} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)' }}>@d.e.v.e.n__</a>
                </p>
              </StaticPage>
            } />

            <Route path="/dmca" element={
              <StaticPage title="Copyright / DMCA">
                <p>All audio content is sourced via the official YouTube IFrame API. JinVaani does not host, download or redistribute any audio files. For DMCA or copyright requests, contact: <a href={`mailto:${data.contact.dev_email}`} style={{ color: 'var(--color-gold)' }}>{data.contact.dev_email}</a></p>
              </StaticPage>
            } />

            <Route path="/privacy" element={
              <StaticPage title="Privacy Policy">
                <p>JinVaani does not collect personal data. Analytics may be used for aggregate usage insights only. No personally identifiable information is stored or shared. The live visitor count uses anonymised session presence only.</p>
              </StaticPage>
            } />

            <Route path="/terms" element={
              <StaticPage title="Terms & Conditions">
                <p>By using JinVaani you agree to use the service for personal, non-commercial devotional listening only. Audio content is streamed via YouTube's official embed API. JinVaani does not grant any rights over the audio content itself.</p>
              </StaticPage>
            } />

            <Route path="/disclaimer" element={
              <StaticPage title="Disclaimer">
                <p>JinVaani is a devotional content aggregator. All audio content is the property of its respective rights holders. JinVaani is not responsible for the availability of third-party content on YouTube.</p>
              </StaticPage>
            } />

            <Route path="/music-policy" element={
              <StaticPage title="Music Content Policy">
                <p>All music is streamed via YouTube's official embed API in compliance with YouTube's Terms of Service. JinVaani does not extract, download or redistribute any audio. All YouTube content is subject to YouTube's own terms and conditions.</p>
              </StaticPage>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Persistent bottom player — never unmounted */}
      <Suspense fallback={null}>
        <MusicPlayer />
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <MusicPlayerProvider>
      <AppShell />
    </MusicPlayerProvider>
  );
}
