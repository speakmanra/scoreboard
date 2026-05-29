import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lobby from '../Lobby';
import { roomApi } from '../../services/api';
import { Room, Player } from '../../types';

// Mock the API so the start action is observable without a real backend.
jest.mock('../../services/api');
const mockRoomApi = roomApi as jest.Mocked<typeof roomApi>;

const HOST: Player = {
  id: 'p-host',
  name: 'Ryan',
  room: 'room-1',
  joined_at: '2026-01-01T00:00:00Z',
  is_active: true,
};
const GUEST: Player = {
  id: 'p-guest',
  name: 'Sam',
  room: 'room-1',
  joined_at: '2026-01-01T00:01:00Z',
  is_active: true,
};

const room: Room = {
  id: 'room-1',
  name: 'Game Night',
  game_type: 'yahtzee',
  room_code: 'ABC12345',
  status: 'lobby',
  host: HOST.id,
  created_at: '2026-01-01T00:00:00Z',
  is_active: true,
  players: [HOST, GUEST],
  scores: [],
  player_count: 2,
};

describe('Lobby', () => {
  const onStarted = jest.fn();
  const showToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets the host start the game and notifies the parent', async () => {
    mockRoomApi.start.mockResolvedValue({ ...room, status: 'active' });

    render(
      <Lobby room={room} currentPlayerId={HOST.id} onStarted={onStarted} showToast={showToast} />
    );

    const startButton = screen.getByRole('button', { name: /Start Game/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockRoomApi.start).toHaveBeenCalledWith('room-1', HOST.id);
      expect(onStarted).toHaveBeenCalled();
    });
  });

  it('shows a waiting message to non-host players and no start control', () => {
    render(
      <Lobby room={room} currentPlayerId={GUEST.id} onStarted={onStarted} showToast={showToast} />
    );

    expect(screen.getByText(/Waiting for the host to start/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start Game/i })).not.toBeInTheDocument();
  });

  it('lists joined players and marks the current player as (You)', () => {
    render(
      <Lobby room={room} currentPlayerId={GUEST.id} onStarted={onStarted} showToast={showToast} />
    );

    expect(screen.getByText('Ryan')).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });
});
