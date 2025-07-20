import React, { useState, useEffect, useCallback } from 'react';
import { scoreApi, playerApi, roomApi } from '../services/api';
import { Room, Score, Player, CreateScoreData, YahtzeeCategory } from '../types';

interface YahtzeeScoreCardProps {
  room: Room;
  currentPlayer: string;
}

const YAHTZEE_CATEGORIES: { key: YahtzeeCategory; label: string; description: string }[] = [
  { key: 'ones', label: 'Ones', description: 'Sum of all 1s' },
  { key: 'twos', label: 'Twos', description: 'Sum of all 2s' },
  { key: 'threes', label: 'Threes', description: 'Sum of all 3s' },
  { key: 'fours', label: 'Fours', description: 'Sum of all 4s' },
  { key: 'fives', label: 'Fives', description: 'Sum of all 5s' },
  { key: 'sixes', label: 'Sixes', description: 'Sum of all 6s' },
  { key: 'three_of_a_kind', label: '3 of a Kind', description: 'Sum of all dice' },
  { key: 'four_of_a_kind', label: '4 of a Kind', description: 'Sum of all dice' },
  { key: 'full_house', label: 'Full House', description: '25 points' },
  { key: 'small_straight', label: 'Small Straight', description: '30 points' },
  { key: 'large_straight', label: 'Large Straight', description: '40 points' },
  { key: 'yahtzee', label: 'Yahtzee', description: '50 points' },
  { key: 'chance', label: 'Chance', description: 'Sum of all dice' },
];

interface EditingCell {
  playerId: string;
  category: YahtzeeCategory;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const YahtzeeScoreCard: React.FC<YahtzeeScoreCardProps> = ({ room, currentPlayer }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingValue, setEditingValue] = useState('');
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
      
      // Check if game has started (if there are any scores)
      setGameStarted(scoresData.length > 0);
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

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setAddingPlayer(true);
    try {
      await roomApi.join(room.id, { name: newPlayerName });
      setNewPlayerName('');
      showToast(`Player "${newPlayerName}" added successfully!`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to add player. Please try again.', 'error');
      console.error('Error adding player:', err);
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleStartGame = () => {
    if (players.length >= 1) {
      setGameStarted(true);
      showToast('Game started! You can now begin scoring.', 'success');
    }
  };

  const handleCellClick = (playerId: string, category: YahtzeeCategory) => {
    const existingScore = getPlayerScore(playerId, category);
    setEditingCell({ playerId, category });
    setEditingValue(existingScore ? existingScore.score_value.toString() : '');
  };

  const handleCellEdit = async () => {
    if (!editingCell || !editingValue || isNaN(Number(editingValue))) return;

    try {
      const existingScore = getPlayerScore(editingCell.playerId, editingCell.category);
      const scoreValue = parseInt(editingValue);
      const notes = `${YAHTZEE_CATEGORIES.find(c => c.key === editingCell.category)?.label}: ${editingValue}`;

      if (existingScore) {
        // Update existing score
        await scoreApi.update(existingScore.id, {
          score_value: scoreValue,
          notes: notes,
        });
        showToast(`Score updated to ${editingValue} successfully!`, 'success');
      } else {
        // Create new score
        const newScore: CreateScoreData = {
          player: editingCell.playerId,
          room: room.id,
          round_number: 1,
          score_value: scoreValue,
          category: editingCell.category,
          notes: notes,
        };
        await scoreApi.create(newScore);
        showToast(`Score ${editingValue} added successfully!`, 'success');
      }
      
      setEditingCell(null);
      setEditingValue('');
      loadData();
    } catch (err) {
      showToast('Failed to save score. Please try again.', 'error');
      console.error('Error saving score:', err);
    }
  };

  const handleCellKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditingValue('');
    }
  };

  const getPlayerScore = (playerId: string, category: YahtzeeCategory): Score | null => {
    return scores.find(s => s.player === playerId && s.category === category) || null;
  };

  const getPlayerTotal = (playerId: string): number => {
    const scoresTotal = scores
      .filter(s => s.player === playerId)
      .reduce((total, score) => total + score.score_value, 0);
    const bonus = getUpperSectionBonus(playerId);
    return scoresTotal + bonus;
  };

  const getUpperSectionTotal = (playerId: string): number => {
    const upperCategories: YahtzeeCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    return scores
      .filter(s => s.player === playerId && upperCategories.includes(s.category as YahtzeeCategory))
      .reduce((total, score) => total + score.score_value, 0);
  };

  const getUpperSectionBonus = (playerId: string): number => {
    const upperTotal = getUpperSectionTotal(playerId);
    return upperTotal >= 63 ? 35 : 0;
  };

  const getLowerSectionTotal = (playerId: string): number => {
    const lowerCategories: YahtzeeCategory[] = [
      'three_of_a_kind', 'four_of_a_kind', 'full_house', 
      'small_straight', 'large_straight', 'yahtzee', 'chance'
    ];
    return scores
      .filter(s => s.player === playerId && lowerCategories.includes(s.category as YahtzeeCategory))
      .reduce((total, score) => total + score.score_value, 0);
  };

  const renderScoreCell = (playerId: string, category: YahtzeeCategory) => {
    const score = getPlayerScore(playerId, category);
    const isEditing = editingCell?.playerId === playerId && editingCell?.category === category;

    if (isEditing) {
      return (
        <td key={playerId} className="editing-cell">
          <input
            type="number"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onKeyDown={handleCellKeyPress}
            onBlur={handleCellEdit}
            autoFocus
            className="cell-input"
            placeholder="Enter score"
          />
        </td>
      );
    }

    return (
      <td 
        key={playerId} 
        className={score ? 'filled clickable' : 'empty clickable'}
        onClick={() => handleCellClick(playerId, category)}
        title={score ? `Click to edit (current: ${score.score_value})` : 'Click to add score'}
      >
        {score ? score.score_value : '-'}
      </td>
    );
  };

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
      </div>

      {!gameStarted ? (
        // Setup Phase - Add Players
        <div className="card">
          <h2>Game Setup - Add Players</h2>
          <p>Add all players before starting the game. You need at least 1 player to begin.</p>
          
          <div className="player-list">
            <h3>Current Players ({players.length})</h3>
            {players.length === 0 ? (
              <p>No players added yet.</p>
            ) : (
              <ul>
                {players.map(player => (
                  <li key={player.id}>{player.name}</li>
                ))}
              </ul>
            )}
          </div>

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

          {players.length >= 1 && (
            <div className="start-game-section">
              <button
                onClick={handleStartGame}
                className="btn btn-success"
                style={{ marginTop: '20px' }}
              >
                🎲 Start Yahtzee Game
              </button>
            </div>
          )}
        </div>
      ) : (
        // Game Phase - Direct Cell Editing
        <div className="card">
          <h2>Yahtzee Scorecard</h2>
          <p className="scorecard-instructions">
            Click on any cell to enter or edit a score. Press Enter to save or Escape to cancel.
          </p>
          
          <div className="yahtzee-scorecard">
            <table className="scorecard-table">
              <thead>
                <tr>
                  <th>Category</th>
                  {players.map(player => (
                    <th key={player.id}>{player.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Upper Section */}
                <tr className="section-header">
                  <td colSpan={players.length + 1}><strong>Upper Section</strong></td>
                </tr>
                {YAHTZEE_CATEGORIES.slice(0, 6).map(category => (
                  <tr key={category.key}>
                    <td>{category.label}</td>
                    {players.map(player => renderScoreCell(player.id, category.key))}
                  </tr>
                ))}
                <tr className="subtotal">
                  <td><strong>Upper Section Total</strong></td>
                  {players.map(player => (
                    <td key={player.id}>
                      <strong>{getUpperSectionTotal(player.id)}</strong>
                    </td>
                  ))}
                </tr>
                <tr className="bonus">
                  <td><strong>Upper Section Bonus</strong></td>
                  {players.map(player => {
                    const bonus = getUpperSectionBonus(player.id);
                    return (
                      <td key={player.id}>
                        <strong className={bonus > 0 ? 'bonus-earned' : 'bonus-missed'}>
                          {bonus > 0 ? `+${bonus}` : '-'}
                        </strong>
                      </td>
                    );
                  })}
                </tr>

                {/* Lower Section */}
                <tr className="section-header">
                  <td colSpan={players.length + 1}><strong>Lower Section</strong></td>
                </tr>
                {YAHTZEE_CATEGORIES.slice(6).map(category => (
                  <tr key={category.key}>
                    <td>{category.label}</td>
                    {players.map(player => renderScoreCell(player.id, category.key))}
                  </tr>
                ))}
                <tr className="subtotal">
                  <td><strong>Lower Section Total</strong></td>
                  {players.map(player => (
                    <td key={player.id}>
                      <strong>{getLowerSectionTotal(player.id)}</strong>
                    </td>
                  ))}
                </tr>

                {/* Grand Total */}
                <tr className="grand-total">
                  <td><strong>GRAND TOTAL</strong></td>
                  {players.map(player => (
                    <td key={player.id}>
                      <strong>{getPlayerTotal(player.id)}</strong>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default YahtzeeScoreCard; 