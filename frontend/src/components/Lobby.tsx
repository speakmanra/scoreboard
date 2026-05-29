import React, { useState } from 'react';
import { roomApi } from '../services/api';
import { Room } from '../types';
import { Crown, Dices } from 'lucide-react';

interface LobbyProps {
  room: Room;
  // UUID of the player viewing this lobby, carried through the room URL.
  currentPlayerId: string;
  // Called once the game has been started so the parent can flip to the
  // scorecard immediately instead of waiting for the next poll.
  onStarted: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, currentPlayerId, onStarted, showToast }) => {
  const [starting, setStarting] = useState(false);

  // Only the host (the player who created/started the room) may begin the game.
  const isHost = !!currentPlayerId && room.host === currentPlayerId;

  const handleStartGame = async () => {
    setStarting(true);
    try {
      await roomApi.start(room.id, currentPlayerId);
      showToast('Game started!', 'success');
      onStarted();
    } catch (err) {
      // The backend returns 403 if a non-host somehow triggers this.
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
          Share this code so others can join. The game begins when the host starts it.
        </p>
      </div>

      <div className="card">
        <h2>Players in Lobby ({room.players.length})</h2>
        {room.players.length === 0 ? (
          <p>Waiting for players to join…</p>
        ) : (
          <ul className="player-list" style={{ listStyle: 'none', padding: 0 }}>
            {room.players.map(player => {
              const isYou = player.id === currentPlayerId;
              const isRoomHost = player.id === room.host;
              return (
                <li
                  key={player.id}
                  className={isYou ? 'player-card current-player' : 'player-card'}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                >
                  {isRoomHost && (
                    <Crown size={16} aria-label="Host" />
                  )}
                  <span>{player.name}</span>
                  {isYou && <span className="you-badge">(You)</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="card">
        {isHost ? (
          <button
            type="button"
            onClick={handleStartGame}
            className="btn btn-success"
            disabled={starting || room.players.length === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Dices size={20} aria-hidden="true" />
            {starting ? 'Starting…' : 'Start Game'}
          </button>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>
            Waiting for the host to start the game…
          </p>
        )}
      </div>
    </div>
  );
};

export default Lobby;
