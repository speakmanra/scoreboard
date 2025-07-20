import React, { useState, useEffect, useCallback } from 'react';
import { scoreApi, playerApi, roomApi } from '../services/api';
import { Room, Score, Player, CreateScoreData } from '../types';
import YahtzeeScoreCard from './YahtzeeScoreCard';

interface ScoreCardProps {
  room: Room;
  currentPlayer: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ScoreCard: React.FC<ScoreCardProps> = ({ room, currentPlayer }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScore, setNewScore] = useState<CreateScoreData>({
    player: '',
    room: room.id,
    round_number: 1,
    score_value: 0,
    notes: '',
  });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [scoresData, playersData] = await Promise.all([
        scoreApi.getByRoom(room.id),
        playerApi.getByRoom(room.id),
      ]);
      setScores(scoresData);
      setPlayers(playersData);
    } catch (err) {
      showToast('Failed to load room data', 'error');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [room.id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore.player || newScore.score_value === 0) return;

    try {
      await scoreApi.create(newScore);
      setNewScore({
        player: '',
        room: room.id,
        round_number: getNextRoundNumber(),
        score_value: 0,
        notes: '',
      });
      showToast('Score added successfully!', 'success');
      loadData(); // Reload data to show new score
    } catch (err) {
      showToast('Failed to add score. Please try again.', 'error');
      console.error('Error adding score:', err);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setAddingPlayer(true);
    try {
      await roomApi.join(room.id, { name: newPlayerName });
      setNewPlayerName('');
      showToast(`Player "${newPlayerName}" added successfully!`, 'success');
      loadData(); // Reload data to show new player
    } catch (err) {
      showToast('Failed to add player. Please try again.', 'error');
      console.error('Error adding player:', err);
    } finally {
      setAddingPlayer(false);
    }
  };

  const getNextRoundNumber = (): number => {
    if (scores.length === 0) return 1;
    const maxRound = Math.max(...scores.map(s => s.round_number));
    return maxRound + 1;
  };

  const getPlayerTotal = (playerId: string): number => {
    return scores
      .filter(s => s.player === playerId)
      .reduce((total, score) => total + score.score_value, 0);
  };

  const getRoundScores = (roundNumber: number): Score[] => {
    return scores.filter(s => s.round_number === roundNumber);
  };

  const getUniqueRounds = (): number[] => {
    const roundNumbers = scores.map(s => s.round_number);
    const uniqueRounds = Array.from(new Set(roundNumbers));
    return uniqueRounds.sort((a, b) => a - b);
  };

  // Render Yahtzee-specific scorecard for Yahtzee games
  if (room.game_type === 'yahtzee') {
    return <YahtzeeScoreCard room={room} currentPlayer={currentPlayer} />;
  }

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div className="container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h1>{room.name}</h1>
        <p>Game Type: {room.game_type}</p>
        <div className="room-code">Room Code: {room.room_code}</div>
        
        <div className="score-grid">
          {players.map(player => (
            <div key={player.id} className="player-card">
              <h3>{player.name}</h3>
              <div className="total-score">
                Total: {getPlayerTotal(player.id)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Add Player</h2>
        <form onSubmit={handleAddPlayer}>
          <div className="form-group">
            <label htmlFor="playerName">Player Name</label>
            <input
              type="text"
              id="playerName"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              required
              placeholder="Enter player name"
            />
          </div>
          <button
            type="submit"
            className="btn"
            disabled={addingPlayer || !newPlayerName.trim()}
          >
            {addingPlayer ? 'Adding...' : 'Add Player'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Add Score</h2>
        <form onSubmit={handleAddScore}>
          <div className="form-group">
            <label htmlFor="player">Player</label>
            <select
              id="player"
              value={newScore.player}
              onChange={(e) => setNewScore(prev => ({ ...prev, player: e.target.value }))}
              required
            >
              <option value="">Select player</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="round_number">Round</label>
            <input
              type="number"
              id="round_number"
              value={newScore.round_number}
              onChange={(e) => setNewScore(prev => ({ ...prev, round_number: parseInt(e.target.value) }))}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="score_value">Score</label>
            <input
              type="number"
              id="score_value"
              value={newScore.score_value}
              onChange={(e) => setNewScore(prev => ({ ...prev, score_value: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <input
              type="text"
              id="notes"
              value={newScore.notes}
              onChange={(e) => setNewScore(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this round"
            />
          </div>

          <button type="submit" className="btn">
            Add Score
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Score History</h2>
        {getUniqueRounds().map(roundNumber => (
          <div key={roundNumber} style={{ marginBottom: '20px' }}>
            <h3>Round {roundNumber}</h3>
            <div className="score-grid">
              {getRoundScores(roundNumber).map(score => (
                <div key={score.id} className="player-card">
                  <h4>{score.player_name}</h4>
                  <div className="total-score">{score.score_value}</div>
                  {score.notes && <p style={{ fontSize: '14px', color: '#666' }}>{score.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreCard; 