import { DEFAULT_AVATARS, DEFAULT_PLAYER_NAMES } from "../constants";
import {
  AIDifficulty,
  Card,
  GameMode,
  GameResult,
  GameState,
  PlayedCard,
  Player,
} from "../types";
import {
  countTens,
  dealCards,
  determineRoundWinner,
  isLegalMove,
} from "./deck";

/**
 * Initializes a new Dhagla Baji GameState
 */
export function createInitialGameState(
  mode: GameMode,
  playerCount: 2 | 3 | 4 = 4,
  aiDifficulty: AIDifficulty = "MEDIUM",
  humanPlayerNames?: string[]
): GameState {
  const { hands, removedCard } = dealCards(playerCount);

  const players: Player[] = Array.from({ length: playerCount }, (_, idx) => {
    let type: Player["type"] = "AI";
    let name = DEFAULT_PLAYER_NAMES[idx] || `Player ${idx + 1}`;

    if (mode === "PASS_AND_PLAY") {
      type = "HUMAN";
      name = humanPlayerNames?.[idx] || `Player ${idx + 1}`;
    } else if (mode === "VS_AI") {
      if (idx === 0) {
        type = "HUMAN";
        name = humanPlayerNames?.[0] || "You";
      } else {
        type = "AI";
        name = DEFAULT_PLAYER_NAMES[idx] || `Bot ${idx}`;
      }
    } else if (mode === "HOTSPOT") {
      type = idx === 0 ? "HUMAN" : "REMOTE";
      name = humanPlayerNames?.[idx] || (idx === 0 ? "Host (You)" : `Player ${idx + 1}`);
    }

    return {
      id: `p_${idx}`,
      name,
      avatar: DEFAULT_AVATARS[idx] || "🃏",
      type,
      seat: idx,
      isHost: idx === 0,
      connected: true,
      cardCount: hands[idx].length,
      tensCaptured: 0,
      roundsWonTotal: 0,
      hand: hands[idx],
    };
  });

  return {
    gameId: Math.random().toString(36).substring(2, 8).toUpperCase(),
    mode,
    playerCount,
    aiDifficulty,
    players,
    currentPlayerIndex: 0,
    leadSuit: null,
    currentRoundCards: [],
    dhaglaCenterPile: [],
    lastRoundWinnerId: null,
    consecutiveWinnerId: null,
    consecutiveWinCount: 0,
    lastCaptureEvent: null,
    status: "PLAYING",
    roundNumber: 1,
    turnNumber: 1,
    removedCard,
  };
}

/**
 * Executes a card play by the active player
 */
export function playCardAction(
  state: GameState,
  playerId: string,
  cardId: string
): GameState {
  if (state.status !== "PLAYING") {
    return state;
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) {
    return state;
  }

  const player = state.players[playerIndex];
  const hand = player.hand || [];
  const card = hand.find((c) => c.id === cardId);

  if (!card) {
    return state;
  }

  // Validate follow suit
  if (!isLegalMove(card, hand, state.leadSuit)) {
    return state;
  }

  // Establish lead suit if first card in round
  const isFirstInRound = state.currentRoundCards.length === 0;
  const newLeadSuit = isFirstInRound ? card.suit : state.leadSuit;

  // Record played card
  const playedCard: PlayedCard = {
    card,
    playerId: player.id,
    seat: player.seat,
    playTimestamp: Date.now(),
  };

  // Remove card from player hand
  const newHand = hand.filter((c) => c.id !== cardId);
  const updatedPlayers = state.players.map((p, idx) =>
    idx === playerIndex
      ? {
          ...p,
          cardCount: newHand.length,
          hand: newHand,
        }
      : p
  );

  const updatedRoundCards = [...state.currentRoundCards, playedCard];
  const updatedDhaglaPile = [...state.dhaglaCenterPile, card];

  // Check if round is complete
  if (updatedRoundCards.length === state.playerCount) {
    return {
      ...state,
      players: updatedPlayers,
      leadSuit: newLeadSuit,
      currentRoundCards: updatedRoundCards,
      dhaglaCenterPile: updatedDhaglaPile,
      status: "ROUND_RESOLVING",
    };
  }

  // Next player's turn in current round
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;

  return {
    ...state,
    players: updatedPlayers,
    leadSuit: newLeadSuit,
    currentRoundCards: updatedRoundCards,
    dhaglaCenterPile: updatedDhaglaPile,
    currentPlayerIndex: nextPlayerIndex,
    turnNumber: state.turnNumber + 1,
  };
}

/**
 * Resolves a completed round, checks Dhagla consecutive capture, and advances turn
 */
export function resolveCompletedRound(state: GameState): GameState {
  if (state.currentRoundCards.length !== state.playerCount || !state.leadSuit) {
    return state;
  }

  // Determine round winner (highest card of lead suit)
  const winningPlay = determineRoundWinner(state.currentRoundCards, state.leadSuit);
  const winnerId = winningPlay.playerId;
  const winnerIndex = state.players.findIndex((p) => p.id === winnerId);
  const winner = state.players[winnerIndex];

  let newConsecutiveWinnerId = state.consecutiveWinnerId;
  let newConsecutiveWinCount = state.consecutiveWinCount;
  let newDhaglaPile = [...state.dhaglaCenterPile];
  let captureEvent = null;
  let updatedPlayers = [...state.players];

  if (state.consecutiveWinnerId === winnerId) {
    // WINNER HAS WON TWO CONSECUTIVE ROUNDS!
    // Player captures the ENTIRE accumulated Dhagla center pile!
    newConsecutiveWinCount += 1;
    const capturedTens = countTens(newDhaglaPile);
    const capturedCardsCount = newDhaglaPile.length;

    captureEvent = {
      winnerId,
      winnerName: winner.name,
      cardCount: capturedCardsCount,
      tensCount: capturedTens,
    };

    // Award Tens & round win count to winner
    updatedPlayers = updatedPlayers.map((p) =>
      p.id === winnerId
        ? {
            ...p,
            tensCaptured: p.tensCaptured + capturedTens,
            roundsWonTotal: p.roundsWonTotal + 1,
          }
        : p
    );

    // Empty center Dhagla pile and reset consecutive win streak
    newDhaglaPile = [];
    newConsecutiveWinnerId = null;
    newConsecutiveWinCount = 0;
  } else {
    // Different winner: center pile accumulates, streak passes to this winner (1 win)
    newConsecutiveWinnerId = winnerId;
    newConsecutiveWinCount = 1;

    updatedPlayers = updatedPlayers.map((p) =>
      p.id === winnerId
        ? {
            ...p,
            roundsWonTotal: p.roundsWonTotal + 1,
          }
        : p
    );
  }

  // Check if all cards have been played (game over)
  const allCardsPlayed = updatedPlayers.every((p) => p.cardCount === 0);

  if (allCardsPlayed) {
    return {
      ...state,
      players: updatedPlayers,
      leadSuit: null,
      currentRoundCards: [],
      dhaglaCenterPile: newDhaglaPile,
      lastRoundWinnerId: winnerId,
      consecutiveWinnerId: newConsecutiveWinnerId,
      consecutiveWinCount: newConsecutiveWinCount,
      lastCaptureEvent: captureEvent,
      status: "GAME_OVER",
    };
  }

  // Round winner leads the next round
  return {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: winnerIndex,
    leadSuit: null,
    currentRoundCards: [],
    dhaglaCenterPile: newDhaglaPile,
    lastRoundWinnerId: winnerId,
    consecutiveWinnerId: newConsecutiveWinnerId,
    consecutiveWinCount: newConsecutiveWinCount,
    lastCaptureEvent: captureEvent,
    status: "PLAYING",
    roundNumber: state.roundNumber + 1,
  };
}

/**
 * Calculates final results and ranks players based on Tens captured
 */
export function calculateFinalResults(state: GameState): GameResult {
  const sortedPlayers = [...state.players].sort((a, b) => {
    // 1. Most Tens captured (Primary)
    if (b.tensCaptured !== a.tensCaptured) {
      return b.tensCaptured - a.tensCaptured;
    }
    // 2. Most total rounds won (Tie-breaker)
    if (b.roundsWonTotal !== a.roundsWonTotal) {
      return b.roundsWonTotal - a.roundsWonTotal;
    }
    return 0;
  });

  const topPlayer = sortedPlayers[0];
  const secondPlayer = sortedPlayers[1];

  const isTie =
    secondPlayer &&
    topPlayer.tensCaptured === secondPlayer.tensCaptured &&
    topPlayer.roundsWonTotal === secondPlayer.roundsWonTotal;

  const playerStats = sortedPlayers.map((p, idx) => ({
    playerId: p.id,
    playerName: p.name,
    tensCaptured: p.tensCaptured,
    totalCardsCaptured: p.roundsWonTotal * state.playerCount,
    roundsWon: p.roundsWonTotal,
    rank: idx + 1,
  }));

  return {
    winnerId: topPlayer.id,
    winnerName: topPlayer.name,
    isTie,
    playerStats,
  };
}
