export type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";

export const SNAKE_GRID_SIZE = 16;

export type SnakeDifficultyKey = "EASY" | "MEDIUM" | "HARD";

export interface SnakeDifficultyConfig {
  name: string;
  speed: number; // Milliseconds per tick
  pointsPerFood: number;
  description: string;
}

export const SNAKE_DIFFICULTIES: Record<SnakeDifficultyKey, SnakeDifficultyConfig> = {
  EASY: {
    name: "Casual",
    speed: 160,
    pointsPerFood: 10,
    description: "Relaxed speed, perfect for mastering gestures.",
  },
  MEDIUM: {
    name: "Classic",
    speed: 110,
    pointsPerFood: 20,
    description: "Original arcade speed and reflex challenge.",
  },
  HARD: {
    name: "Insane",
    speed: 70,
    pointsPerFood: 35,
    description: "Blazing fast speed for snake masters.",
  },
};

export interface GridPosition {
  x: number;
  y: number;
}

export const SNAKE_SCREEN = {
  DIFFICULTY: "DIFFICULTY",
  GAME: "GAME",
  RESULT: "RESULT",
} as const;

export type SnakeScreenType = (typeof SNAKE_SCREEN)[keyof typeof SNAKE_SCREEN];
