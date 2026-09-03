import { RANKS, RANK_VALUES, SUITS } from "../constants";
import { Card, PlayedCard, Suit } from "../types";

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        value: RANK_VALUES[rank],
      });
    }
  }
  return deck;
}

/**
 * Shuffles a deck of cards using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Deals cards to 2, 3, or 4 players according to Dhagla Baji rules
 */
export function dealCards(playerCount: 2 | 3 | 4): {
  hands: Card[][];
  removedCard?: Card;
} {
  const fullDeck = shuffleDeck(createDeck());

  if (playerCount === 4) {
    // 52 cards / 4 players = 13 cards each
    const hands: Card[][] = [[], [], [], []];
    for (let i = 0; i < 52; i++) {
      hands[i % 4].push(fullDeck[i]);
    }
    // Sort each player's hand by suit and value for clean UI
    return {
      hands: hands.map(sortHand),
    };
  }

  if (playerCount === 2) {
    // 52 cards / 2 players = 26 cards each
    const hands: Card[][] = [[], []];
    for (let i = 0; i < 52; i++) {
      hands[i % 2].push(fullDeck[i]);
    }
    return {
      hands: hands.map(sortHand),
    };
  }

  if (playerCount === 3) {
    // 52 cards: 1 card removed randomly, 51 cards / 3 players = 17 cards each
    const removedCard = fullDeck[0];
    const remainingDeck = fullDeck.slice(1);
    const hands: Card[][] = [[], [], []];
    for (let i = 0; i < 51; i++) {
      hands[i % 3].push(remainingDeck[i]);
    }
    return {
      hands: hands.map(sortHand),
      removedCard,
    };
  }

  throw new Error(`Unsupported player count: ${playerCount}`);
}

/**
 * Sorts cards in hand by suit and descending rank value
 */
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = {
    spades: 0,
    hearts: 1,
    clubs: 2,
    diamonds: 3,
  };

  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return b.value - a.value;
  });
}

/**
 * Validates if a card is legal to play according to the Follow-Suit rule
 */
export function isLegalMove(
  card: Card,
  playerHand: Card[],
  leadSuit: Suit | null
): boolean {
  if (!leadSuit) {
    // First card in round: any card can lead
    return true;
  }

  // Check if player has any card of the lead suit
  const hasLeadSuit = playerHand.some((c) => c.suit === leadSuit);

  if (hasLeadSuit) {
    // Must follow suit!
    return card.suit === leadSuit;
  }

  // Player is void of lead suit: can discard any other card
  return true;
}

/**
 * Returns all legal cards a player can play
 */
export function getLegalMoves(
  playerHand: Card[],
  leadSuit: Suit | null
): Card[] {
  if (!leadSuit) {
    return playerHand;
  }

  const leadCards = playerHand.filter((c) => c.suit === leadSuit);
  if (leadCards.length > 0) {
    return leadCards;
  }

  return playerHand;
}

/**
 * Determines the winner of a round
 * Rule: Highest rank card of the lead suit wins the round
 */
export function determineRoundWinner(
  playedCards: PlayedCard[],
  leadSuit: Suit
): PlayedCard {
  const leadSuitPlays = playedCards.filter((p) => p.card.suit === leadSuit);

  if (leadSuitPlays.length === 0) {
    // Fallback: first card played
    return playedCards[0];
  }

  let highestPlay = leadSuitPlays[0];
  for (let i = 1; i < leadSuitPlays.length; i++) {
    if (leadSuitPlays[i].card.value > highestPlay.card.value) {
      highestPlay = leadSuitPlays[i];
    }
  }

  return highestPlay;
}

/**
 * Counts the number of Tens in an array of cards
 */
export function countTens(cards: Card[]): number {
  return cards.filter((c) => c.rank === "10").length;
}
