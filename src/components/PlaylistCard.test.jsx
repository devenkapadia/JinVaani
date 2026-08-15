import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlaylistCard from './PlaylistCard';
import * as MusicPlayerContext from '../context/MusicPlayerContext';
import analyticsService from '../services/analyticsService';

vi.mock('../services/analyticsService', () => ({
  default: {
    playlistPlayed: vi.fn(),
    playlistOpened: vi.fn(),
  },
}));

vi.mock('../context/MusicPlayerContext', () => ({
  useMusicPlayer: vi.fn(),
}));

describe('PlaylistCard Component', () => {
  const dummyPlaylist = {
    id: 'test-playlist',
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    icon: '🌸',
    backgroundImages: [],
  };

  it('renders playlist card styling and details', () => {
    vi.mocked(MusicPlayerContext.useMusicPlayer).mockReturnValue({
      loadPlaylist: vi.fn(),
      currentPlaylist: null,
      isPlaying: false,
    });

    render(<PlaylistCard playlist={dummyPlaylist} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays static rendering and buttons correctly when active playlist is playing', () => {
    vi.mocked(MusicPlayerContext.useMusicPlayer).mockReturnValue({
      loadPlaylist: vi.fn(),
      currentPlaylist: { id: 'test-playlist' },
      isPlaying: true,
    });

    render(<PlaylistCard playlist={dummyPlaylist} />);

    expect(screen.getByText('Now Playing')).toBeInTheDocument();
    // Play button should show Pause symbol (⏸) when selected playlist is playing
    expect(screen.getByRole('button', { name: 'Play Test Subtitle' }).textContent).toBe('⏸');
  });

  it('handles play click and triggers analytics', () => {
    const mockLoadPlaylist = vi.fn();
    const mockOnClick = vi.fn();
    vi.mocked(MusicPlayerContext.useMusicPlayer).mockReturnValue({
      loadPlaylist: mockLoadPlaylist,
      currentPlaylist: null,
      isPlaying: false,
    });

    render(<PlaylistCard playlist={dummyPlaylist} onClick={mockOnClick} />);

    const playBtn = screen.getByRole('button', { name: 'Play Test Subtitle' });
    fireEvent.click(playBtn);

    expect(analyticsService.playlistPlayed).toHaveBeenCalledWith('test-playlist');
    expect(mockLoadPlaylist).toHaveBeenCalledWith(dummyPlaylist);
    expect(mockOnClick).toHaveBeenCalledWith(dummyPlaylist);
  });

  it('handles click on card background and triggers open analytics', () => {
    const mockOnClick = vi.fn();
    vi.mocked(MusicPlayerContext.useMusicPlayer).mockReturnValue({
      loadPlaylist: vi.fn(),
      currentPlaylist: null,
      isPlaying: false,
    });

    const { container } = render(<PlaylistCard playlist={dummyPlaylist} onClick={mockOnClick} />);
    
    // Click of enclosing article
    const article = container.querySelector('article');
    fireEvent.click(article);

    expect(analyticsService.playlistOpened).toHaveBeenCalledWith('test-playlist', 'Test Title');
    expect(mockOnClick).toHaveBeenCalledWith(dummyPlaylist);
  });
});
