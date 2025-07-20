import axios from 'axios';
import {
  Room,
  Player,
  Score,
  RoomSummary,
  CreateRoomData,
  JoinRoomData,
  CreateScoreData,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const roomApi = {
  // Create a new room
  create: async (data: CreateRoomData): Promise<Room> => {
    const response = await api.post('/rooms/', data);
    return response.data;
  },

  // Get room by room code
  getByCode: async (code: string): Promise<Room> => {
    const response = await api.get(`/rooms/by_code/?code=${code}`);
    return response.data;
  },

  // Join a room
  join: async (roomId: string, data: JoinRoomData): Promise<Player> => {
    const response = await api.post(`/rooms/${roomId}/join/`, data);
    return response.data;
  },

  // Get room details
  get: async (roomId: string): Promise<Room> => {
    const response = await api.get(`/rooms/${roomId}/`);
    return response.data;
  },
};

export const playerApi = {
  // Get players in a room
  getByRoom: async (roomId: string): Promise<Player[]> => {
    const response = await api.get(`/players/?room_id=${roomId}`);
    return response.data.results || response.data;
  },
};

export const scoreApi = {
  // Create a new score
  create: async (data: CreateScoreData): Promise<Score> => {
    const response = await api.post('/scores/', data);
    return response.data;
  },

  // Update an existing score
  update: async (scoreId: string, data: Partial<CreateScoreData>): Promise<Score> => {
    const response = await api.put(`/scores/${scoreId}/`, data);
    return response.data;
  },

  // Get scores for a room
  getByRoom: async (roomId: string): Promise<Score[]> => {
    const response = await api.get(`/scores/?room_id=${roomId}`);
    return response.data.results || response.data;
  },

  // Get room summary
  getRoomSummary: async (roomId: string): Promise<RoomSummary> => {
    const response = await api.get(`/scores/room_summary/?room_id=${roomId}`);
    return response.data;
  },
};

export default api; 