/**
 * visitorService.js
 * Abstraction over realtime visitor presence.
 *
 * provider: "mock"    → local dev simulation (default)
 * provider: "firebase" → Firebase Realtime Database (production)
 *
 * To add Firebase support:
 *   1. npm install firebase
 *   2. Implement the firebase branch below using the firebaseConfig from data.json
 */

let _visitorCountCallbacks = [];
let _totalVisitsCallbacks = [];
let _mockIntervalId = null;
let _provider = 'mock';

// ── Mock implementation ──────────────────────────────────────────────────────
let _mockCount = Math.floor(Math.random() * 21) + 15; // 15–35
let _mockTotal = Math.floor(Math.random() * 4501) + 500; // 500–5000

function _notifyCount(count) {
  _visitorCountCallbacks.forEach((cb) => cb(count));
}

function _notifyTotal(total) {
  _totalVisitsCallbacks.forEach((cb) => cb(total));
}

function _startMock() {
  if (_mockIntervalId) return;

  // Emit initial values immediately
  _notifyCount(_mockCount);
  _notifyTotal(_mockTotal);

  const tick = () => {
    // Fluctuate live count ±1..3
    const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
    _mockCount = Math.max(1, _mockCount + delta);
    _mockTotal += Math.floor(Math.random() * 3); // occasional new visits
    _notifyCount(_mockCount);
    _notifyTotal(_mockTotal);

    // Schedule next tick: 8–15 s
    const next = (Math.random() * 7 + 8) * 1000;
    _mockIntervalId = setTimeout(tick, next);
  };

  const firstDelay = (Math.random() * 7 + 8) * 1000;
  _mockIntervalId = setTimeout(tick, firstDelay);
}

function _stopMock() {
  if (_mockIntervalId) {
    clearTimeout(_mockIntervalId);
    _mockIntervalId = null;
  }
}

// ── Public service object ────────────────────────────────────────────────────
const visitorService = {
  /**
   * Initialise with provider config from data.json.
   * @param {{ provider: string, firebaseConfig?: object }} config
   */
  init(config) {
    _provider = config?.provider ?? 'mock';

    if (_provider === 'mock') {
      _startMock();
      return;
    }

    if (_provider === 'firebase') {
      // Production path — requires firebase package.
      // Uncomment and implement when ready:
      //
      // import { initializeApp } from 'firebase/app';
      // import { getDatabase, ref, onValue, increment, set, serverTimestamp } from 'firebase/database';
      //
      // const app = initializeApp(config.firebaseConfig);
      // const db = getDatabase(app);
      // const liveRef = ref(db, 'presence/liveCount');
      // const totalRef = ref(db, 'visits/total');
      // onValue(liveRef, (snap) => _notifyCount(snap.val() ?? 0));
      // onValue(totalRef, (snap) => _notifyTotal(snap.val() ?? 0));
      console.warn('[visitorService] Firebase provider not yet implemented – falling back to mock.');
      _provider = 'mock';
      _startMock();
    }
  },

  /**
   * Subscribe to live visitor count changes.
   * @param {(count: number) => void} callback
   */
  onVisitorCountChange(callback) {
    _visitorCountCallbacks.push(callback);
    // Immediately emit current value if available
    if (_mockCount !== undefined) callback(_mockCount);
    // Return unsubscribe function
    return () => {
      _visitorCountCallbacks = _visitorCountCallbacks.filter((cb) => cb !== callback);
    };
  },

  /**
   * Subscribe to total visit count changes.
   * @param {(total: number) => void} callback
   * @returns {() => void} unsubscribe function
   */
  onTotalVisitsChange(callback) {
    _totalVisitsCallbacks.push(callback);
    if (_mockTotal !== undefined) callback(_mockTotal);
    return () => {
      _totalVisitsCallbacks = _totalVisitsCallbacks.filter((cb) => cb !== callback);
    };
  },

  /** Record a session/visit (increment counters). */
  recordVisit() {
    if (_provider === 'mock') {
      _mockTotal += 1;
      _notifyTotal(_mockTotal);
      return;
    }
    // Firebase: increment visits/total using server-side increment
  },

  /** Clean up all subscriptions and timers. */
  disconnect() {
    _stopMock();
    _visitorCountCallbacks = [];
    _totalVisitsCallbacks = [];
  },
};

export default visitorService;
