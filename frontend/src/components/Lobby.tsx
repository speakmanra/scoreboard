import React, { useState } from 'react';
import { roomApi } from '../services/api';
import { Room } from '../types';
import { Dices, Crown, Hourglass } from 'lucide-react';

interface LobbyProps {
  room: Room;
  // The current player's UUID (carried through the room URL as ?player_id=).
  // Used to identify "you" and to decide whether the start control is shown.
  currentPlayerId: string;
  // Called after the host successfully starts the game so the parent can
  // refresh the room (its status flips to "active" and the scorecard renders).
  onStarted: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, currentPlayerId, onStarted, showToast }) => {
  const [starting, setStarting] = useState(false);

  // The host is the only player allowed to start the game. We compare by UUID
  // (not name) so similarly named players (e.g. "Ryan" vs "Ryan2") never clash.
  const isHost = !!currentPlayerId && currentPlayerId === room.host;

  const handleStart = async () => {
    setStarting(true);
    try {
      await roomApi.start(room.id, currentPlayerId);
      showToast('Game started!', 'success');
      onStarted();
    } catch (err) {
      showToast('Failed to start the game. Please try again.', 'error');
      console.error('Error starting game:', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>{room.name}</h1>
        <p>Game Type: {room.game_type}</p>
        <div className="room-code">Room Code: {room.room_code}</div>
        <p style={{ color: 'var(--text-muted)' }}>
          Share this code so others can join. Each player enters their own name.
        </p>
      </div>

      <div className="card">
        <h2>Lobby ({room.players.length})</h2>
        {room.players.length === 0 ? (
          <p>No players have joined yet.</p>
        ) : (
          <div className="score-grid">
            {room.players.map(player => {
              const isCurrentPlayer = player.id === currentPlayerId;
              const playerIsHost = player.id === room.host;
              return (
                <div
                  key={player.id}
                  className={isCurrentPlayer ? 'player-card current-player' : 'player-card'}
                >
                  <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {playerIsHost && <Crown size={16} aria-label="Host" />}
                    {player.name}
                    {isCurrentPlayer && <span className="you-badge"> (You)</span>}
                  </h3>
                </div>
              );
            })}
          </div>
        )}

        {isHost ? (
          <div className="start-game-section">
            <button
              onClick={handleStart}
              className="btn btn-success"
              disabled={starting}
              style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Dices size={20} aria-hidden="true" />
              {starting ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        ) : (
          <p
            style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}
          >
            <Hourglass size={18} aria-hidden="true" />
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
