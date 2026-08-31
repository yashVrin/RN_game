import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PlayerMark = "X" | "O";
type CellValue = PlayerMark | null;
type GameMode = "TWO_PLAYER" | "COMPUTER";
type ScreenState = "MODE_SELECT" | "GAME" | "RESULT";

interface TicTacToeGameProps {
  onBackToHome: () => void;
}

interface WinnerResult {
  winner: PlayerMark;
  line: number[];
}

interface Outcome {
  winner: PlayerMark | null;
  line: number[];
}

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createBoard(): CellValue[] {
  return Array.from({ length: 9 }, () => null);
}

function getWinner(board: CellValue[]): WinnerResult | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const value = board[a];

    if (value && value === board[b] && value === board[c]) {
      return { winner: value, line };
    }
  }

  return null;
}

function isBoardFull(board: CellValue[]): boolean {
  return board.every(cell => cell !== null);
}

function minimax(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean,
): { score: number; move: number | null } {
  const result = getWinner(board);

  if (result?.winner === "O") {
    return { score: 10 - depth, move: null };
  }

  if (result?.winner === "X") {
    return { score: depth - 10, move: null };
  }

  if (isBoardFull(board)) {
    return { score: 0, move: null };
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestMove: number | null = null;

  board.forEach((cell, index) => {
    if (cell !== null) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = isMaximizing ? "O" : "X";
    const evaluation = minimax(nextBoard, depth + 1, !isMaximizing);

    if (
      (isMaximizing && evaluation.score > bestScore) ||
      (!isMaximizing && evaluation.score < bestScore)
    ) {
      bestScore = evaluation.score;
      bestMove = index;
    }
  });

  return { score: bestScore, move: bestMove };
}

function getBestComputerMove(board: CellValue[]): number | null {
  return minimax(board, 0, true).move;
}

export default function TicTacToeGame({
  onBackToHome,
}: TicTacToeGameProps): React.JSX.Element {
  const [screen, setScreen] = useState<ScreenState>("MODE_SELECT");
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [board, setBoard] = useState<CellValue[]>(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState<PlayerMark>("X");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [computerThinking, setComputerThinking] = useState(false);

  function startGame(mode: GameMode) {
    setGameMode(mode);
    setBoard(createBoard());
    setCurrentPlayer("X");
    setOutcome(null);
    setComputerThinking(false);
    setScreen("GAME");
  }

  const resolveMove = useCallback((nextBoard: CellValue[]) => {
    const result = getWinner(nextBoard);

    if (result) {
      setOutcome({ winner: result.winner, line: result.line });
      setScreen("RESULT");
      setComputerThinking(false);
      return;
    }

    if (isBoardFull(nextBoard)) {
      setOutcome({ winner: null, line: [] });
      setScreen("RESULT");
      setComputerThinking(false);
      return;
    }

    setCurrentPlayer(prev => (prev === "X" ? "O" : "X"));
  }, []);

  function handleCellPress(index: number) {
    if (screen !== "GAME" || board[index] !== null || outcome) {
      return;
    }

    if (gameMode === "COMPUTER" && currentPlayer === "O") {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;
    setBoard(nextBoard);
    resolveMove(nextBoard);
  }

  useEffect(() => {
    if (
      screen !== "GAME" ||
      gameMode !== "COMPUTER" ||
      currentPlayer !== "O" ||
      outcome
    ) {
      setComputerThinking(false);
      return;
    }

    setComputerThinking(true);
    const timeout = setTimeout(() => {
      const move = getBestComputerMove(board);

      if (move === null) {
        setComputerThinking(false);
        return;
      }

      const nextBoard = [...board];
      nextBoard[move] = "O";
      setBoard(nextBoard);
      resolveMove(nextBoard);
    }, 650);

    return () => clearTimeout(timeout);
  }, [board, currentPlayer, gameMode, outcome, resolveMove, screen]);

  const statusText = useMemo(() => {
    if (screen === "MODE_SELECT") {
      return "Choose how you want to play.";
    }

    if (screen === "RESULT") {
      return outcome?.winner
        ? "A new match is ready when you are."
        : "That round ended in a draw.";
    }

    if (gameMode === "COMPUTER" && currentPlayer === "O") {
      return computerThinking ? "Computer is thinking..." : "Computer is moving.";
    }

    return currentPlayer === "X" ? "X's turn" : "O's turn";
  }, [computerThinking, currentPlayer, gameMode, outcome, screen]);

  const resultTitle = useMemo(() => {
    if (!outcome) {
      return "";
    }

    if (outcome.winner === null) {
      return "IT'S A DRAW";
    }

    if (gameMode === "COMPUTER") {
      return outcome.winner === "X" ? "YOU WIN!" : "COMPUTER WINS!";
    }

    return `${outcome.winner} WINS!`;
  }, [gameMode, outcome]);

  const resultSubtitle = useMemo(() => {
    if (!outcome) {
      return "";
    }

    if (outcome.winner === null) {
      return "Both players blocked each other.";
    }

    if (gameMode === "COMPUTER") {
      return outcome.winner === "X"
        ? "You beat the computer."
        : "The computer found the winning line.";
    }

    return `Player ${outcome.winner} made the winning line.`;
  }, [gameMode, outcome]);

  if (screen === "MODE_SELECT") {
    return (
      <ScrollView
        style={styles.scrollScreen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.badge}>ARENA DUEL</Text>
          <Text style={styles.title}>TIC TAC TOE</Text>
          <Text style={styles.subtitle}>
            Pick a mode and take turns on the classic 3 by 3 board.
          </Text>
        </View>

        <Pressable style={styles.modeCard} onPress={() => startGame("TWO_PLAYER")}>
          <Text style={styles.modeIcon}>👥</Text>
          <Text style={styles.modeTitle}>2 PLAYERS</Text>
          <Text style={styles.modeDesc}>
            Pass the phone and battle a friend with alternating X and O turns.
          </Text>
          <Text style={styles.modePill}>LOCAL MULTIPLAYER</Text>
        </Pressable>

        <Pressable
          style={[styles.modeCard, styles.computerCard]}
          onPress={() => startGame("COMPUTER")}
        >
          <Text style={styles.modeIcon}>🤖</Text>
          <Text style={styles.modeTitle}>VS COMPUTER</Text>
          <Text style={styles.modeDesc}>
            Play against an AI opponent that thinks before it moves.
          </Text>
          <Text style={[styles.modePill, styles.computerPill]}>SMART AI</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={onBackToHome}>
          <Text style={styles.backButtonText}>BACK TO MENU</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (screen === "RESULT") {
    return (
      <ScrollView
        style={styles.scrollScreen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultHero}>
          <Text style={styles.resultEmoji}>{outcome?.winner === null ? "🤝" : "🏆"}</Text>
          <Text style={styles.resultTitle}>{resultTitle}</Text>
          <Text style={styles.resultSubtitle}>{resultSubtitle}</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultCardLabel}>FINAL BOARD</Text>
          <View style={styles.board}>
            {board.map((cell, index) => {
              const isWinningCell = outcome?.line.includes(index);

              return (
                <View
                  key={index}
                  style={[styles.cell, isWinningCell && styles.winningCell]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      cell === "X" ? styles.xMark : styles.oMark,
                    ]}
                  >
                    {cell ?? ""}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            if (gameMode) {
              startGame(gameMode);
            }
          }}
        >
          <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={onBackToHome}>
          <Text style={styles.backButtonText}>BACK TO MENU</Text>
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
      <View style={styles.gameHeader}>
        <View>
          <Text style={styles.badge}>
            {gameMode === "COMPUTER" ? "VS COMPUTER" : "2 PLAYER MATCH"}
          </Text>
          <Text style={styles.titleSmall}>TIC TAC TOE</Text>
        </View>

        <View style={styles.turnChip}>
          <Text style={styles.turnChipLabel}>TURN</Text>
          <Text style={styles.turnChipValue}>
            {computerThinking ? "AI" : currentPlayer}
          </Text>
        </View>
      </View>

      <Text style={styles.statusText}>{statusText}</Text>

      <View style={styles.board}>
        {board.map((cell, index) => {
          const isWinningCell = outcome?.line.includes(index);

          return (
            <Pressable
              key={index}
              style={[styles.cell, isWinningCell && styles.winningCell]}
              onPress={() => handleCellPress(index)}
            >
              <Text
                style={[
                  styles.cellText,
                  cell === "X" ? styles.xMark : styles.oMark,
                ]}
              >
                {cell ?? ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.backButton} onPress={onBackToHome}>
        <Text style={styles.backButtonText}>BACK TO MENU</Text>
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
    padding: 20,
    paddingBottom: 36,
    alignItems: "center",
  },
  hero: {
    width: "100%",
    marginTop: 16,
    marginBottom: 18,
    alignItems: "center",
  },
  badge: {
    color: "#FFB74D",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 2,
  },
  titleSmall: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  subtitle: {
    color: "#8E99B0",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  modeCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#151C2E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFB74D33",
    padding: 18,
    marginBottom: 16,
  },
  computerCard: {
    borderColor: "#49D17D33",
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  modeDesc: {
    color: "#9AA4B8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  modePill: {
    marginTop: 14,
    color: "#FFB74D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  computerPill: {
    color: "#49D17D",
  },
  backButton: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  backButtonText: {
    color: "#D5DBE8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  gameHeader: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  turnChip: {
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 86,
    alignItems: "center",
  },
  turnChipLabel: {
    color: "#8E99B0",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  turnChipValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  statusText: {
    width: "100%",
    maxWidth: 360,
    color: "#9AA4B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
  },
  board: {
    width: "100%",
    maxWidth: 360,
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#11182A",
    borderWidth: 1,
    borderColor: "#253046",
  },
  cell: {
    width: "33.3333%",
    height: "33.3333%",
    borderWidth: 0.5,
    borderColor: "#253046",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151C2E",
  },
  winningCell: {
    backgroundColor: "#20311F",
    borderColor: "#49D17D",
  },
  cellText: {
    fontSize: 48,
    fontWeight: "900",
  },
  xMark: {
    color: "#FFB74D",
  },
  oMark: {
    color: "#49D17D",
  },
  primaryButton: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFB74D",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#2A1600",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  resultHero: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 14,
  },
  resultEmoji: {
    fontSize: 46,
    marginBottom: 8,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  resultSubtitle: {
    color: "#9AA4B8",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  resultCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 18,
    padding: 16,
  },
  resultCardLabel: {
    color: "#8E99B0",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 12,
  },
});
