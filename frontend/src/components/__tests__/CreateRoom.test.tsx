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
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create room form', () => {
    render(<CreateRoom onRoomCreated={mockOnRoomCreated} showToast={mockShowToast} />);

    expect(screen.getByText('Create New Room')).toBeInTheDocument();
    expect(screen.getByLabelText('Room Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
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

    const mockPlayer = {
      id: 'player-1',
      name: 'Ryan',
      room: '1',
      joined_at: '2023-01-01T00:00:00Z',
      is_active: true,
    };

    mockRoomApi.create.mockResolvedValue(mockRoom);
    mockRoomApi.join.mockResolvedValue(mockPlayer);

    render(<CreateRoom onRoomCreated={mockOnRoomCreated} showToast={mockShowToast} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });
    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Ryan' },
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
      // The creator joins their own room as the first player.
      expect(mockRoomApi.join).toHaveBeenCalledWith('1', { name: 'Ryan' });
      // The component forwards the Room and the creator's player id to its parent.
      expect(mockOnRoomCreated).toHaveBeenCalledWith(mockRoom, 'player-1');
    });
  });

  it('shows error message when room creation fails', async () => {
    mockRoomApi.create.mockRejectedValue(new Error('API Error'));

    render(<CreateRoom onRoomCreated={mockOnRoomCreated} showToast={mockShowToast} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });
    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Ryan' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Room' }));

    // Errors surface through the Toast context, not inline text.
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to create room. Please try again.',
        'error'
      );
    });
  });

  it('disables submit button when form is empty', () => {
    render(<CreateRoom onRoomCreated={mockOnRoomCreated} showToast={mockShowToast} />);

    const submitButton = screen.getByRole('button', { name: 'Create Room' });
    expect(submitButton).toBeDisabled();
  });

  it('keeps submit disabled until both room name and your name are filled', () => {
    render(<CreateRoom onRoomCreated={mockOnRoomCreated} showToast={mockShowToast} />);

    const submitButton = screen.getByRole('button', { name: 'Create Room' });

    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });
    // Room name alone is not enough; the creator's name is also required.
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Ryan' },
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    mockRoomApi.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<CreateRoom onRoomCreated={mockOnRoomCreated} showToast={mockShowToast} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Room Name'), {
      target: { value: 'Test Room' },
    });
    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Ryan' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Room' }));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });
}); 