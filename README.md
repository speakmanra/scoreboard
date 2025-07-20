# 🎲 Scorecard App

A real-time shared scorecard application for games like Yahtzee, Scrabble, and generic tally games. Create rooms, share codes with friends, and track scores together!

## Features

- **Multi-Game Support**: Yahtzee, Scrabble, and Generic Tally games
- **Room-Based System**: Create rooms with unique 8-character codes
- **Real-Time Updates**: See scores update as players add them
- **Player Management**: Join rooms with custom player names
- **Score History**: Track scores by rounds with optional notes
- **Responsive Design**: Works on desktop and mobile devices
- **Direct Cell Editing**: Click directly on scorecard cells to enter scores (Yahtzee)
- **Game Setup Flow**: Add all players before starting the game (Yahtzee)
- **Keyboard Shortcuts**: Enter to save, Escape to cancel cell editing
- **Toast Notifications**: Non-disruptive error and success messages

## Tech Stack

### Backend

- **Django 4.2.7**: Python web framework
- **Django REST Framework**: API development
- **SQLite**: Database (can be easily changed to PostgreSQL/MySQL)
- **CORS Headers**: Cross-origin resource sharing

### Frontend

- **React 18**: Modern JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **Axios**: HTTP client for API calls
- **CSS Grid/Flexbox**: Modern responsive layout

### Testing

- **pytest**: Python testing framework
- **Jest & React Testing Library**: JavaScript testing
- **Coverage**: Code coverage reporting

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd scorecard
   ```

2. **Start the development environment**

   ```bash
   ./scripts/start-dev.sh
   ```

   This script will:

   - Set up Python virtual environment
   - Install Python dependencies
   - Install Node.js dependencies
   - Run database migrations
   - Start both Django backend (port 8000) and React frontend (port 3000)

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/

## Usage

### Creating a Room

1. Open the app in your browser
2. Fill in the "Create New Room" form:
   - Room Name: Choose a descriptive name
   - Game Type: Select Yahtzee, Scrabble, or Generic Tally
3. Click "Create Room"
4. Share the generated room code with your friends

### Joining a Room

1. Enter the 8-character room code
2. Enter your player name
3. Click "Join Room"

### Yahtzee Game Setup

1. **Create a Yahtzee Room**

   - Select "Yahtzee" as the game type
   - Create the room and get the room code

2. **Add Players (Setup Phase)**

   - Add all players who will participate in the game
   - Each player enters their name
   - See the current player list with count
   - Minimum 1 player required to start

3. **Start the Game**

   - Click "🎲 Start Yahtzee Game" button
   - Game transitions to scoring phase

4. **Scoring Yahtzee**
   - Click directly on any empty cell in the scorecard
   - Type the score value
   - Press Enter to save or Escape to cancel
   - Score appears immediately in the cell
   - Hover over cells to see clickable indicators

### Other Games (Scrabble, Generic Tally)

1. **Create a Room**

   - Select game type (Scrabble or Generic Tally)
   - Create the room and get the room code

2. **Join the Room**

   - Enter the room code
   - Enter your player name
   - Join the room

3. **Add Scores**
   - Select a player from the dropdown
   - Enter the round number
   - Enter the score value
   - Add optional notes
   - Click "Add Score"

## API Endpoints

### Rooms

- `GET /api/rooms/` - List all rooms
- `POST /api/rooms/` - Create a new room
- `GET /api/rooms/by_code/?code=ABC12345` - Get room by code
- `GET /api/rooms/{id}/` - Get room details
- `POST /api/rooms/{id}/join/` - Join a room

### Players

- `GET /api/players/?room_id={id}` - Get players in a room
- `POST /api/players/` - Create a player
- `GET /api/players/{id}/` - Get player details

### Scores

- `GET /api/scores/?room_id={id}` - Get scores in a room
- `POST /api/scores/` - Add a new score
- `GET /api/scores/room_summary/?room_id={id}` - Get room summary

## Testing

### Run All Tests

```bash
./scripts/test-all.sh
```

### Backend Tests Only

```bash
./scripts/test-backend.sh
```

### Frontend Tests Only

```bash
./scripts/test-frontend.sh
```

### API Validation

```bash
# Start the development server first, then:
./scripts/validate-api.sh
```

## Development

### Project Structure

```
scorecard/
├── backend/                 # Django backend
│   ├── api/                # API app
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # DRF serializers
│   │   ├── views.py        # API views
│   │   └── urls.py         # API URLs
│   ├── scorecard/          # Django project
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── tests/          # Frontend tests
│   └── package.json        # Node.js dependencies
├── scripts/                # Development scripts
└── README.md
```

### Adding New Game Types

1. Add the game type to `Room.GAME_TYPES` in `backend/api/models.py`
2. Update the frontend game type options in `CreateRoom.tsx`
3. Add any game-specific scoring logic if needed

### Database Migrations

```bash
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

## Deployment

### Backend (Django)

1. Set `DEBUG=False` in settings
2. Configure production database (PostgreSQL recommended)
3. Set up static file serving
4. Configure environment variables

### Frontend (React)

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the `build/` directory with a web server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
