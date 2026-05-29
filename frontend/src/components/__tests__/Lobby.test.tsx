import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lobby from '../Lobby';
import { roomApi } from '../../services/api';
import { Room, Player } from '../../types';

// Mock the API layer so the lobby renders against deterministic data.
jest.mock('../../services/api');
const mockRoomApi = roomApi as jest.Mocked<typeof roomApi>;

const HOST: Player = {
  id: 'player-host-uuid',
  name: 'Alice',
  room: 'room-1',
  joined_at: '2026-01-01T00:00:00Z',
  is_active: true,
};
const GUEST: Player = {
  id: 'player-guest-uuid',
  name: 'Bob',
  room: 'room-1',
  joined_at: '2026-01-01T00:01:00Z',
  is_active: true,
};

const lobbyRoom: Room = {
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
  const showToast = jest.fn();
  const onStarted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists joined players and marks the current player as "(You)"', () => {
    render(
      <Lobby room={lobbyRoom} currentPlayerId={GUEST.id} onStarted={onStarted} showToast={showToast} />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.getAllByText('(You)')).toHaveLength(1);
  });

  it('shows the Start Game button only to the host', () => {
    render(
      <Lobby room={lobbyRoom} currentPlayerId={HOST.id} onStarted={onStarted} showToast={showToast} />
    );

    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    expect(screen.queryByText(/waiting for the host/i)).not.toBeInTheDocument();
  });

  it('shows a waiting message to non-host players', () => {
    render(
      <Lobby room={lobbyRoom} currentPlayerId={GUEST.id} onStarted={onStarted} showToast={showToast} />
    );

    expect(screen.queryByRole('button', { name: /start game/i })).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for the host/i)).toBeInTheDocument();
  });

  it('starts the game via the API and notifies the parent', async () => {
    mockRoomApi.start.mockResolvedValue({ ...lobbyRoom, status: 'active' });

    render(
      <Lobby room={lobbyRoom} currentPlayerId={HOST.id} onStarted={onStarted} showToast={showToast} />
    );

    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    await waitFor(() => expect(mockRoomApi.start).toHaveBeenCalledWith('room-1', HOST.id));
    await waitFor(() => expect(onStarted).toHaveBeenCalled());
  });
});
