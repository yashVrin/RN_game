import { GameState } from "../types";
import { nativeSocket } from "./nativeSocketBridge";
import {
  JoinAcceptedPayload,
  LobbyStatePayload,
  NetworkMessage,
  PlayCardPayload,
} from "./protocol";

export type ClientEventCallback = (event: string, data: any) => void;

export class ClientManager {
  private isConnected = false;
  private assignedSeat: number | null = null;
  private playerId: string | null = null;
  private playerName = "Player";
  private avatar = "🎯";
  private currentLobbyState: LobbyStatePayload | null = null;
  private currentGameState: GameState | null = null;

  private listeners: Set<ClientEventCallback> = new Set();
  private unsubMessage: (() => void) | null = null;
  private unsubDisconnect: (() => void) | null = null;

  constructor() {}

  public async connectToHost(
    hostIp: string,
    playerName: string = "Player",
    avatar: string = "🎯",
    port: number = 8080
  ): Promise<boolean> {
    this.playerName = playerName;
    this.avatar = avatar;

    const connected = await nativeSocket.connect(hostIp, port);
    if (!connected) {
      return false;
    }

    this.isConnected = true;
    this.setupListeners();

    // Send Join Request
    setTimeout(() => {
      nativeSocket.send({
        type: "JOIN_REQUEST",
        payload: { playerName, avatar },
        timestamp: Date.now(),
      });
    }, 300);

    return true;
  }

  private setupListeners() {
    this.unsubMessage = nativeSocket.onMessage((msgStr) => {
      try {
        const msg: NetworkMessage = JSON.parse(msgStr);
        this.handleIncomingMessage(msg);
      } catch (e) {
        // Parse error
      }
    });

    this.unsubDisconnect = nativeSocket.onClientDisconnected(() => {
      this.isConnected = false;
      this.notifyListeners("DISCONNECTED_FROM_HOST", null);
    });
  }

  private handleIncomingMessage(msg: NetworkMessage) {
    switch (msg.type) {
      case "JOIN_ACCEPTED": {
        const payload = msg.payload as JoinAcceptedPayload;
        this.assignedSeat = payload.assignedSeat;
        this.playerId = payload.playerId;
        this.notifyListeners("JOIN_ACCEPTED", payload);
        break;
      }

      case "JOIN_REJECTED": {
        this.notifyListeners("JOIN_REJECTED", msg.payload);
        this.disconnect();
        break;
      }

      case "LOBBY_STATE": {
        const payload = msg.payload as LobbyStatePayload;
        this.currentLobbyState = payload;
        this.notifyListeners("LOBBY_UPDATED", payload);
        break;
      }

      case "START_GAME":
      case "STATE_UPDATE": {
        const gameState = msg.payload?.gameState as GameState;
        if (gameState) {
          this.currentGameState = gameState;
          this.notifyListeners("STATE_SYNC", {
            gameState,
            localSeat: this.assignedSeat,
            playerId: this.playerId,
          });
        }
        break;
      }
    }
  }

  public playCard(cardId: string) {
    if (!this.playerId || !this.isConnected) return;

    const payload: PlayCardPayload = {
      playerId: this.playerId,
      cardId,
    };

    nativeSocket.send({
      type: "PLAY_CARD",
      payload,
      timestamp: Date.now(),
    });
  }

  public async disconnect() {
    this.isConnected = false;
    if (this.unsubMessage) this.unsubMessage();
    if (this.unsubDisconnect) this.unsubDisconnect();
    await nativeSocket.disconnect();
    this.notifyListeners("DISCONNECTED", null);
  }

  public subscribe(cb: ClientEventCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach((cb) => cb(event, data));
  }

  public getSeat(): number | null {
    return this.assignedSeat;
  }

  public getPlayerId(): string | null {
    return this.playerId;
  }
}
