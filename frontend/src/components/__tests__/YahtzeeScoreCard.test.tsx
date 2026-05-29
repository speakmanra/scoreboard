import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YahtzeeScoreCard from '../YahtzeeScoreCard';
import { scoreApi, playerApi } from '../../services/api';
import { Room, Player, Score } from '../../types';

// Mock the API layer so the component renders against deterministic data.
jest.mock('../../services/api');
const mockScoreApi = scoreApi as jest.Mocked<typeof scoreApi>;
const mockPlayerApi = playerApi as jest.Mocked<typeof playerApi>;

const room: Room = {
  id: 'room-1',
  name: 'Game Night',
  game_type: 'yahtzee',
  room_code: 'ABC12345',
  created_at: '2026-01-01T00:00:00Z',
  is_active: true,
  players: [],
  scores: [],
  player_count: 2,
};

const players: Player[] = [
  { id: 'p-alice', name: 'Alice', room: 'room-1', joined_at: '2026-01-01T00:00:00Z', is_active: true },
  { id: 'p-bob', name: 'Bob', room: 'room-1', joined_at: '2026-01-01T00:00:00Z', is_active: true },
];

// At least one score forces the component into the game (scoring) phase.
const scores: Score[] = [
  {
    id: 's-1',
    player: 'p-alice',
    player_name: 'Alice',
    room: 'room-1',
    round_number: 1,
    score_value: 3,
    notes: 'Ones: 3',
    created_at: '2026-01-01T00:00:00Z',
    category: 'ones',
  },
];

describe('YahtzeeScoreCard cell ownership', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayerApi.getByRoom.mockResolvedValue(players);
    mockScoreApi.getByRoom.mockResolvedValue(scores);
  });

  it("lets a joined player edit only their own column", async () => {
    render(<YahtzeeScoreCard room={room} currentPlayerId="p-alice" />);

    // Wait for the scoring grid to render.
    await screen.findByText('Yahtzee Scorecard');

    // The current player's column header is marked, the opponent's is not.
    // The name and the "(You)" badge render as separate nodes, so assert each.
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Bob (You)')).not.toBeInTheDocument();

    // Bob's cells are locked for Alice.
    const bobCells = screen.getAllByTitle('You can only edit your own scores');
    expect(bobCells.length).toBeGreaterThan(0);

    // Clicking a locked cell does not open an editor; it warns instead.
    fireEvent.click(bobCells[0]);
    expect(await screen.findByText('You can only edit your own scores.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter score')).not.toBeInTheDocument();

    // Clicking one of Alice's own cells opens the editor.
    const aliceCells = screen.getAllByTitle('Click to add score');
    fireEvent.click(aliceCells[0]);
    expect(screen.getByPlaceholderText('Enter score')).toBeInTheDocument();
  });

  it('lets a viewer with no resolved identity edit any column (scorekeeper)', async () => {
    render(<YahtzeeScoreCard room={room} currentPlayerId="" />);

    await screen.findByText('Yahtzee Scorecard');

    // No column is flagged as "(You)" and nothing is locked.
    expect(screen.queryByText(/\(You\)/)).not.toBeInTheDocument();
    expect(screen.queryByTitle('You can only edit your own scores')).not.toBeInTheDocument();

    // Every empty cell across both players is editable.
    const editableCells = screen.getAllByTitle('Click to add score');
    fireEvent.click(editableCells[editableCells.length - 1]);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter score')).toBeInTheDocument();
    });
  });
});
