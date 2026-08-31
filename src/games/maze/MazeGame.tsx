import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Direction,
  MAZE_DIFFICULTIES,
  MAZE_SCREEN,
  MazeCell,
  MazeDifficultyConfig,
  MazeDifficultyKey,
  MazePosition,
  MazeScreenType,
} from "./mazeTypes";
import {
  canMoveInMaze,
  findShortestMazePath,
  formatTime,
  generateMaze,
  getNextMazePosition,
} from "./mazeUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface MazeGameProps {
  onBackToHome: () => void;
}

export default function MazeGame({ onBackToHome }: MazeGameProps): React.JSX.Element {
  const [screen, setScreen] = useState<MazeScreenType>(MAZE_SCREEN.DIFFICULTY);
  const [difficultyKey, setDifficultyKey] = useState<MazeDifficultyKey>("EASY");
  const [level, setLevel] = useState<number>(1);
  const [maze, setMaze] = useState<MazeCell[][] | null>(null);
  const [player, setPlayer] = useState<MazePosition>({ row: 0, col: 0 });
  const [seconds, setSeconds] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [hintCell, setHintCell] = useState<MazePosition | null>(null);

  const difficulty = MAZE_DIFFICULTIES[difficultyKey];

  const exitPosition = useMemo<MazePosition>(() => {
    if (!maze) {
      return { row: 0, col: 0 };
    }
    return { row: maze.length - 1, col: maze[0].length - 1 };
  }, [maze]);

  useEffect(() => {
    if (!isStarted || isFinished) {
      return;
    }
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isFinished]);

  useEffect(() => {
    if (!hintCell) {
      return;
    }
    const timeout = setTimeout(() => {
      setHintCell(null);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [hintCell]);

  function startNewGame(selectedDifficultyKey: MazeDifficultyKey = difficultyKey) {
    const config = MAZE_DIFFICULTIES[selectedDifficultyKey];
    const newGrid = generateMaze(config.rows, config.cols);

    setMaze(newGrid);
    setPlayer({ row: 0, col: 0 });
    setSeconds(0);
    setMoves(0);
    setHintCell(null);
    setIsStarted(true);
    setIsFinished(false);
    setScreen(MAZE_SCREEN.GAME);
  }

  function selectDifficulty(key: MazeDifficultyKey) {
    setDifficultyKey(key);
    setLevel(1);
    startNewGame(key);
  }

  function movePlayer(direction: Direction) {
    if (!maze || isFinished) {
      return;
    }
    if (!canMoveInMaze(maze, player, direction)) {
      return;
    }

    const nextPos = getNextMazePosition(player, direction);
    setPlayer(nextPos);
    setMoves((prev) => prev + 1);

    if (
      nextPos.row === exitPosition.row &&
      nextPos.col === exitPosition.col
    ) {
      setIsFinished(true);
      setIsStarted(false);
      setScreen(MAZE_SCREEN.RESULT);
    }
  }

  function showHint() {
    if (!maze || isFinished) {
      return;
    }
    const path = findShortestMazePath(maze, player, exitPosition);
    if (path.length > 1) {
      setHintCell(path[1]);
    }
  }

  function nextLevel() {
    setLevel((prev) => prev + 1);
    const newGrid = generateMaze(difficulty.rows, difficulty.cols);
    setMaze(newGrid);
    setPlayer({ row: 0, col: 0 });
    setSeconds(0);
    setMoves(0);
    setHintCell(null);
    setIsFinished(false);
    setIsStarted(true);
    setScreen(MAZE_SCREEN.GAME);
  }

  // Ref to always use latest movePlayer in PanResponder
  const movePlayerRef = useRef<(dir: Direction) => void>(() => {});
  useEffect(() => {
    movePlayerRef.current = movePlayer;
  });

  const lastSwipePos = useRef({ x: 0, y: 0 });
  const hasMovedInGesture = useRef(false);
  const SWIPE_STEP = 24;
  const MIN_FLICK = 14;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6,
        onPanResponderGrant: () => {
          lastSwipePos.current = { x: 0, y: 0 };
          hasMovedInGesture.current = false;
        },
        onPanResponderMove: (_, gestureState) => {
          const deltaX = gestureState.dx - lastSwipePos.current.x;
          const deltaY = gestureState.dy - lastSwipePos.current.y;

          if (
            Math.abs(deltaX) >= SWIPE_STEP ||
            Math.abs(deltaY) >= SWIPE_STEP
          ) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              movePlayerRef.current(deltaX > 0 ? "RIGHT" : "LEFT");
            } else {
              movePlayerRef.current(deltaY > 0 ? "DOWN" : "UP");
            }
            lastSwipePos.current.x = gestureState.dx;
            lastSwipePos.current.y = gestureState.dy;
            hasMovedInGesture.current = true;
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!hasMovedInGesture.current) {
            const { dx, dy } = gestureState;
            if (Math.abs(dx) >= MIN_FLICK || Math.abs(dy) >= MIN_FLICK) {
              if (Math.abs(dx) > Math.abs(dy)) {
                movePlayerRef.current(dx > 0 ? "RIGHT" : "LEFT");
              } else {
                movePlayerRef.current(dy > 0 ? "DOWN" : "UP");
              }
            }
          }
        },
      }),
    []
  );

  /* -------------------------------------------------------
     DIFFICULTY VIEW
     ------------------------------------------------------- */
  if (screen === MAZE_SCREEN.DIFFICULTY) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>MAZE RUNNER</Text>
        <Text style={styles.screenSubtitle}>
          Choose your labyrinth difficulty:
        </Text>

        {(
          Object.entries(MAZE_DIFFICULTIES) as [
            MazeDifficultyKey,
            MazeDifficultyConfig
          ][]
        ).map(([key, item]) => (
          <Pressable
            key={key}
            style={styles.difficultyButton}
            onPress={() => selectDifficulty(key)}
          >
            <Text style={styles.difficultyName}>{item.name.toUpperCase()}</Text>
            <Text style={styles.difficultyGrid}>
              {item.rows} × {item.cols}
            </Text>
            <Text style={styles.difficultyDescription}>{item.description}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.secondaryButton} onPress={onBackToHome}>
          <Text style={styles.secondaryButtonText}>BACK TO MENU</Text>
        </Pressable>
      </View>
    );
  }

  /* -------------------------------------------------------
     RESULT / COMPLETE VIEW
     ------------------------------------------------------- */
  if (screen === MAZE_SCREEN.RESULT) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.resultTitle}>MAZE COMPLETE!</Text>
        <Text style={styles.resultDifficulty}>
          {difficulty.name.toUpperCase()} · LEVEL {level}
        </Text>

        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>COMPLETION TIME</Text>
            <Text style={styles.resultValue}>{formatTime(seconds)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>TOTAL MOVES</Text>
            <Text style={styles.resultValue}>{moves}</Text>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={nextLevel}>
          <Text style={styles.primaryButtonText}>NEXT MAZE</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onBackToHome}>
          <Text style={styles.secondaryButtonText}>ARCADE MENU</Text>
        </Pressable>
      </View>
    );
  }

  /* -------------------------------------------------------
     GAMEPLAY VIEW
     ------------------------------------------------------- */
  const cols = maze ? maze[0].length : 8;
  const availableWidth = SCREEN_WIDTH - 36;
  const cellSize = Math.floor(availableWidth / cols);

  return (
    <ScrollView
      style={styles.scrollScreen}
      contentContainerStyle={styles.gameContent}
      showsVerticalScrollIndicator={false}
      {...panResponder.panHandlers}
    >
      <View style={styles.gameHeader}>
        <View>
          <Text style={styles.gameDifficulty}>
            {difficulty.name.toUpperCase()}
          </Text>
          <Text style={styles.levelText}>LEVEL {level}</Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{formatTime(seconds)}</Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statLabel}>MOVES</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
      </View>

      <Text style={styles.goalText}>🟢 Player → Find the 🟥 Exit</Text>

      {maze && (
        <View
          style={[
            styles.mazeContainer,
            {
              width: cellSize * cols,
              height: cellSize * maze.length,
            },
          ]}
        >
          {maze.map((row) =>
            row.map((cell) => {
              const isPlayer =
                player.row === cell.row && player.col === cell.col;

              const isExit =
                exitPosition.row === cell.row && exitPosition.col === cell.col;

              const isHint =
                hintCell &&
                hintCell.row === cell.row &&
                hintCell.col === cell.col;

              return (
                <View
                  key={`${cell.row}-${cell.col}`}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                    },
                    cell.walls.top && styles.wallTop,
                    cell.walls.right && styles.wallRight,
                    cell.walls.bottom && styles.wallBottom,
                    cell.walls.left && styles.wallLeft,
                    isHint && styles.hintCell,
                  ]}
                >
                  {isPlayer && (
                    <View
                      style={[
                        styles.player,
                        {
                          width: Math.max(8, cellSize * 0.45),
                          height: Math.max(8, cellSize * 0.45),
                          borderRadius: Math.max(4, cellSize * 0.23),
                        },
                      ]}
                    />
                  )}

                  {isExit && !isPlayer && (
                    <View
                      style={[
                        styles.exit,
                        {
                          width: Math.max(8, cellSize * 0.5),
                          height: Math.max(8, cellSize * 0.5),
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      <View style={styles.gestureZone}>
        <Text style={styles.gestureIcon}>👆</Text>
        <Text style={styles.gestureTitle}>SWIPE TO MOVE</Text>
        <Text style={styles.gestureSubtitle}>
          Swipe or drag in any direction to explore the maze
        </Text>
      </View>

      <Pressable style={styles.hintButton} onPress={showHint}>
        <Text style={styles.hintButtonText}>💡 HINT</Text>
      </Pressable>

      <Pressable style={styles.quitButton} onPress={onBackToHome}>
        <Text style={styles.quitButtonText}>QUIT TO MENU</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
  },

  centerScreen: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollScreen: {
    flex: 1,
  },

  gameContent: {
    padding: 18,
    alignItems: "center",
    paddingBottom: 40,
  },

  screenTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  screenSubtitle: {
    color: "#A8B0C2",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  primaryButton: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: "#49D17D",
    alignItems: "center",
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#08130C",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },

  secondaryButton: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B4355",
    alignItems: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#D8DCE5",
    fontWeight: "800",
    letterSpacing: 1,
  },

  difficultyButton: {
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#293248",
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
  },

  difficultyName: {
    color: "#49D17D",
    fontSize: 22,
    fontWeight: "900",
  },

  difficultyGrid: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },

  difficultyDescription: {
    color: "#98A2B3",
    marginTop: 8,
  },

  gameHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#151C2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  gameDifficulty: {
    color: "#49D17D",
    fontWeight: "900",
    fontSize: 16,
  },

  levelText: {
    color: "#FFFFFF",
    marginTop: 3,
    fontWeight: "700",
  },

  stats: {
    alignItems: "center",
  },

  statLabel: {
    color: "#7B8497",
    fontSize: 10,
    fontWeight: "800",
  },

  statValue: {
    color: "#FFFFFF",
    marginTop: 4,
    fontSize: 17,
    fontWeight: "800",
  },

  goalText: {
    color: "#A8B0C2",
    marginBottom: 14,
    fontSize: 14,
  },

  mazeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#101727",
  },

  cell: {
    borderColor: "#D8DCE5",
    alignItems: "center",
    justifyContent: "center",
  },

  wallTop: {
    borderTopWidth: 2,
  },

  wallRight: {
    borderRightWidth: 2,
  },

  wallBottom: {
    borderBottomWidth: 2,
  },

  wallLeft: {
    borderLeftWidth: 2,
  },

  player: {
    backgroundColor: "#49D17D",
  },

  exit: {
    backgroundColor: "#FF4D4F",
  },

  hintCell: {
    backgroundColor: "#FFD24A",
  },

  hintButton: {
    backgroundColor: "#273047",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 16,
  },

  hintButtonText: {
    color: "#FFD24A",
    fontWeight: "900",
    fontSize: 15,
  },

  gestureZone: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#28344E",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 16,
  },

  gestureIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  gestureTitle: {
    color: "#49D17D",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  gestureSubtitle: {
    color: "#8B96AA",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  quitButton: {
    marginTop: 14,
    padding: 10,
  },

  quitButtonText: {
    color: "#FF7373",
    fontWeight: "800",
    fontSize: 13,
  },

  trophy: {
    fontSize: 64,
    marginBottom: 8,
  },

  resultTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  resultDifficulty: {
    color: "#49D17D",
    fontWeight: "800",
    marginTop: 10,
  },

  resultCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#151C2E",
    borderRadius: 14,
    padding: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  resultRow: {
    paddingVertical: 8,
  },

  resultLabel: {
    color: "#8D96A8",
    fontSize: 11,
    fontWeight: "800",
  },

  resultValue: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 4,
  },
});
