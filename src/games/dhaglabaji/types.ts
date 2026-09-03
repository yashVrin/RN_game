export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // 2..14 (A=14)
}

export type AIDifficulty = "EASY" | "MEDIUM" | "HARD";

export type PlayerType = "HUMAN" | "AI" | "REMOTE";

export interface Player {
  id: string;
  name: string;
  avatar: string;
  type: PlayerType;
  seat: number; // 0..3 (0: South/You, 1: West, 2: North, 3: East)
  isHost: boolean;
  connected: boolean;
  cardCount: number;
  tensCaptured: number;
  roundsWonTotal: number;
  hand?: Card[]; // Private to the player or host authoritative state
}

export interface PlayedCard {
  card: Card;
  playerId: string;
  seat: number;
  playTimestamp: number;
}

export type GameStatus =
  | "LOBBY"
  | "DEALING"
  | "PLAYING"
  | "ROUND_RESOLVING"
  | "GAME_OVER";

export type GameMode = "VS_AI" | "PASS_AND_PLAY" | "HOTSPOT";

export interface GameState {
  gameId: string;
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  aiDifficulty: AIDifficulty;
  players: Player[];
  currentPlayerIndex: number;
  leadSuit: Suit | null;
  currentRoundCards: PlayedCard[];
  dhaglaCenterPile: Card[];
  lastRoundWinnerId: string | null;
  consecutiveWinnerId: string | null;
  consecutiveWinCount: number;
  lastCaptureEvent: {
    winnerId: string;
    winnerName: string;
    cardCount: number;
    tensCount: number;
  } | null;
  status: GameStatus;
  roundNumber: number;
  turnNumber: number;
  removedCard?: Card; // When 3 players, 1 card removed from 52 to make 51 (17 each)
}

export interface GameResult {
  winnerId: string;
  winnerName: string;
  isTie: boolean;
  tiePlayerIds?: string[];
  playerStats: {
    playerId: string;
    playerName: string;
    tensCaptured: number;
    totalCardsCaptured: number;
    roundsWon: number;
    rank: number;
  }[];
}
