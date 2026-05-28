import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the API services
jest.mock('../../services/api');

// App renders its own <BrowserRouter>, so we must NOT wrap it in another
// Router. Instead we drive the route via the browser history before rendering.
const setPath = (path: string) => {
  window.history.pushState({}, '', path);
};

describe('App Routing', () => {
  afterEach(() => {
    setPath('/');
  });

  it('should render home page at root path', () => {
    setPath('/');
    render(<App />);

    expect(screen.getByText('Scorecard App')).toBeInTheDocument();
    expect(
      screen.getByText(/Create or join a room to start tracking scores/)
    ).toBeInTheDocument();
  });

  it('should render room page at /room/:roomCode path', () => {
    setPath('/room/ABC123');
    render(<App />);

    // Should show loading initially while the room is fetched.
    expect(screen.getByText('Loading room...')).toBeInTheDocument();
  });

  it('should redirect to home for invalid paths', () => {
    setPath('/invalid-path');
    render(<App />);

    expect(screen.getByText('Scorecard App')).toBeInTheDocument();
  });
});
