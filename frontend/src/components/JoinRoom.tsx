import React, { useState } from 'react';
import { roomApi } from '../services/api';

interface JoinRoomProps {
  onRoomJoined: (roomCode: string, playerName: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onRoomJoined, showToast }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the room by code
      const room = await roomApi.getByCode(roomCode);
      
      // Then join the room
      await roomApi.join(room.id, { name: playerName });
      
      showToast(`Successfully joined room!`, 'success');
      onRoomJoined(roomCode, playerName);
    } catch (err) {
      showToast('Failed to join room. Please check the room code and try again.', 'error');
      console.error('Error joining room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Join Room</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="roomCode">Room Code</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
            placeholder="Enter 8-character room code"
            maxLength={8}
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading || !roomCode.trim() || !playerName.trim()}
        >
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </form>
    </div>
  );
};

export default JoinRoom; 