/**
 * visitorService.js
 * Realtime visitor presence using Firebase Realtime Database.
 *
 * provider: "mock"     → local dev simulation (default)
 * provider: "firebase" → Firebase Realtime Database (production)
 *
 * Firebase structure:
 *   /presence/<sessionId>  → true  (ephemeral – auto-deleted on disconnect)
 *   /visits/total          → number (ever-incrementing)
 */

let _visitorCountCallbacks = [];
let _totalVisitsCallbacks  = [];
let _mockIntervalId        = null;
let _provider              = 'mock';

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
  _notifyCount(_mockCount);
  _notifyTotal(_mockTotal);

  const tick = () => {
    const delta = Math.floor(Math.random() * 7) - 3; // −3 to +3
    _mockCount  = Math.max(1, _mockCount + delta);
    _mockTotal += Math.floor(Math.random() * 3);
    _notifyCount(_mockCount);
    _notifyTotal(_mockTotal);
    const next = (Math.random() * 7 + 8) * 1000;
    _mockIntervalId = setTimeout(tick, next);
  };

  _mockIntervalId = setTimeout(tick, (Math.random() * 7 + 8) * 1000);
}

function _stopMock() {
  if (_mockIntervalId) {
    clearTimeout(_mockIntervalId);
    _mockIntervalId = null;
  }
}

// ── Firebase implementation ──────────────────────────────────────────────────
let _firebaseUnsubs = []; // cleanup functions for onValue listeners

async function _startFirebase(firebaseConfig) {
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const {
      getDatabase, ref, onValue, set, remove, onDisconnect,
      runTransaction, serverTimestamp,
    } = await import('firebase/database');

    // Initialise only once (handles HMR re-runs)
    const app = getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig);

    const db = getDatabase(app);

    // ── Live presence ────────────────────────────────────────────────────────
    // Each session registers under /presence/<uid>. Firebase auto-removes it
    // on disconnect so the count stays accurate even on tab-close / crash.
    const uid = crypto.randomUUID();
    const presenceRef = ref(db, `presence/${uid}`);
    await set(presenceRef, true);
    onDisconnect(presenceRef).remove();

    // Watch /presence and count children → live visitor count
    const presenceRootRef = ref(db, 'presence');
    const unsubPresence = onValue(presenceRootRef, (snap) => {
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      _notifyCount(count);
    });
    _firebaseUnsubs.push(unsubPresence);

    // ── Total visit counter ──────────────────────────────────────────────────
    // Increment on every session start using a transaction (race-safe).
    const totalRef = ref(db, 'visits/total');
    await runTransaction(totalRef, (current) => (current ?? 0) + 1);

    // Subscribe to total for live updates
    const unsubTotal = onValue(totalRef, (snap) => {
      _notifyTotal(snap.val() ?? 0);
    });
    _firebaseUnsubs.push(unsubTotal);

  } catch (err) {
    console.warn('[visitorService] Firebase init failed – falling back to mock.', err);
    _provider = 'mock';
    _startMock();
  }
}

function _stopFirebase() {
  _firebaseUnsubs.forEach((unsub) => unsub());
  _firebaseUnsubs = [];
}

// ── Public service object ────────────────────────────────────────────────────
const visitorService = {
  /**
   * Initialise with provider config from data.json.
   * @param {{ provider: string, firebaseConfig?: object }} config
   */
  init(config) {
    _provider = config?.provider ?? 'mock';

    if (_provider === 'firebase') {
      _startFirebase(config.firebaseConfig);
      return;
    }

    _startMock();
  },

  /**
   * Subscribe to live visitor count changes.
   * @param {(count: number) => void} callback
   * @returns {() => void} unsubscribe
   */
  onVisitorCountChange(callback) {
    _visitorCountCallbacks.push(callback);
    if (_mockCount !== undefined && _provider === 'mock') callback(_mockCount);
    return () => {
      _visitorCountCallbacks = _visitorCountCallbacks.filter((cb) => cb !== callback);
    };
  },

  /**
   * Subscribe to total visit count changes.
   * @param {(total: number) => void} callback
   * @returns {() => void} unsubscribe
   */
  onTotalVisitsChange(callback) {
    _totalVisitsCallbacks.push(callback);
    if (_mockTotal !== undefined && _provider === 'mock') callback(_mockTotal);
    return () => {
      _totalVisitsCallbacks = _totalVisitsCallbacks.filter((cb) => cb !== callback);
    };
  },

  /** @deprecated — total is now auto-incremented in init() for firebase */
  recordVisit() {
    if (_provider === 'mock') {
      _mockTotal += 1;
      _notifyTotal(_mockTotal);
    }
    // Firebase: handled inside _startFirebase via runTransaction
  },

  /** Clean up all subscriptions and timers. */
  disconnect() {
    _stopMock();
    _stopFirebase();
    _visitorCountCallbacks = [];
    _totalVisitsCallbacks  = [];
  },
};

export default visitorService;
