import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MusicPlayerProvider, useMusicPlayer } from './MusicPlayerContext';
import { useEffect } from 'react';

// Help component to consume the music player context in tests
function TestComponent({ onMount }) {
  const player = useMusicPlayer();
  useEffect(() => {
    if (onMount) onMount(player);
  }, [player, onMount]);

  return (
    <div>
      <span data-testid="is-playing">{player.isPlaying ? 'true' : 'false'}</span>
      <span data-testid="volume">{player.volume}</span>
    </div>
  );
}

describe('MusicPlayerContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock YT window global
    window.YT = {
      Player: vi.fn().mockImplementation(function(id, config) {
        // Trigger onReady asynchronously
        setTimeout(() => {
          if (config.events && config.events.onReady) {
            config.events.onReady({
              target: {
                setVolume: vi.fn(),
                playVideo: vi.fn(),
                pauseVideo: vi.fn(),
                loadVideoById: vi.fn(),
                loadPlaylist: vi.fn(),
                getCurrentTime: vi.fn().mockReturnValue(12),
                getDuration: vi.fn().mockReturnValue(120),
              },
            });
          }
        }, 10);

        return {
          setVolume: vi.fn(),
          loadVideoById: vi.fn(),
          loadPlaylist: vi.fn(),
          playVideo: vi.fn(),
          pauseVideo: vi.fn(),
          getCurrentTime: vi.fn().mockReturnValue(12),
          getDuration: vi.fn().mockReturnValue(120),
        };
      }),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
  });

  it('should initialize player and read default settings', async () => {
    let playerRef = null;

    render(
      <MusicPlayerProvider>
        <TestComponent
          onMount={(player) => {
            playerRef = player;
          }}
        />
      </MusicPlayerProvider>
    );

    // Fast forward to resolve the YT.Player construction wait
    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(window.YT.Player).toHaveBeenCalled();
    expect(playerRef).not.toBeNull();
    expect(playerRef.volume).toBe(80);
    expect(screen.getByTestId('volume').textContent).toBe('80');
  });

  it('should allow setting volume', async () => {
    let playerRef = null;

    render(
      <MusicPlayerProvider>
        <TestComponent
          onMount={(player) => {
            playerRef = player;
          }}
        />
      </MusicPlayerProvider>
    );

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    act(() => {
      playerRef.setVolume(50);
    });

    expect(playerRef.volume).toBe(50);
    expect(screen.getByTestId('volume').textContent).toBe('50');
  });
});
