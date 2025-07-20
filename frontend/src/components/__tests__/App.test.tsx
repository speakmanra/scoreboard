import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the API services
jest.mock('../../services/api');

describe('App Routing', () => {
  it('should render home page at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('🎲 Scorecard App')).toBeInTheDocument();
    expect(screen.getByText('Create or join a room to start tracking scores')).toBeInTheDocument();
  });

  it('should render room page at /room/:roomCode path', () => {
    render(
      <MemoryRouter initialEntries={['/room/ABC123']}>
        <App />
      </MemoryRouter>
    );
    
    // Should show loading initially
    expect(screen.getByText('Loading room...')).toBeInTheDocument();
  });

  it('should redirect to home for invalid paths', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-path']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText('🎲 Scorecard App')).toBeInTheDocument();
  });
}); 