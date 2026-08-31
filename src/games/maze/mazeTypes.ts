export type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";

export type MazeDifficultyKey = "EASY" | "MEDIUM" | "HARD";

export interface MazeDifficultyConfig {
  name: string;
  rows: number;
  cols: number;
  description: string;
}

export const MAZE_DIFFICULTIES: Record<MazeDifficultyKey, MazeDifficultyConfig> = {
  EASY: {
    name: "Easy",
    rows: 8,
    cols: 8,
    description: "A small maze to learn the game.",
  },
  MEDIUM: {
    name: "Medium",
    rows: 12,
    cols: 12,
    description: "More paths and more challenge.",
  },
  HARD: {
    name: "Hard",
    rows: 16,
    cols: 16,
    description: "A large and difficult maze.",
  },
};

export interface MazeWalls {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface MazeCell {
  row: number;
  col: number;
  visited: boolean;
  walls: MazeWalls;
}

export interface MazePosition {
  row: number;
  col: number;
}

export interface MazeNeighbor {
  cell: MazeCell;
  direction: Direction;
}

export const MAZE_SCREEN = {
  DIFFICULTY: "DIFFICULTY",
  GAME: "GAME",
  RESULT: "RESULT",
} as const;

export type MazeScreenType = (typeof MAZE_SCREEN)[keyof typeof MAZE_SCREEN];
