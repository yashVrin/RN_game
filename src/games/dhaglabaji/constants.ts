import { AIDifficulty, Rank, Suit } from "./types";

export const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

export const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const RANK_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: "#FF3B30",
  diamonds: "#FF3B30",
  clubs: "#1C1C1E",
  spades: "#1C1C1E",
};

export const SUIT_NAMES_GUJARATI: Record<Suit, string> = {
  hearts: "લાલ (Hearts)",
  diamonds: "ચરકટ (Diamonds)",
  clubs: "ફુલ્લી (Clubs)",
  spades: "કાળી (Spades)",
};

export const DEFAULT_PLAYER_NAMES: string[] = [
  "You",
  "Mitul (AI)",
  "Jignesh (AI)",
  "Bhavin (AI)",
];

export const PASS_PLAY_DEFAULT_NAMES: string[] = [
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
];

export const DEFAULT_AVATARS: string[] = ["👑", "🦁", "⚡", "🎯"];

export const DIFFICULTY_LABELS: Record<AIDifficulty, { label: string; desc: string; icon: string }> = {
  EASY: {
    label: "Easy (સરળ)",
    desc: "Plays random valid cards",
    icon: "🌱",
  },
  MEDIUM: {
    label: "Medium (મધ્યમ)",
    desc: "Protects Tens and preserves high ranks",
    icon: "⚔️",
  },
  HARD: {
    label: "Hard (કઠિન)",
    desc: "Strategic card counting & streak capture master",
    icon: "🔥",
  },
};

export const DHAGLA_RULES_EXPLANATION = [
  "🎯 2 to 4 players. Single 52-card deck (51 cards for 3 players).",
  "🃏 Follow Suit: You MUST follow the lead suit if you have one.",
  "👑 Highest lead suit card wins the round (Ace is highest).",
  "📦 Center Dhagla Pile: Played cards pile up in the center.",
  "🔥 Consecutive Capture Rule: Win 2 rounds in a row to capture the ENTIRE center Dhagla pile!",
  "🏆 Scoring: Capture the 4 Tens (♥10, ♦10, ♣10, ♠10) to win the match!",
];
