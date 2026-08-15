import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode intentionally disabled:
// React 18 StrictMode double-invokes effects in dev, which breaks the YouTube
// IFrame API — the YT player div gets unmounted between the two effect runs,
// causing the player to attach to a detached DOM node and stay stuck buffering.
// StrictMode is a dev-only tool; it has no effect in production builds.
createRoot(document.getElementById('root')).render(<App />);
