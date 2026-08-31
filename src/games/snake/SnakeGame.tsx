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
  GridPosition,
  SNAKE_DIFFICULTIES,
  SNAKE_GRID_SIZE,
  SNAKE_SCREEN,
  SnakeDifficultyConfig,
  SnakeDifficultyKey,
  SnakeScreenType,
} from "./snakeTypes";
import { generateRandomSnakeFood } from "./snakeUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface SnakeGameProps {
  onBackToHome: () => void;
}

export default function SnakeGame({ onBackToHome }: SnakeGameProps): React.JSX.Element {
  const [screen, setScreen] = useState<SnakeScreenType>(SNAKE_SCREEN.DIFFICULTY);
  const [difficultyKey, setDifficultyKey] = useState<SnakeDifficultyKey>("MEDIUM");
  const [snake, setSnake] = useState<GridPosition[]>([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ]);
  const [snakeDirection, setSnakeDirection] = useState<Direction>("RIGHT");
  const [snakeFood, setSnakeFood] = useState<GridPosition>({ x: 12, y: 8 });
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>("");

  const difficulty = SNAKE_DIFFICULTIES[difficultyKey];

  // Ref to hold intended snake direction without delay/lag
  const nextSnakeDirectionRef = useRef<Direction>("RIGHT");

  function startNewGame(key: SnakeDifficultyKey = difficultyKey) {
    const initialSnake: GridPosition[] = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    setDifficultyKey(key);
    setSnake(initialSnake);
    setSnakeDirection("RIGHT");
    nextSnakeDirectionRef.current = "RIGHT";
    setSnakeFood(generateRandomSnakeFood(initialSnake, SNAKE_GRID_SIZE));
    setScore(0);
    setIsRunning(true);
    setIsPaused(false);
    setGameOverReason("");
    setScreen(SNAKE_SCREEN.GAME);
  }

  function selectDifficulty(key: SnakeDifficultyKey) {
    setDifficultyKey(key);
    startNewGame(key);
  }

  function handleDirectionChange(newDir: Direction) {
    const currentDir = nextSnakeDirectionRef.current;
    // Prevent 180-degree instant reversal into own body
    if (
      (newDir === "UP" && currentDir === "DOWN") ||
      (newDir === "DOWN" && currentDir === "UP") ||
      (newDir === "LEFT" && currentDir === "RIGHT") ||
      (newDir === "RIGHT" && currentDir === "LEFT")
    ) {
      return;
    }
    nextSnakeDirectionRef.current = newDir;
  }

  // Snake Tick Engine
  useEffect(() => {
    if (screen !== SNAKE_SCREEN.GAME || !isRunning || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      const currentDir = nextSnakeDirectionRef.current;
      setSnakeDirection(currentDir);

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead: GridPosition;

        if (currentDir === "UP") {
          newHead = { x: head.x, y: head.y - 1 };
        } else if (currentDir === "DOWN") {
          newHead = { x: head.x, y: head.y + 1 };
        } else if (currentDir === "LEFT") {
          newHead = { x: head.x - 1, y: head.y };
        } else {
          newHead = { x: head.x + 1, y: head.y };
        }

        // 1. SCREEN / BOARD BORDER COLLISION CHECK
        if (
          newHead.x < 0 ||
          newHead.x >= SNAKE_GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= SNAKE_GRID_SIZE
        ) {
          setIsRunning(false);
          setGameOverReason("💥 Touched the screen border!");
          setScreen(SNAKE_SCREEN.RESULT);
          return prevSnake;
        }

        // 2. SELF-COLLISION CHECK
        const isCapturingFood =
          newHead.x === snakeFood.x && newHead.y === snakeFood.y;

        // If not eating, the tail will advance, so ignore the very last tail segment
        const bodyToCheck = isCapturingFood
          ? prevSnake
          : prevSnake.slice(0, -1);

        const isSelfCollision = bodyToCheck.some(
          (seg) => seg.x === newHead.x && seg.y === newHead.y
        );

        if (isSelfCollision) {
          setIsRunning(false);
          setGameOverReason("💥 Crashed into your own body!");
          setScreen(SNAKE_SCREEN.RESULT);
          return prevSnake;
        }

        // 3. MOVE & GROW
        const updatedSnake = [newHead, ...prevSnake];

        if (isCapturingFood) {
          const pointsEarned =
            SNAKE_DIFFICULTIES[difficultyKey].pointsPerFood;
          setScore((prevScore) => {
            const nextScore = prevScore + pointsEarned;
            setHighScore((prevHigh) => Math.max(prevHigh, nextScore));
            return nextScore;
          });
          setSnakeFood(
            generateRandomSnakeFood(updatedSnake, SNAKE_GRID_SIZE)
          );
        } else {
          updatedSnake.pop(); // Remove tail segment when not growing
        }

        return updatedSnake;
      });
    }, difficulty.speed);

    return () => clearInterval(interval);
  }, [
    screen,
    isRunning,
    isPaused,
    difficulty.speed,
    snakeFood,
    difficultyKey,
  ]);

  const handleSwipeRef = useRef<(dir: Direction) => void>(() => {});
  useEffect(() => {
    handleSwipeRef.current = handleDirectionChange;
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8,
        onPanResponderRelease: (_, gestureState) => {
          const { dx, dy } = gestureState;
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            return;
          }

          if (Math.abs(dx) > Math.abs(dy)) {
            handleSwipeRef.current(dx > 0 ? "RIGHT" : "LEFT");
          } else {
            handleSwipeRef.current(dy > 0 ? "DOWN" : "UP");
          }
        },
      }),
    []
  );

  /* -------------------------------------------------------
     DIFFICULTY VIEW
     ------------------------------------------------------- */
  if (screen === SNAKE_SCREEN.DIFFICULTY) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>SNAKE SPEED</Text>
        <Text style={styles.screenSubtitle}>
          Choose snake movement velocity:
        </Text>

        {(
          Object.entries(SNAKE_DIFFICULTIES) as [
            SnakeDifficultyKey,
            SnakeDifficultyConfig
          ][]
        ).map(([key, item]) => (
          <Pressable
            key={key}
            style={[styles.difficultyButton, styles.snakeCardBorder]}
            onPress={() => selectDifficulty(key)}
          >
            <Text style={styles.snakeDifficultyTitle}>
              {item.name.toUpperCase()}
            </Text>
            <Text style={styles.difficultyGrid}>
              +{item.pointsPerFood} Pts per Energy Dot
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
     RESULT / GAME OVER VIEW
     ------------------------------------------------------- */
  if (screen === SNAKE_SCREEN.RESULT) {
    const isNewHigh = score > 0 && score >= highScore;

    return (
      <View style={styles.centerScreen}>
        <Text style={styles.trophy}>{isNewHigh ? "🏆" : "💀"}</Text>
        <Text style={styles.resultTitle}>
          {isNewHigh ? "NEW HIGH SCORE!" : "GAME OVER"}
        </Text>
        <Text style={styles.snakeReasonText}>{gameOverReason}</Text>

        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>FINAL SCORE</Text>
            <Text style={styles.snakeScoreValue}>{score}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>SNAKE LENGTH</Text>
            <Text style={styles.resultValue}>{snake.length} Segments</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>BEST SCORE</Text>
            <Text style={styles.resultValue}>{highScore}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, styles.snakePlayBadge]}
          onPress={() => startNewGame(difficultyKey)}
        >
          <Text style={styles.snakePlayText}>PLAY AGAIN</Text>
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
  const availableWidth = SCREEN_WIDTH - 36;
  const cellSize = Math.floor(availableWidth / SNAKE_GRID_SIZE);
  const boardSize = cellSize * SNAKE_GRID_SIZE;

  return (
    <ScrollView
      style={styles.scrollScreen}
      contentContainerStyle={styles.gameContent}
      showsVerticalScrollIndicator={false}
      {...panResponder.panHandlers}
    >
      <View style={styles.gameHeader}>
        <View>
          <Text style={styles.snakeDifficultyTitle}>
            {difficulty.name.toUpperCase()}
          </Text>
          <Text style={styles.levelText}>LENGTH: {snake.length}</Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statLabel}>BEST</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>

      <Text style={styles.snakeBorderWarning}>
        ⚠️ Don&apos;t touch the border or tail!
      </Text>

      {/* Snake Board */}
      <View
        style={[
          styles.snakeBoard,
          {
            width: boardSize,
            height: boardSize,
          },
        ]}
      >
        {/* Render Food Dot */}
        <View
          style={[
            styles.snakeFoodDot,
            {
              width: cellSize * 0.8,
              height: cellSize * 0.8,
              left: snakeFood.x * cellSize + cellSize * 0.1,
              top: snakeFood.y * cellSize + cellSize * 0.1,
              borderRadius: (cellSize * 0.8) / 2,
            },
          ]}
        />

        {/* Render Snake Body Segments */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <View
              key={`seg-${index}-${segment.x}-${segment.y}`}
              style={[
                isHead ? styles.snakeHead : styles.snakeBody,
                {
                  width: isHead ? cellSize * 0.9 : cellSize * 0.8,
                  height: isHead ? cellSize * 0.9 : cellSize * 0.8,
                  left:
                    segment.x * cellSize +
                    (isHead ? cellSize * 0.05 : cellSize * 0.1),
                  top:
                    segment.y * cellSize +
                    (isHead ? cellSize * 0.05 : cellSize * 0.1),
                },
              ]}
            >
              {isHead && (
                <View style={styles.snakeEyesRow}>
                  <View
                    style={[
                      styles.snakeEye,
                      snakeDirection === "UP" && styles.eyeUp,
                      snakeDirection === "DOWN" && styles.eyeDown,
                    ]}
                  />
                  <View
                    style={[
                      styles.snakeEye,
                      snakeDirection === "UP" && styles.eyeUp,
                      snakeDirection === "DOWN" && styles.eyeDown,
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.gestureZone}>
        <Text style={styles.gestureIcon}>👆</Text>
        <Text style={styles.snakeGestureTitle}>SWIPE TO STEER</Text>
        <Text style={styles.gestureSubtitle}>
          Swipe Up, Down, Left, or Right to direct the snake
        </Text>
      </View>

      <View style={styles.snakeActionRow}>
        <Pressable
          style={styles.pauseButton}
          onPress={() => setIsPaused((prev) => !prev)}
        >
          <Text style={styles.pauseButtonText}>
            {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
          </Text>
        </Pressable>

        <Pressable style={styles.quitButton} onPress={onBackToHome}>
          <Text style={styles.quitButtonText}>QUIT TO MENU</Text>
        </Pressable>
      </View>
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
    alignItems: "center",
    marginTop: 12,
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

  snakeCardBorder: {
    borderColor: "#00E5FF33",
  },

  snakeDifficultyTitle: {
    color: "#00E5FF",
    fontSize: 20,
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

  snakeGestureTitle: {
    color: "#00E5FF",
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

  snakeBoard: {
    backgroundColor: "#0D1424",
    borderWidth: 3,
    borderColor: "#FF4D4F", // Red border indicating lethal boundary
    position: "relative",
  },

  snakeBorderWarning: {
    color: "#FF7373",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 12,
  },

  snakeFoodDot: {
    position: "absolute",
    backgroundColor: "#FFD24A",
    shadowColor: "#FFD24A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },

  snakeHead: {
    position: "absolute",
    backgroundColor: "#00E5FF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 6,
  },

  snakeEyesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%",
  },

  snakeEye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#08130C",
  },

  eyeUp: {
    marginTop: -2,
  },

  eyeDown: {
    marginBottom: -2,
  },

  snakeBody: {
    position: "absolute",
    backgroundColor: "#00B4D8",
    zIndex: 5,
    borderRadius: 4,
  },

  snakeActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },

  pauseButton: {
    backgroundColor: "#1D2B44",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#304266",
    marginTop: 14,
  },

  pauseButtonText: {
    color: "#00E5FF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },

  snakeReasonText: {
    color: "#FF7373",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },

  snakeScoreValue: {
    color: "#00E5FF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

  snakePlayBadge: {
    backgroundColor: "#00E5FF",
  },

  snakePlayText: {
    color: "#002733",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});
