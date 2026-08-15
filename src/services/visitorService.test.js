import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import visitorService from './visitorService';

describe('visitorService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Ensure standard clean starting state
    visitorService.disconnect();
  });

  afterEach(() => {
    visitorService.disconnect();
    vi.useRealTimers();
  });

  it('should initialize with mock provider and emit initial values', () => {
    const tracker = vi.fn();
    const totalTracker = vi.fn();

    visitorService.init({ provider: 'mock' });

    const unsubCount = visitorService.onVisitorCountChange(tracker);
    const unsubTotal = visitorService.onTotalVisitsChange(totalTracker);

    expect(tracker).toHaveBeenCalled();
    expect(totalTracker).toHaveBeenCalled();

    // Check count is a positive number
    const initialCount = tracker.mock.calls[0][0];
    expect(initialCount).toBeGreaterThanOrEqual(15);
    expect(initialCount).toBeLessThanOrEqual(35);

    unsubCount();
    unsubTotal();
  });

  it('should handle recordVisit', () => {
    visitorService.init({ provider: 'mock' });

    let latestTotal = 0;
    const unsub = visitorService.onTotalVisitsChange((total) => {
      latestTotal = total;
    });

    const initialTotal = latestTotal;
    visitorService.recordVisit();

    expect(latestTotal).toBe(initialTotal + 1);
    unsub();
  });

  it('should unsubscribe correctly when unsub function is called', () => {
    const tracker = vi.fn();
    visitorService.init({ provider: 'mock' });

    const unsub = visitorService.onVisitorCountChange(tracker);
    
    // Clear initial call
    tracker.mockClear();

    // Trigger unsubscribe
    unsub();

    // Advance time and check if tracker is not called
    vi.advanceTimersByTime(20000);
    expect(tracker).not.toHaveBeenCalled();
  });
});
