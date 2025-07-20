import React, { useState, useCallback } from 'react';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import ScoreCard from './components/ScoreCard';
import { roomApi } from './services/api';
import { Room } from './types';

type AppState = 'home' | 'room';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
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

  const handleRoomCreated = async (room: any) => {
    try {
      setCurrentRoom(room);
      setCurrentState('room');
    } catch (err) {
      showToast('Error setting created room', 'error');
      console.error('Error setting created room:', err);
    }
  };

  const handleRoomJoined = async (roomCode: string, playerName: string) => {
    try {
      const room = await roomApi.getByCode(roomCode);
      setCurrentRoom(room);
      setCurrentPlayer(playerName);
      setCurrentState('room');
    } catch (err) {
      showToast('Error loading joined room', 'error');
      console.error('Error loading joined room:', err);
    }
  };

  const handleBackToHome = () => {
    setCurrentState('home');
    setCurrentRoom(null);
    setCurrentPlayer('');
  };

  if (currentState === 'room' && currentRoom) {
    return (
      <div>
        <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
          <button onClick={handleBackToHome} className="btn btn-secondary">
            ← Back to Home
          </button>
        </div>
        <ScoreCard room={currentRoom} currentPlayer={currentPlayer} />
      </div>
    );
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
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🎲 Scorecard App
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
          Create or join a room to start tracking scores for Yahtzee, Scrabble, or any game!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <CreateRoom onRoomCreated={handleRoomCreated} showToast={showToast} />
        <JoinRoom onRoomJoined={handleRoomJoined} showToast={showToast} />
      </div>

      <div className="card">
        <h2>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <h3>1. Create a Room</h3>
            <p>Choose a game type and create a new room. You'll get a unique room code to share with friends.</p>
          </div>
          <div>
            <h3>2. Share the Code</h3>
            <p>Share the 8-character room code with your friends so they can join the same game.</p>
          </div>
          <div>
            <h3>3. Track Scores</h3>
            <p>Add scores for each round and see real-time updates as everyone plays together.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 