import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import ScoreCard from './components/ScoreCard';
import { roomApi } from './services/api';
import { Room } from './types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Toast Context
const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}>({
  showToast: () => {},
  removeToast: () => {},
  toasts: []
});

// Home Component
const Home: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = React.useContext(ToastContext);

  const handleRoomCreated = async (room: any) => {
    try {
      navigate(`/room/${room.room_code}`);
    } catch (err) {
      showToast('Error setting created room', 'error');
      console.error('Error setting created room:', err);
    }
  };

  const handleRoomJoined = async (roomCode: string, playerName: string) => {
    try {
      const room = await roomApi.getByCode(roomCode);
      navigate(`/room/${roomCode}?player=${encodeURIComponent(playerName)}`);
    } catch (err) {
      showToast('Error loading joined room', 'error');
      console.error('Error loading joined room:', err);
    }
  };

  return (
    <div className="container">
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

// Room Component
const RoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { showToast } = React.useContext(ToastContext);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomCode) {
        navigate('/');
        return;
      }

      try {
        const room = await roomApi.getByCode(roomCode);
        setCurrentRoom(room);
        
        // Get player name from URL params if available
        const urlParams = new URLSearchParams(window.location.search);
        const playerName = urlParams.get('player');
        if (playerName) {
          setCurrentPlayer(decodeURIComponent(playerName));
        }
      } catch (err) {
        showToast('Room not found or error loading room', 'error');
        console.error('Error loading room:', err);
        navigate('/');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomCode, navigate, showToast]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="container"><div className="card">Loading room...</div></div>;
  }

  if (!currentRoom) {
    return <Navigate to="/" replace />;
  }

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
};

// Main App Component
const App: React.FC = () => {
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

  const toastContextValue = {
    showToast,
    removeToast,
    toasts
  };

  return (
    <ToastContext.Provider value={toastContextValue}>
      <Router>
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

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomCode" element={<RoomPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastContext.Provider>
  );
};

export default App; 