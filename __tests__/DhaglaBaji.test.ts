import {
  countTens,
  createDeck,
  dealCards,
  determineRoundWinner,
  isLegalMove,
} from "../src/games/dhaglabaji/logic/deck";
import {
  calculateFinalResults,
  createInitialGameState,
  playCardAction,
  resolveCompletedRound,
} from "../src/games/dhaglabaji/logic/gameEngine";
import { Card, PlayedCard } from "../src/games/dhaglabaji/types";

describe("Dhagla Baji (ઢગલાબાજી) Game Engine & Rules", () => {
  test("52-card standard deck creation", () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);
    expect(countTens(deck)).toBe(4);
  });

  test("Card dealing for 4 players (13 each), 2 players (26 each), and 3 players (17 each + 1 removed)", () => {
    const deal4 = dealCards(4);
    expect(deal4.hands.length).toBe(4);
    deal4.hands.forEach((h) => expect(h.length).toBe(13));

    const deal2 = dealCards(2);
    expect(deal2.hands.length).toBe(2);
    deal2.hands.forEach((h) => expect(h.length).toBe(26));

    const deal3 = dealCards(3);
    expect(deal3.hands.length).toBe(3);
    deal3.hands.forEach((h) => expect(h.length).toBe(17));
    expect(deal3.removedCard).toBeDefined();
  });

  test("Follow-suit rule enforcement", () => {
    const hand: Card[] = [
      { id: "hearts_7", suit: "hearts", rank: "7", value: 7 },
      { id: "spades_K", suit: "spades", rank: "K", value: 13 },
    ];

    // Lead suit is hearts -> must follow hearts
    expect(isLegalMove(hand[0], hand, "hearts")).toBe(true);
    expect(isLegalMove(hand[1], hand, "hearts")).toBe(false);

    // Lead suit is clubs (void in hand) -> can discard any card
    expect(isLegalMove(hand[0], hand, "clubs")).toBe(true);
    expect(isLegalMove(hand[1], hand, "clubs")).toBe(true);
  });

  test("Round winner: Highest rank of lead suit wins", () => {
    const roundPlays: PlayedCard[] = [
      {
        card: { id: "clubs_4", suit: "clubs", rank: "4", value: 4 },
        playerId: "p_0",
        seat: 0,
        playTimestamp: 1,
      },
      {
        card: { id: "clubs_K", suit: "clubs", rank: "K", value: 13 },
        playerId: "p_1",
        seat: 1,
        playTimestamp: 2,
      },
      {
        card: { id: "clubs_7", suit: "clubs", rank: "7", value: 7 },
        playerId: "p_2",
        seat: 2,
        playTimestamp: 3,
      },
      {
        card: { id: "hearts_A", suit: "hearts", rank: "A", value: 14 }, // Discard / non-lead
        playerId: "p_3",
        seat: 3,
        playTimestamp: 4,
      },
    ];

    const winner = determineRoundWinner(roundPlays, "clubs");
    expect(winner.playerId).toBe("p_1");
    expect(winner.card.rank).toBe("K");
  });

  test("Dhagla consecutive capture rule: 2 wins in a row captures the accumulated pile", () => {
    let state = createInitialGameState("VS_AI", 4);

    // Round 1: Player 0 wins
    state = {
      ...state,
      leadSuit: "spades",
      currentPlayerIndex: 0,
      currentRoundCards: [
        {
          card: { id: "spades_A", suit: "spades", rank: "A", value: 14 },
          playerId: "p_0",
          seat: 0,
          playTimestamp: 1,
        },
        {
          card: { id: "spades_2", suit: "spades", rank: "2", value: 2 },
          playerId: "p_1",
          seat: 1,
          playTimestamp: 2,
        },
        {
          card: { id: "spades_3", suit: "spades", rank: "3", value: 3 },
          playerId: "p_2",
          seat: 2,
          playTimestamp: 3,
        },
        {
          card: { id: "spades_4", suit: "spades", rank: "4", value: 4 },
          playerId: "p_3",
          seat: 3,
          playTimestamp: 4,
        },
      ],
      dhaglaCenterPile: [
        { id: "spades_A", suit: "spades", rank: "A", value: 14 },
        { id: "spades_2", suit: "spades", rank: "2", value: 2 },
        { id: "spades_3", suit: "spades", rank: "3", value: 3 },
        { id: "spades_4", suit: "spades", rank: "4", value: 4 },
      ],
    };

    const afterRound1 = resolveCompletedRound(state);
    expect(afterRound1.lastRoundWinnerId).toBe("p_0");
    expect(afterRound1.consecutiveWinnerId).toBe("p_0");
    expect(afterRound1.consecutiveWinCount).toBe(1);
    expect(afterRound1.dhaglaCenterPile.length).toBe(4); // Pile still in center

    // Round 2: Player 0 wins again (2nd consecutive win!)
    const round2State = {
      ...afterRound1,
      leadSuit: "hearts" as const,
      currentRoundCards: [
        {
          card: { id: "hearts_K", suit: "hearts" as const, rank: "K" as const, value: 13 },
          playerId: "p_0",
          seat: 0,
          playTimestamp: 5,
        },
        {
          card: { id: "hearts_10", suit: "hearts" as const, rank: "10" as const, value: 10 },
          playerId: "p_1",
          seat: 1,
          playTimestamp: 6,
        },
        {
          card: { id: "hearts_2", suit: "hearts" as const, rank: "2" as const, value: 2 },
          playerId: "p_2",
          seat: 2,
          playTimestamp: 7,
        },
        {
          card: { id: "hearts_3", suit: "hearts" as const, rank: "3" as const, value: 3 },
          playerId: "p_3",
          seat: 3,
          playTimestamp: 8,
        },
      ],
      dhaglaCenterPile: [
        ...afterRound1.dhaglaCenterPile,
        { id: "hearts_K", suit: "hearts" as const, rank: "K" as const, value: 13 },
        { id: "hearts_10", suit: "hearts" as const, rank: "10" as const, value: 10 },
        { id: "hearts_2", suit: "hearts" as const, rank: "2" as const, value: 2 },
        { id: "hearts_3", suit: "hearts" as const, rank: "3" as const, value: 3 },
      ],
    };

    const afterRound2 = resolveCompletedRound(round2State);
    // Player 0 captured all 8 cards including the Ten!
    expect(afterRound2.lastCaptureEvent).toBeDefined();
    expect(afterRound2.lastCaptureEvent?.winnerId).toBe("p_0");
    expect(afterRound2.lastCaptureEvent?.tensCount).toBe(1);
    expect(afterRound2.dhaglaCenterPile.length).toBe(0); // Center pile cleared!
    expect(afterRound2.consecutiveWinnerId).toBeNull();
    expect(afterRound2.players[0].tensCaptured).toBe(1);
  });

  test("Score calculation ranks player with most Tens as winner", () => {
    let state = createInitialGameState("VS_AI", 4);
    state.players[0].tensCaptured = 2;
    state.players[1].tensCaptured = 1;
    state.players[2].tensCaptured = 1;
    state.players[3].tensCaptured = 0;

    const result = calculateFinalResults(state);
    expect(result.winnerId).toBe("p_0");
    expect(result.playerStats[0].rank).toBe(1);
    expect(result.playerStats[0].tensCaptured).toBe(2);
  });
});
