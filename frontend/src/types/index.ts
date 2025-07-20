export interface Room {
  id: string;
  name: string;
  game_type: 'yahtzee' | 'scrabble' | 'tally';
  room_code: string;
  created_at: string;
  is_active: boolean;
  players: Player[];
  scores: Score[];
  player_count: number;
}

export interface Player {
  id: string;
  name: string;
  room: string;
  joined_at: string;
  is_active: boolean;
}

export type YahtzeeCategory = 
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'three_of_a_kind' | 'four_of_a_kind' | 'full_house'
  | 'small_straight' | 'large_straight' | 'yahtzee' | 'chance';

export interface Score {
  id: string;
  player: string;
  player_name: string;
  room: string;
  round_number: number;
  score_value: number;
  notes: string;
  created_at: string;
  category?: YahtzeeCategory; // For Yahtzee-specific scoring
}

export interface RoomSummary {
  room_name: string;
  game_type: string;
  player_totals: Record<string, number>;
  total_rounds: number;
}

export interface CreateRoomData {
  name: string;
  game_type: 'yahtzee' | 'scrabble' | 'tally';
}

export interface JoinRoomData {
  name: string;
}

export interface CreateScoreData {
  player: string;
  room: string;
  round_number: number;
  score_value: number;
  notes?: string;
  category?: YahtzeeCategory;
} 