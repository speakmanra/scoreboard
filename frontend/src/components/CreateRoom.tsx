import React, { useState } from 'react';
import { roomApi } from '../services/api';
import { CreateRoomData } from '../types';

interface CreateRoomProps {
  // The creator is added to the new room as its first player, so we forward
  // both the Room and that player's UUID to the parent for navigation.
  onRoomCreated: (room: any, playerId: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated, showToast }) => {
  const [formData, setFormData] = useState<CreateRoomData>({
    name: '',
    game_type: 'yahtzee',
  });
  // The room creator's own player name. They join their new room as the first
  // player so they get their own scorecard column (and can be identified as
  // "you" for the edit-your-own-column restriction).
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const room = await roomApi.create(formData);
      // Immediately join the new room as the creator so they have a column of
      // their own. The join endpoint returns the Player with its stable UUID.
      const player = await roomApi.join(room.id, { name: playerName });
      showToast(`Room "${formData.name}" created successfully!`, 'success');
      onRoomCreated(room, player.id);
    } catch (err) {
      showToast('Failed to create room. Please try again.', 'error');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="card">
      <h2>New Game</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Room Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter room name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            type="text"
            id="playerName"
            name="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="game_type">Game Type</label>
          <select
            id="game_type"
            name="game_type"
            value={formData.game_type}
            onChange={handleInputChange}
            required
          >
            <option value="yahtzee">Yahtzee</option>
            <option value="scrabble">Scrabble</option>
            <option value="tally">Generic Tally</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading || !formData.name.trim() || !playerName.trim()}
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </form>
    </div>
  );
};

export default CreateRoom; 