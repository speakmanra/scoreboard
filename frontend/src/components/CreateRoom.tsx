import React, { useState, useCallback } from 'react';
import { roomApi } from '../services/api';
import { CreateRoomData } from '../types';

interface CreateRoomProps {
  onRoomCreated: (room: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onRoomCreated, showToast }) => {
  const [formData, setFormData] = useState<CreateRoomData>({
    name: '',
    game_type: 'yahtzee',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const room = await roomApi.create(formData);
      showToast(`Room "${formData.name}" created successfully!`, 'success');
      onRoomCreated(room);
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
      <h2>Create New Room</h2>
      
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
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
};

export default CreateRoom; 