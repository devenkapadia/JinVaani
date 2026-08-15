import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import analyticsService from './analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    // Reset global state
    document.getElementById('ga4-script')?.remove();
    delete window.gtag;
    delete window.dataLayer;
  });

  afterEach(() => {
    document.getElementById('ga4-script')?.remove();
    delete window.gtag;
    delete window.dataLayer;
  });

  it('should not initialize gtag if enabled is false or missing config', () => {
    analyticsService.init({ enabled: false, ga4MeasurementId: 'G-12345' });
    expect(document.getElementById('ga4-script')).toBeNull();
    expect(window.gtag).toBeUndefined();
  });

  it('should initialize gtag script and declare globals when enabled', () => {
    analyticsService.init({ enabled: true, ga4MeasurementId: 'G-12345' });

    const script = document.getElementById('ga4-script');
    expect(script).not.toBeNull();
    expect(script.src).toContain('G-12345');
    expect(window.gtag).toBeTypeOf('function');
    expect(window.dataLayer).toBeInstanceOf(Array);
  });

  it('should forward event track calls when enabled', () => {
    analyticsService.init({ enabled: true, ga4MeasurementId: 'G-12345' });

    // Spy on window.gtag
    const spy = vi.spyOn(window, 'gtag');

    analyticsService.pageView('/home', 'Homepage');
    expect(spy).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/home',
      page_title: 'Homepage',
    });

    analyticsService.songPlayed('song-1', 'Namookar Mantra', 'pl-1');
    expect(spy).toHaveBeenCalledWith('event', 'song_played', {
      song_id: 'song-1',
      song_title: 'Namookar Mantra',
      playlist_id: 'pl-1',
    });
  });
});
