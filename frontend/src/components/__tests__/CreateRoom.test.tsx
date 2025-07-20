import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateRoom from '../CreateRoom';
import { roomApi } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockRoomApi = roomApi as jest.Mocked<typeof roomApi>;

describe('CreateRoom', () => {
  const mockOnRoomCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create room form', () => {
    render(<CreateRoom onRoomCreated={mockOnRoomCreated} />);
    
    expect(screen.getByText('Create New Room')).toBeInTheDocument();
    expect(screen.getByLabelText('Room Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Room' })).toBeInTheDocument();
  });

  it('creates a room successfully', async () => {
    const mockRoom = {
      id: '1',
      name: 'Test Room',
      game_type: 'yahtzee' as const,
      room_code: 'ABC12345',
      created_at: '2023-01-01T00:00:00Z',
      is_active: true,
      players: [],
      scores: [],
      player_count: 0,
    };

    mockRoomApi.create.mockResolvedValue(mockRoom);

    render(<CreateRoom onRoomCreated={mockOnRoomCreated} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });
    fireEvent.change(screen.getByLabelText('Game Type'), {
      target: { value: 'yahtzee' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Room' }));

    await waitFor(() => {
      expect(mockRoomApi.create).toHaveBeenCalledWith({
        name: 'Test Room',
        game_type: 'yahtzee',
      });
      expect(mockOnRoomCreated).toHaveBeenCalledWith('ABC12345');
    });
  });

  it('shows error message when room creation fails', async () => {
    mockRoomApi.create.mockRejectedValue(new Error('API Error'));

    render(<CreateRoom onRoomCreated={mockOnRoomCreated} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Room' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create room. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables submit button when form is empty', () => {
    render(<CreateRoom onRoomCreated={mockOnRoomCreated} />);
    
    const submitButton = screen.getByRole('button', { name: 'Create Room' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is filled', () => {
    render(<CreateRoom onRoomCreated={mockOnRoomCreated} />);
    
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });

    const submitButton = screen.getByRole('button', { name: 'Create Room' });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    mockRoomApi.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<CreateRoom onRoomCreated={mockOnRoomCreated} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Room' }));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });
}); 