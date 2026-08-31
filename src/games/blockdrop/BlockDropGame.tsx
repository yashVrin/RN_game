import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ShapeKey = "I" | "O" | "T" | "L" | "J" | "S" | "Z";
type BoardCell = string | null;
type ScreenState = "PLAY" | "RESULT";

interface BlockDropGameProps {
  onBackToHome: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Piece {
  shape: ShapeKey;
  rotation: number;
  x: number;
  y: number;
  color: string;
}

interface LockedResult {
  board: BoardCell[];
  cleared: number;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SPAWN_X = 3;
const CLEAR_SCORE = [0, 100, 300, 500, 800];
const SCREEN_WIDTH = Dimensions.get("window").width;

const PIECES: Record<
  ShapeKey,
  {
    color: string;
    rotations: Point[][];
  }
> = {
  I: {
    color: "#49D17D",
    rotations: [
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
      [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ],
      [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
      ],
    ],
  },
  O: {
    color: "#FFB74D",
    rotations: [
      [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
    ],
  },
  T: {
    color: "#29B6F6",
    rotations: [
      [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    ],
  },
  L: {
    color: "#FB8C00",
    rotations: [
      [
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    ],
  },
  J: {
    color: "#5C6BC0",
    rotations: [
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
      [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
    ],
  },
  S: {
    color: "#26A69A",
    rotations: [
      [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    ],
  },
  Z: {
    color: "#EF5350",
    rotations: [
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      [
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 0, y: 2 },
      ],
    ],
  },
};

const SHAPE_KEYS = Object.keys(PIECES) as ShapeKey[];
const EMPTY_ROW = () => Array.from({ length: BOARD_WIDTH }, () => null as BoardCell);

function createBoard(): BoardCell[] {
  return Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, () => null);
}

function createRandomPiece(): Piece {
  const shape = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];

  return {
    shape,
    rotation: 0,
    x: SPAWN_X,
    y: 0,
    color: PIECES[shape].color,
  };
}

function getPieceCells(
  shape: ShapeKey,
  rotation: number,
  offsetX: number,
  offsetY: number,
): Point[] {
  return PIECES[shape].rotations[rotation].map(cell => ({
    x: cell.x + offsetX,
    y: cell.y + offsetY,
  }));
}

function canPlacePiece(
  board: BoardCell[],
  shape: ShapeKey,
  rotation: number,
  offsetX: number,
  offsetY: number,
): boolean {
  return getPieceCells(shape, rotation, offsetX, offsetY).every(({ x, y }) => {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
      return false;
    }

    return board[y * BOARD_WIDTH + x] === null;
  });
}

function mergePiece(board: BoardCell[], piece: Piece): BoardCell[] {
  const nextBoard = [...board];

  getPieceCells(piece.shape, piece.rotation, piece.x, piece.y).forEach(
    ({ x, y }) => {
      if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
        return;
      }

      nextBoard[y * BOARD_WIDTH + x] = piece.color;
    },
  );

  return nextBoard;
}

function clearCompletedRows(board: BoardCell[]): LockedResult {
  const remainingRows: BoardCell[][] = [];
  let cleared = 0;

  for (let rowIndex = 0; rowIndex < BOARD_HEIGHT; rowIndex += 1) {
    const row = board.slice(
      rowIndex * BOARD_WIDTH,
      rowIndex * BOARD_WIDTH + BOARD_WIDTH,
    );

    if (row.every(cell => cell !== null)) {
      cleared += 1;
    } else {
      remainingRows.push(row);
    }
  }

  while (remainingRows.length < BOARD_HEIGHT) {
    remainingRows.unshift(EMPTY_ROW());
  }

  return {
    board: remainingRows.flat(),
    cleared,
  };
}

function spawnPiece(piece: Piece): Piece {
  return {
    ...piece,
    x: SPAWN_X,
    y: 0,
    rotation: 0,
  };
}

export default function BlockDropGame({
  onBackToHome,
}: BlockDropGameProps): React.JSX.Element {
  const [screen, setScreen] = useState<ScreenState>("PLAY");
  const [board, setBoard] = useState<BoardCell[]>(() => createBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece>(() =>
    createRandomPiece(),
  );
  const [nextPiece, setNextPiece] = useState<Piece>(() => createRandomPiece());
  const [score, setScore] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [gameOverMessage, setGameOverMessage] = useState<string>(
    "The stack reached the ceiling.",
  );

  const boardRef = useRef<BoardCell[]>(board);
  const currentPieceRef = useRef<Piece>(currentPiece);
  const nextPieceRef = useRef<Piece>(nextPiece);
  const screenRef = useRef<ScreenState>(screen);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    nextPieceRef.current = nextPiece;
  }, [nextPiece]);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const level = Math.floor(linesCleared / 10) + 1;
  const dropSpeed = Math.max(140, 720 - (level - 1) * 55);

  const resetGame = useCallback(() => {
    const firstPiece = createRandomPiece();
    const queuedPiece = createRandomPiece();

    const freshBoard = createBoard();

    boardRef.current = freshBoard;
    currentPieceRef.current = firstPiece;
    nextPieceRef.current = queuedPiece;

    setBoard(freshBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(queuedPiece);
    setScore(0);
    setLinesCleared(0);
    setGameOverMessage("The stack reached the ceiling.");
    setScreen("PLAY");
  }, []);

  const lockAndSpawn = useCallback(
    (pieceToLock: Piece, boardState: BoardCell[], queuedPiece: Piece) => {
      const mergedBoard = mergePiece(boardState, pieceToLock);
      const { board: clearedBoard, cleared } = clearCompletedRows(mergedBoard);
      const spawnedPiece = spawnPiece(queuedPiece);
      const canSpawn = canPlacePiece(
        clearedBoard,
        spawnedPiece.shape,
        spawnedPiece.rotation,
        spawnedPiece.x,
        spawnedPiece.y,
      );

      boardRef.current = clearedBoard;
      setBoard(clearedBoard);

      if (cleared > 0) {
        const gainedScore = CLEAR_SCORE[cleared] ?? cleared * 100;
        setScore(prev => prev + gainedScore);
        setLinesCleared(prev => prev + cleared);
      }

      if (!canSpawn) {
        setGameOverMessage("The stack reached the ceiling.");
        setScreen("RESULT");
        screenRef.current = "RESULT";
        return;
      }

      currentPieceRef.current = spawnedPiece;
      nextPieceRef.current = createRandomPiece();
      setCurrentPiece(spawnedPiece);
      setNextPiece(nextPieceRef.current);
    },
    [],
  );

  const softDrop = useCallback(() => {
    if (screenRef.current !== "PLAY") {
      return;
    }

    const liveBoard = boardRef.current;
    const livePiece = currentPieceRef.current;
    const liveNextPiece = nextPieceRef.current;

    const canMoveDown = canPlacePiece(
      liveBoard,
      livePiece.shape,
      livePiece.rotation,
      livePiece.x,
      livePiece.y + 1,
    );

    if (canMoveDown) {
      const updatedPiece = { ...livePiece, y: livePiece.y + 1 };
      currentPieceRef.current = updatedPiece;
      setCurrentPiece(updatedPiece);
      return;
    }

    lockAndSpawn(livePiece, liveBoard, liveNextPiece);
  }, [lockAndSpawn]);

  const moveHorizontal = useCallback(
    (direction: -1 | 1) => {
      if (screenRef.current !== "PLAY") {
        return;
      }

      const liveBoard = boardRef.current;
      const livePiece = currentPieceRef.current;
      const nextX = livePiece.x + direction;
      const canMove = canPlacePiece(
        liveBoard,
        livePiece.shape,
        livePiece.rotation,
        nextX,
        livePiece.y,
      );

      if (canMove) {
        const updatedPiece = { ...livePiece, x: nextX };
        currentPieceRef.current = updatedPiece;
        setCurrentPiece(updatedPiece);
      }
    },
    [],
  );

  const rotatePiece = useCallback(() => {
    if (screenRef.current !== "PLAY") {
      return;
    }

    const liveBoard = boardRef.current;
    const livePiece = currentPieceRef.current;
    const nextRotation =
      (livePiece.rotation + 1) % PIECES[livePiece.shape].rotations.length;
    const wallKicks = [0, -1, 1, -2, 2];

    for (const kick of wallKicks) {
      const nextX = livePiece.x + kick;

      if (
        canPlacePiece(
          liveBoard,
          livePiece.shape,
          nextRotation,
          nextX,
          livePiece.y,
        )
      ) {
        const updatedPiece = {
          ...livePiece,
          rotation: nextRotation,
          x: nextX,
        };
        currentPieceRef.current = updatedPiece;
        setCurrentPiece(updatedPiece);
        return;
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    if (screenRef.current !== "PLAY") {
      return;
    }

    const liveBoard = boardRef.current;
    const livePiece = currentPieceRef.current;
    const liveNextPiece = nextPieceRef.current;
    let landingY = livePiece.y;

    // Drop straight down along current X
    while (
      canPlacePiece(
        liveBoard,
        livePiece.shape,
        livePiece.rotation,
        livePiece.x,
        landingY + 1,
      )
    ) {
      landingY += 1;
    }

    lockAndSpawn(
      {
        ...livePiece,
        y: landingY,
      },
      liveBoard,
      liveNextPiece,
    );
  }, [lockAndSpawn]);

  useEffect(() => {
    if (screen !== "PLAY") {
      return;
    }

    const timer = setInterval(() => {
      softDrop();
    }, dropSpeed);

    return () => clearInterval(timer);
  }, [dropSpeed, screen, softDrop]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10,
        onPanResponderRelease: (_, gestureState) => {
          const { dx, dy } = gestureState;

          if (Math.abs(dx) > Math.abs(dy)) {
            moveHorizontal(dx > 0 ? 1 : -1);
          } else if (dy < -15) {
            rotatePiece();
          } else if (dy > 15) {
            hardDrop();
          }
        },
      }),
    [hardDrop, moveHorizontal, rotatePiece],
  );

  const displayBoard = useMemo(() => {
    const merged = [...board];

    getPieceCells(
      currentPiece.shape,
      currentPiece.rotation,
      currentPiece.x,
      currentPiece.y,
    ).forEach(({ x, y }) => {
      if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
        return;
      }

      merged[y * BOARD_WIDTH + x] = currentPiece.color;
    });

    return merged;
  }, [board, currentPiece]);

  const previewCells = useMemo(() => {
    return getPieceCells(nextPiece.shape, nextPiece.rotation, 0, 0);
  }, [nextPiece]);

  const statusText =
    screen === "PLAY"
      ? "Tap buttons or swipe on board: ◀ ▶ to move, ⟳ to rotate, DROP / ▼ to drop."
      : gameOverMessage;

  const boardWidth = Math.min(SCREEN_WIDTH - 48, 300);
  const cellSize = Math.floor(boardWidth / BOARD_WIDTH);

  if (screen === "RESULT") {
    return (
      <ScrollView
        style={styles.scrollScreen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.badge}>FALLING BLOCKS</Text>
          <Text style={styles.title}>GAME OVER</Text>
          <Text style={styles.subtitle}>{statusText}</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultCardLabel}>FINAL SCORE</Text>
          <Text style={styles.resultScore}>{score}</Text>

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>LINES</Text>
              <Text style={styles.resultStatValue}>{linesCleared}</Text>
            </View>

            <View style={styles.resultStat}>
              <Text style={styles.resultStatLabel}>LEVEL</Text>
              <Text style={styles.resultStatValue}>{level}</Text>
            </View>
          </View>

          <View style={styles.resultPreviewWrap}>
            <Text style={styles.resultPreviewLabel}>LAST BOARD</Text>
            <View style={styles.board}>
              {Array.from({ length: BOARD_HEIGHT }, (_row, rowIndex) => (
                <View key={`res-row-${rowIndex}`} style={styles.boardRow}>
                  {Array.from({ length: BOARD_WIDTH }, (_col, colIndex) => {
                    const cellIndex = rowIndex * BOARD_WIDTH + colIndex;
                    const cell = board[cellIndex];
                    return (
                      <View
                        key={`res-cell-${cellIndex}`}
                        style={[
                          styles.cell,
                          {
                            width: cellSize,
                            height: cellSize,
                          },
                          cell ? { backgroundColor: cell } : null,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={resetGame}>
          <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onBackToHome}>
          <Text style={styles.secondaryButtonText}>BACK TO MENU</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollScreen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.badge}>FALLING BLOCKS</Text>
        <Text style={styles.title}>BLOCK DROP</Text>
        <Text style={styles.subtitle}>
          Build solid rows before the stack reaches the top.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>LINES</Text>
          <Text style={styles.statValue}>{linesCleared}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
      </View>

      <View style={styles.boardSection}>
        <View style={styles.boardHeader}>
          <View>
            <Text style={styles.sectionLabel}>CURRENT BOARD</Text>
            <Text style={styles.sectionHint}>
              Swipe on the board or use the buttons below.
            </Text>
          </View>

          <View style={styles.nextPieceCard}>
            <Text style={styles.sectionLabel}>NEXT</Text>
            <View style={styles.previewGrid}>
              {Array.from({ length: 4 }, (_row, r) => (
                <View key={`prev-row-${r}`} style={styles.previewRow}>
                  {Array.from({ length: 4 }, (_col, c) => {
                    const filled = previewCells.some(
                      cell => cell.x === c && cell.y === r,
                    );
                    return (
                      <View
                        key={`prev-cell-${r}-${c}`}
                        style={[
                          styles.previewCell,
                          filled ? { backgroundColor: nextPiece.color } : null,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 10x20 Board rendered row-by-row */}
        <View style={styles.board} {...panResponder.panHandlers}>
          {Array.from({ length: BOARD_HEIGHT }, (_row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.boardRow}>
              {Array.from({ length: BOARD_WIDTH }, (_col, colIndex) => {
                const cellIndex = rowIndex * BOARD_WIDTH + colIndex;
                const cell = displayBoard[cellIndex];
                return (
                  <View
                    key={`cell-${cellIndex}`}
                    style={[
                      styles.cell,
                      {
                        width: cellSize,
                        height: cellSize,
                      },
                      cell ? { backgroundColor: cell } : null,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.controlPad}>
        <View style={styles.controlRow}>
          <Pressable
            style={styles.controlButton}
            onPressIn={() => moveHorizontal(-1)}
            hitSlop={10}
          >
            <Text style={styles.controlButtonText}>◀</Text>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPressIn={rotatePiece}
            hitSlop={10}
          >
            <Text style={styles.controlButtonText}>⟳</Text>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPressIn={() => moveHorizontal(1)}
            hitSlop={10}
          >
            <Text style={styles.controlButtonText}>▶</Text>
          </Pressable>
        </View>

        <View style={styles.controlRow}>
          <Pressable
            style={[styles.controlButton, styles.hardDropButton]}
            onPressIn={hardDrop}
            hitSlop={10}
          >
            <Text style={styles.hardDropButtonText}>DROP ⚡</Text>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPressIn={softDrop}
            hitSlop={10}
          >
            <Text style={styles.controlButtonText}>▼</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.statusText}>{statusText}</Text>

      <Pressable style={styles.secondaryButton} onPress={onBackToHome}>
        <Text style={styles.secondaryButtonText}>BACK TO MENU</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollScreen: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
    alignItems: "center",
  },
  hero: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  badge: {
    color: "#FF704D",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    color: "#8E99B0",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
  statsRow: {
    width: "100%",
    maxWidth: 380,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    marginHorizontal: 3,
  },
  statLabel: {
    color: "#8E99B0",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  boardSection: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginBottom: 14,
  },
  boardHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 6,
    gap: 12,
  },
  sectionLabel: {
    color: "#D5DBE8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionHint: {
    color: "#8E99B0",
    fontSize: 11,
    lineHeight: 15,
    maxWidth: 200,
  },
  nextPieceCard: {
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  previewGrid: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  previewRow: {
    flexDirection: "row",
  },
  previewCell: {
    width: 12,
    height: 12,
    margin: 1,
    borderRadius: 2,
    backgroundColor: "#1F2940",
  },
  board: {
    alignSelf: "center",
    backgroundColor: "#0D1322",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#253046",
    overflow: "hidden",
  },
  boardRow: {
    flexDirection: "row",
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "#192238",
    backgroundColor: "#11182A",
  },
  controlPad: {
    width: "100%",
    maxWidth: 340,
    marginBottom: 8,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  controlButton: {
    minWidth: 84,
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  hardDropButton: {
    backgroundColor: "#FF704D",
    borderColor: "#FF704D",
    flex: 1.5,
  },
  hardDropButtonText: {
    color: "#2A1208",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  statusText: {
    width: "100%",
    maxWidth: 340,
    color: "#9AA4B8",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  primaryButton: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FF704D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#2A1208",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  secondaryButton: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#D5DBE8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  resultCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resultCardLabel: {
    color: "#8E99B0",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  resultScore: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 12,
  },
  resultStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  resultStat: {
    flex: 1,
    backgroundColor: "#11182A",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  resultStatLabel: {
    color: "#8E99B0",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  resultStatValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  resultPreviewWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  resultPreviewLabel: {
    color: "#8E99B0",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
});
