import {
  Direction,
  MazeCell,
  MazeNeighbor,
  MazePosition,
} from "./mazeTypes";

export function createMazeGrid(rows: number, cols: number): MazeCell[][] {
  const grid: MazeCell[][] = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: MazeCell[] = [];

    for (let col = 0; col < cols; col++) {
      currentRow.push({
        row,
        col,
        visited: false,
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        },
      });
    }

    grid.push(currentRow);
  }

  return grid;
}

export function getUnvisitedNeighbors(
  grid: MazeCell[][],
  cell: MazeCell,
  rows: number,
  cols: number
): MazeNeighbor[] {
  const neighbors: MazeNeighbor[] = [];
  const { row, col } = cell;

  if (row > 0 && !grid[row - 1][col].visited) {
    neighbors.push({
      cell: grid[row - 1][col],
      direction: "UP",
    });
  }

  if (col < cols - 1 && !grid[row][col + 1].visited) {
    neighbors.push({
      cell: grid[row][col + 1],
      direction: "RIGHT",
    });
  }

  if (row < rows - 1 && !grid[row + 1][col].visited) {
    neighbors.push({
      cell: grid[row + 1][col],
      direction: "DOWN",
    });
  }

  if (col > 0 && !grid[row][col - 1].visited) {
    neighbors.push({
      cell: grid[row][col - 1],
      direction: "LEFT",
    });
  }

  return neighbors;
}

export function removeMazeWall(
  currentCell: MazeCell,
  nextCell: MazeCell,
  direction: Direction
): void {
  if (direction === "UP") {
    currentCell.walls.top = false;
    nextCell.walls.bottom = false;
  }

  if (direction === "RIGHT") {
    currentCell.walls.right = false;
    nextCell.walls.left = false;
  }

  if (direction === "DOWN") {
    currentCell.walls.bottom = false;
    nextCell.walls.top = false;
  }

  if (direction === "LEFT") {
    currentCell.walls.left = false;
    nextCell.walls.right = false;
  }
}

export function generateMaze(rows: number, cols: number): MazeCell[][] {
  const grid = createMazeGrid(rows, cols);

  const startCell = grid[0][0];
  startCell.visited = true;

  const stack: MazeCell[] = [startCell];

  while (stack.length > 0) {
    const currentCell = stack[stack.length - 1];

    const neighbors = getUnvisitedNeighbors(grid, currentCell, rows, cols);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const randomIndex = Math.floor(Math.random() * neighbors.length);
    const selectedNeighbor = neighbors[randomIndex];

    removeMazeWall(
      currentCell,
      selectedNeighbor.cell,
      selectedNeighbor.direction
    );

    selectedNeighbor.cell.visited = true;
    stack.push(selectedNeighbor.cell);
  }

  return grid;
}

export function canMoveInMaze(
  maze: MazeCell[][],
  player: MazePosition,
  direction: Direction
): boolean {
  const cell = maze[player.row][player.col];

  if (direction === "UP") {
    return !cell.walls.top && player.row > 0;
  }

  if (direction === "RIGHT") {
    return !cell.walls.right && player.col < maze[0].length - 1;
  }

  if (direction === "DOWN") {
    return !cell.walls.bottom && player.row < maze.length - 1;
  }

  if (direction === "LEFT") {
    return !cell.walls.left && player.col > 0;
  }

  return false;
}

export function getNextMazePosition(
  player: MazePosition,
  direction: Direction
): MazePosition {
  if (direction === "UP") {
    return { row: player.row - 1, col: player.col };
  }
  if (direction === "RIGHT") {
    return { row: player.row, col: player.col + 1 };
  }
  if (direction === "DOWN") {
    return { row: player.row + 1, col: player.col };
  }
  if (direction === "LEFT") {
    return { row: player.row, col: player.col - 1 };
  }
  return player;
}

export function getAvailableMazeNeighbors(
  maze: MazeCell[][],
  position: MazePosition
): MazePosition[] {
  const cell = maze[position.row][position.col];
  const rows = maze.length;
  const cols = maze[0].length;

  const neighbors: MazePosition[] = [];

  if (!cell.walls.top && position.row > 0) {
    neighbors.push({ row: position.row - 1, col: position.col });
  }
  if (!cell.walls.right && position.col < cols - 1) {
    neighbors.push({ row: position.row, col: position.col + 1 });
  }
  if (!cell.walls.bottom && position.row < rows - 1) {
    neighbors.push({ row: position.row + 1, col: position.col });
  }
  if (!cell.walls.left && position.col > 0) {
    neighbors.push({ row: position.row, col: position.col - 1 });
  }

  return neighbors;
}

export function findShortestMazePath(
  maze: MazeCell[][],
  start: MazePosition,
  end: MazePosition
): MazePosition[] {
  const queue: MazePosition[][] = [[start]];
  const visited = new Set<string>();

  visited.add(`${start.row}-${start.col}`);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current.row === end.row && current.col === end.col) {
      return path;
    }

    const neighbors = getAvailableMazeNeighbors(maze, current);

    for (const neighbor of neighbors) {
      const key = `${neighbor.row}-${neighbor.col}`;

      if (!visited.has(key)) {
        visited.add(key);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}
