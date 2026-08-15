import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Quotes from './Quotes';
import analyticsService from '../services/analyticsService';
import data from '../data/data.json';

vi.mock('../services/analyticsService', () => ({
  default: {
    pageView: vi.fn(),
  },
}));

describe('Quotes Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page headers and calls GA pageView event', () => {
    render(<Quotes />);
    expect(screen.getByText('Wisdom & Quotes')).toBeInTheDocument();
    expect(screen.getByText('Teachings from Jain scripture and philosophy')).toBeInTheDocument();
    expect(analyticsService.pageView).toHaveBeenCalledWith('/quotes', 'Quotes');
    expect(document.title).toContain('Wisdom');
  });

  it('renders list of quotes from data.json correctly', () => {
    render(<Quotes />);
    if (data.quotes.length > 0) {
      data.quotes.forEach(quote => {
        const textEl = screen.getByText(quote.text);
        expect(textEl).toBeInTheDocument();

        const quoteArticle = textEl.closest('.quote-item');
        expect(quoteArticle).toBeInTheDocument();

        expect(within(quoteArticle).getByText(quote.author, { exact: false })).toBeInTheDocument();
      });
    } else {
      expect(screen.getByText(/Quotes coming soon/i)).toBeInTheDocument();
    }
  });
});
