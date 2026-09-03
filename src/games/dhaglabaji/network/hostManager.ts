import { createInitialGameState, playCardAction, resolveCompletedRound } from "../logic/gameEngine";
import { GameState } from "../types";
import { nativeSocket } from "./nativeSocketBridge";
import { LobbyStatePayload, NetworkMessage } from "./protocol";

export type HostEventCallback = (event: string, data: any) => void;

export class HostManager {
  private isHosting = false;
  private playerCount: 2 | 3 | 4 = 4;
  private hostName = "Host";
  private hostAvatar = "👑";
  private slots: {
    seat: number;
    playerId?: string;
    playerName?: string;
    avatar?: string;
    isReady: boolean;
    isHost: boolean;
    ipAddress?: string;
  }[] = [];

  private gameState: GameState | null = null;
  private listeners: Set<HostEventCallback> = new Set();
  private unsubMessage: (() => void) | null = null;
  private unsubDisconnect: (() => void) | null = null;

  constructor() {
    this.initSlots(4);
  }

  public initSlots(count: 2 | 3 | 4, hostName: string = "Host", hostAvatar: string = "👑") {
    this.playerCount = count;
    this.hostName = hostName;
    this.hostAvatar = hostAvatar;

    this.slots = Array.from({ length: count }, (_, idx) => ({
      seat: idx,
      playerId: idx === 0 ? "p_0" : undefined,
      playerName: idx === 0 ? hostName : undefined,
      avatar: idx === 0 ? hostAvatar : undefined,
      isReady: idx === 0,
      isHost: idx === 0,
    }));
  }

  public async startHost(
    playerCount: 2 | 3 | 4,
    hostName: string = "Host",
    hostAvatar: string = "👑",
    port: number = 8080
  ): Promise<{ success: boolean; ip: string }> {
    this.initSlots(playerCount, hostName, hostAvatar);
    const ip = await nativeSocket.getLocalIp();

    const started = await nativeSocket.startServer(port);
    if (!started) {
      return { success: false, ip };
    }

    this.isHosting = true;
    this.setupListeners();
    this.notifyListeners("HOST_STARTED", { ip, port, slots: this.slots });
    return { success: true, ip };
  }

  public async stopHost() {
    this.isHosting = false;
    if (this.unsubMessage) this.unsubMessage();
    if (this.unsubDisconnect) this.unsubDisconnect();
    await nativeSocket.stopServer();
    this.notifyListeners("HOST_STOPPED", null);
  }

  private setupListeners() {
    this.unsubMessage = nativeSocket.onMessage((msgStr, senderIp) => {
      try {
        const msg: NetworkMessage = JSON.parse(msgStr);
        this.handleIncomingMessage(msg, senderIp);
      } catch (e) {
        // Parse error
      }
    });

    this.unsubDisconnect = nativeSocket.onClientDisconnected((data) => {
      const clientIp = data?.clientIp;
      if (clientIp) {
        // Find and free slot
        const slot = this.slots.find((s) => s.ipAddress === clientIp);
        if (slot && !slot.isHost) {
          slot.playerId = undefined;
          slot.playerName = undefined;
          slot.avatar = undefined;
          slot.isReady = false;
          slot.ipAddress = undefined;
          this.broadcastLobbyState();
          this.notifyListeners("LOBBY_UPDATED", { slots: this.slots });
        }
      }
    });
  }

  private handleIncomingMessage(msg: NetworkMessage, senderIp?: string) {
    switch (msg.type) {
      case "JOIN_REQUEST": {
        const freeSlot = this.slots.find((s) => !s.playerId);
        if (!freeSlot) {
          nativeSocket.send({
            type: "JOIN_REJECTED",
            payload: { reason: "Room is full" },
            timestamp: Date.now(),
          });
          return;
        }

        const assignedSeat = freeSlot.seat;
        const playerId = `p_${assignedSeat}`;
        freeSlot.playerId = playerId;
        freeSlot.playerName = msg.payload?.playerName || `Player ${assignedSeat + 1}`;
        freeSlot.avatar = msg.payload?.avatar || "🃏";
        freeSlot.isReady = true;
        freeSlot.ipAddress = senderIp;

        // Respond accept
        nativeSocket.broadcast({
          type: "JOIN_ACCEPTED",
          payload: {
            assignedSeat,
            playerId,
            totalPlayers: this.playerCount,
          },
          timestamp: Date.now(),
        });

        this.broadcastLobbyState();
        this.notifyListeners("LOBBY_UPDATED", { slots: this.slots });
        break;
      }

      case "PLAY_CARD": {
        if (!this.gameState || this.gameState.status !== "PLAYING") return;
        const { playerId, cardId } = msg.payload;
        this.handleClientCardPlay(playerId, cardId);
        break;
      }
    }
  }

  public broadcastLobbyState() {
    const payload: LobbyStatePayload = {
      slots: this.slots,
      totalSlots: this.playerCount,
    };
    nativeSocket.broadcast({
      type: "LOBBY_STATE",
      payload,
      timestamp: Date.now(),
    });
  }

  public startGame(): GameState | null {
    const playerNames = this.slots.map((s, idx) => s.playerName || `Player ${idx + 1}`);
    const initialState = createInitialGameState(
      "HOTSPOT",
      this.playerCount,
      "MEDIUM",
      playerNames
    );

    // Update avatars
    initialState.players = initialState.players.map((p, idx) => ({
      ...p,
      avatar: this.slots[idx]?.avatar || p.avatar,
    }));

    this.gameState = initialState;

    // Send START_GAME message to all clients with full game state
    nativeSocket.broadcast({
      type: "START_GAME",
      payload: { gameState: initialState },
      timestamp: Date.now(),
    });

    this.notifyListeners("GAME_STARTED", initialState);
    return initialState;
  }

  public handleClientCardPlay(playerId: string, cardId: string) {
    if (!this.gameState || this.gameState.status !== "PLAYING") return;

    let nextState = playCardAction(this.gameState, playerId, cardId);
    this.gameState = nextState;

    this.broadcastStateUpdate(nextState);
    this.notifyListeners("STATE_CHANGED", nextState);

    // If round resolved, wait briefly and resolve
    if (nextState.status === "ROUND_RESOLVING") {
      setTimeout(() => {
        if (!this.gameState) return;
        const resolved = resolveCompletedRound(this.gameState);
        this.gameState = resolved;
        this.broadcastStateUpdate(resolved);
        this.notifyListeners("STATE_CHANGED", resolved);
      }, 1400);
    }
  }

  private broadcastStateUpdate(state: GameState) {
    nativeSocket.broadcast({
      type: "STATE_UPDATE",
      payload: { gameState: state },
      timestamp: Date.now(),
    });
  }

  public subscribe(cb: HostEventCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach((cb) => cb(event, data));
  }

  public getSlots() {
    return this.slots;
  }

  public getGameState() {
    return this.gameState;
  }
}
