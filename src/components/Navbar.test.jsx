import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import data from '../data/data.json';

describe('Navbar Component', () => {
  it('should render brand name, tagline and navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    // Verify Brand Name & Tagline
    expect(screen.getByText(data.site.name)).toBeInTheDocument();
    
    // Verify Links from data.json are rendered
    data.navbarLinks.forEach(link => {
      const desktopLinks = screen.getAllByText(link.label);
      expect(desktopLinks.length).toBeGreaterThan(0);
    });
  });

  it('should toggle mobile menu drawer on hamburger click', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    expect(menuBtn).toBeInTheDocument();
    
    const drawer = screen.getByRole('dialog', { name: /mobile navigation/i });
    expect(drawer).not.toHaveClass('open');

    // Click to Open Drawer
    fireEvent.click(menuBtn);
    expect(drawer).toHaveClass('open');
    expect(menuBtn).toHaveAttribute('aria-label', 'Close menu');

    // Click to Close Drawer
    fireEvent.click(menuBtn);
    expect(drawer).not.toHaveClass('open');
  });

  it('should close drawer when clicking a link inside it', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);
    const drawer = screen.getByRole('dialog', { name: /mobile navigation/i });
    expect(drawer).toHaveClass('open');

    // Select the link specifically inside the mobile drawer/dialog and click it
    const drawerLink = within(drawer).getByRole('link', { name: new RegExp(data.navbarLinks[0].label, 'i') });
    fireEvent.click(drawerLink);

    // Drawer should have closed
    expect(drawer).not.toHaveClass('open');
  });
});
