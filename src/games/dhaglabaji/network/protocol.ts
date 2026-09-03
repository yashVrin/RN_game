import { GameState } from "../types";

export type NetworkMessageType =
  | "JOIN_REQUEST"
  | "JOIN_ACCEPTED"
  | "JOIN_REJECTED"
  | "LOBBY_STATE"
  | "START_GAME"
  | "PLAY_CARD"
  | "STATE_UPDATE"
  | "ROUND_RESOLVED"
  | "PING"
  | "PONG";

export interface NetworkMessage {
  type: NetworkMessageType;
  senderId?: string;
  senderName?: string;
  payload?: any;
  timestamp: number;
}

export interface JoinRequestPayload {
  playerName: string;
  avatar: string;
}

export interface JoinAcceptedPayload {
  assignedSeat: number;
  playerId: string;
  totalPlayers: number;
}

export interface LobbyStatePayload {
  slots: {
    seat: number;
    playerId?: string;
    playerName?: string;
    avatar?: string;
    isReady: boolean;
    isHost: boolean;
  }[];
  totalSlots: number;
}

export interface PlayCardPayload {
  playerId: string;
  cardId: string;
}

export interface StateUpdatePayload {
  gameState: GameState;
}
