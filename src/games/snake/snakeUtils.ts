import { GridPosition } from "./snakeTypes";

export function generateRandomSnakeFood(
  snake: GridPosition[],
  gridSize: number
): GridPosition {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available: GridPosition[] = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return { x: 0, y: 0 };
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
