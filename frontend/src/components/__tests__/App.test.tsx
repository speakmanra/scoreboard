import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import { roomApi } from '../../services/api';

// Mock the API services
jest.mock('../../services/api');
const mockRoomApi = roomApi as jest.Mocked<typeof roomApi>;

// App renders its own <BrowserRouter>, so tests drive routing through the jsdom
// history/location instead of wrapping it in another Router (which would throw
// "You cannot render a <Router> inside another <Router>").
const renderAt = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('App Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render home page at root path', () => {
    renderAt('/');

    expect(screen.getByText('Scorecard App')).toBeInTheDocument();
    expect(
      screen.getByText(/Create or join a room to start tracking scores/)
    ).toBeInTheDocument();
  });

  it('should render room page at /room/:roomCode path', () => {
    // Keep the room load pending so the component stays in its loading state
    // for the duration of the synchronous assertion.
    mockRoomApi.getByCode.mockReturnValue(new Promise<never>(() => {}));

    renderAt('/room/ABC123');

    // Should show loading initially while the room is fetched.
    expect(screen.getByText('Loading room...')).toBeInTheDocument();
  });

  it('should redirect to home for invalid paths', () => {
    renderAt('/invalid-path');

    expect(screen.getByText('Scorecard App')).toBeInTheDocument();
  });
});
