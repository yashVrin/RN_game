import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { styles } from "./Styles";

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


