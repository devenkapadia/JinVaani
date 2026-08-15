import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LiveVisitors from './LiveVisitors';
import visitorService from '../services/visitorService';

// Mock the visitorService module
vi.mock('../services/visitorService', () => {
  let callback = null;
  return {
    default: {
      onVisitorCountChange: vi.fn((cb) => {
        callback = cb;
        cb(42); // initial call
        return vi.fn();
      }),
      // Helper to trigger updates inside tests
      triggerUpdate: (n) => {
        if (callback) callback(n);
      }
    }
  };
});

describe('LiveVisitors Component', () => {
  it('should render nothing if visitor count is null', () => {
    // Temporarily make the mock return unsubscribe without initial callback execution
    const originalMock = visitorService.onVisitorCountChange;
    visitorService.onVisitorCountChange.mockImplementationOnce(() => {
      return vi.fn();
    });

    const { container } = render(<LiveVisitors />);
    expect(container.firstChild).toBeNull();

    // Restore original mock
    visitorService.onVisitorCountChange = originalMock;
  });

  it('should display the visitor count call and Hindi label by default', () => {
    render(<LiveVisitors />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/लोग JinVaani सुन रहे हैं/)).toBeInTheDocument();
  });

  it('should render with optional label override', () => {
    render(<LiveVisitors label="devotees online" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText(/devotees online/)).toBeInTheDocument();
  });

  it('should render with dark background overrides style when dark prop is true', () => {
    const { container } = render(<LiveVisitors dark={true} />);
    const span = container.querySelector('.live-visitors');
    expect(span).toBeInTheDocument();
    expect(span.style.background).toContain('rgba(30, 18, 8, 0.55)');
  });
});
