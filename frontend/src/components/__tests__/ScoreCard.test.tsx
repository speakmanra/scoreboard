import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreCard from '../ScoreCard';
import YahtzeeScoreCard from '../YahtzeeScoreCard';
import { scoreApi, playerApi } from '../../services/api';
import { Room, Player } from '../../types';

// Mock the API
jest.mock('../../services/api');
const mockScoreApi = scoreApi as jest.Mocked<typeof scoreApi>;
const mockPlayerApi = playerApi as jest.Mocked<typeof playerApi>;

// Two players with similar names — the exact scenario that broke name-based
// identification ("Ryan" is a prefix of "Ryan2").
const RYAN: Player = {
  id: 'player-ryan-uuid',
  name: 'Ryan',
  room: 'room-1',
  joined_at: '2026-01-01T00:00:00Z',
  is_active: true,
};
const RYAN2: Player = {
  id: 'player-ryan2-uuid',
  name: 'Ryan2',
  room: 'room-1',
  joined_at: '2026-01-01T00:00:00Z',
  is_active: true,
};

const baseRoom: Room = {
  id: 'room-1',
  name: 'Test Room',
  game_type: 'tally',
  room_code: 'ABC12345',
  status: 'active',
  host: RYAN.id,
  created_at: '2026-01-01T00:00:00Z',
  is_active: true,
  players: [RYAN, RYAN2],
  scores: [],
  player_count: 2,
};

describe('ScoreCard — current player identification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScoreApi.getByRoom.mockResolvedValue([]);
    mockPlayerApi.getByRoom.mockResolvedValue([RYAN, RYAN2]);
  });

  it('tags the correct player as "(You)" by id, not by name prefix', async () => {
    // Current player is Ryan (id), even though "Ryan" is a prefix of "Ryan2".
    render(<ScoreCard room={baseRoom} currentPlayerId={RYAN.id} />);

    const badge = await screen.findByText('(You)');

    // The badge must live on Ryan's card, NOT Ryan2's.
    const card = badge.closest('.player-card');
    expect(card).toHaveClass('current-player');
    expect(card?.querySelector('h3')?.textContent).toBe('Ryan (You)');

    // Exactly one player is marked as "you".
    expect(screen.getAllByText('(You)')).toHaveLength(1);
  });

  it('marks no player when there is no current player id', async () => {
    render(<ScoreCard room={baseRoom} currentPlayerId="" />);

    await waitFor(() => expect(mockPlayerApi.getByRoom).toHaveBeenCalled());
    expect(screen.queryByText('(You)')).not.toBeInTheDocument();
  });
});

describe('YahtzeeScoreCard — current player identification', () => {
  const yahtzeeRoom: Room = { ...baseRoom, game_type: 'yahtzee' };

  beforeEach(() => {
    jest.clearAllMocks();
    // A non-empty score list flips the card into the started/table phase.
    mockScoreApi.getByRoom.mockResolvedValue([
      {
        id: 'score-1',
        player: RYAN.id,
        player_name: 'Ryan',
        room: 'room-1',
        round_number: 1,
        score_value: 5,
        notes: '',
        created_at: '2026-01-01T00:00:00Z',
        category: 'ones',
      },
    ]);
    mockPlayerApi.getByRoom.mockResolvedValue([RYAN, RYAN2]);
  });

  it('highlights the current player column header by id', async () => {
    render(<YahtzeeScoreCard room={yahtzeeRoom} currentPlayerId={RYAN.id} />);

    const badge = await screen.findByText('(You)');
    const header = badge.closest('th');
    expect(header).toHaveClass('current-player');
    expect(header?.textContent).toBe('Ryan (You)');
    expect(screen.getAllByText('(You)')).toHaveLength(1);
  });
});
