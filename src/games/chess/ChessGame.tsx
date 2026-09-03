import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { styles } from "./Styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 360);
const SQUARE_SIZE = BOARD_SIZE / 8;

export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";
export type PieceColor = "w" | "b";
export type GameMode = "TWO_PLAYER" | "COMPUTER";
export type ScreenState = "MODE_SELECT" | "GAME";

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
}

export type Board = (ChessPiece | null)[][];

interface MoveHistoryEntry {
  board: Board;
  turn: PieceColor;
  capturedWhite: ChessPiece[];
  capturedBlack: ChessPiece[];
  lastMove: { from: [number, number]; to: [number, number] } | null;
  moveNotation: string;
}

interface ChessGameProps {
  onBackToHome: () => void;
}

const PIECE_SYMBOLS: Record<PieceType, { w: string; b: string }> = {
  k: { w: "♚", b: "♚" },
  q: { w: "♛", b: "♛" },
  r: { w: "♜", b: "♜" },
  b: { w: "♝", b: "♝" },
  n: { w: "♞", b: "♞" },
  p: { w: "♟", b: "♟" },
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const FILE_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANK_LABELS = ["8", "7", "6", "5", "4", "3", "2", "1"];

let pieceIdCounter = 0;
function createPiece(type: PieceType, color: PieceColor): ChessPiece {
  pieceIdCounter += 1;
  return { id: `${color}-${type}-${pieceIdCounter}`, type, color };
}

function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const backRowTypes: PieceType[] = [
    "r",
    "n",
    "b",
    "q",
    "k",
    "b",
    "n",
    "r",
  ];
  for (let c = 0; c < 8; c++) {
    board[0][c] = createPiece(backRowTypes[c], "b");
    board[1][c] = createPiece("p", "b");
  }

  for (let c = 0; c < 8; c++) {
    board[6][c] = createPiece("p", "w");
    board[7][c] = createPiece(backRowTypes[c], "w");
  }

  return board;
}

function isInside(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Compute raw attacks/moves of a piece on the board
function getRawPieceMoves(
  board: Board,
  r: number,
  c: number,
  attacksOnly = false
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: [number, number][] = [];

  const addRayMoves = (directions: [number, number][]) => {
    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      while (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          if (!attacksOnly) moves.push([nr, nc]);
        } else {
          if (target.color !== piece.color || attacksOnly) {
            moves.push([nr, nc]);
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  };

  if (piece.type === "p") {
    const dir = piece.color === "w" ? -1 : 1;
    const startRow = piece.color === "w" ? 6 : 1;

    if (!attacksOnly) {
      if (isInside(r + dir, c) && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        if (r === startRow && !board[r + dir * 2][c]) {
          moves.push([r + dir * 2, c]);
        }
      }
    }

    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        if (attacksOnly) {
          moves.push([nr, nc]);
        } else {
          const target = board[nr][nc];
          if (target && target.color !== piece.color) {
            moves.push([nr, nc]);
          }
        }
      }
    }
  } else if (piece.type === "n") {
    const knightOffsets: [number, number][] = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color !== piece.color || attacksOnly) {
          moves.push([nr, nc]);
        }
      }
    }
  } else if (piece.type === "b") {
    addRayMoves([
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]);
  } else if (piece.type === "r") {
    addRayMoves([
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]);
  } else if (piece.type === "q") {
    addRayMoves([
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]);
  } else if (piece.type === "k") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) {
          const nr = r + dr;
          const nc = c + dc;
          if (isInside(nr, nc)) {
            const target = board[nr][nc];
            if (!target || target.color !== piece.color || attacksOnly) {
              moves.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  return moves;
}

// Find king coordinate
function findKing(board: Board, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === "k" && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

// Check if a color's king is currently in check
function isKingInCheck(board: Board, kingColor: PieceColor): boolean {
  const kingPos = findKing(board, kingColor);
  if (!kingPos) return false;
  const [kr, kc] = kingPos;
  const opponentColor: PieceColor = kingColor === "w" ? "b" : "w";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        const attackMoves = getRawPieceMoves(board, r, c, true);
        if (attackMoves.some(([ar, ac]) => ar === kr && ac === kc)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Get fully validated moves (prevents leaving king in check)
function getLegalMoves(board: Board, r: number, c: number): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const rawMoves = getRawPieceMoves(board, r, c);
  const legalMoves: [number, number][] = [];

  for (const [nr, nc] of rawMoves) {
    const nextBoard = board.map(row => [...row]);
    nextBoard[nr][nc] = nextBoard[r][c];
    nextBoard[r][c] = null;

    if (!isKingInCheck(nextBoard, piece.color)) {
      legalMoves.push([nr, nc]);
    }
  }

  return legalMoves;
}

interface AllMovesEntry {
  from: [number, number];
  to: [number, number];
  piece: ChessPiece;
  target: ChessPiece | null;
}

function getAllLegalMoves(board: Board, color: PieceColor): AllMovesEntry[] {
  const allMoves: AllMovesEntry[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, r, c);
        for (const [tr, tc] of moves) {
          allMoves.push({
            from: [r, c],
            to: [tr, tc],
            piece,
            target: board[tr][tc],
          });
        }
      }
    }
  }
  return allMoves;
}

// AI Move Evaluation for Computer Player (Black)
function getBestComputerMove(board: Board): AllMovesEntry | null {
  const moves = getAllLegalMoves(board, "b");
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let candidateMoves: AllMovesEntry[] = [];

  for (const move of moves) {
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;

    // Simulate move
    const simulatedBoard = board.map(row => [...row]);
    let movingPiece = { ...move.piece };
    if (movingPiece.type === "p" && tr === 7) {
      movingPiece.type = "q"; // promotion
    }
    simulatedBoard[tr][tc] = movingPiece;
    simulatedBoard[fr][fc] = null;

    let score = 0;

    // 1. Capture evaluation
    if (move.target) {
      score += PIECE_VALUES[move.target.type] * 1.2;
    }

    // 2. Promotion bonus
    if (movingPiece.type === "q" && move.piece.type === "p") {
      score += 800;
    }

    // 3. Give check bonus
    if (isKingInCheck(simulatedBoard, "w")) {
      score += 60;
    }

    // 4. Center control bonus (d4, e4, d5, e5)
    if ((tr === 3 || tr === 4) && (tc === 3 || tc === 4)) {
      score += 25;
    } else if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) {
      score += 10;
    }

    // 5. Penalize moving into an attacked square without defense
    const whiteAttacks = getRawPieceMoves(simulatedBoard, tr, tc, true);
    let isAttackedByWhite = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = simulatedBoard[r][c];
        if (p && p.color === "w") {
          const attacks = getRawPieceMoves(simulatedBoard, r, c, true);
          if (attacks.some(([ar, ac]) => ar === tr && ac === tc)) {
            isAttackedByWhite = true;
            break;
          }
        }
      }
      if (isAttackedByWhite) break;
    }

    if (isAttackedByWhite) {
      score -= PIECE_VALUES[movingPiece.type] * 0.85;
    }

    // Minor randomness to vary games
    score += Math.random() * 8;

    if (score > bestScore) {
      bestScore = score;
      candidateMoves = [move];
    } else if (Math.abs(score - bestScore) < 2) {
      candidateMoves.push(move);
    }
  }

  return candidateMoves[Math.floor(Math.random() * candidateMoves.length)] || moves[0];
}

export default function ChessGame({
  onBackToHome,
}: ChessGameProps): React.JSX.Element {
  const [screen, setScreen] = useState<ScreenState>("MODE_SELECT");
  const [gameMode, setGameMode] = useState<GameMode>("TWO_PLAYER");
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>("w");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null
  );
  const [capturedWhite, setCapturedWhite] = useState<ChessPiece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<ChessPiece[]>([]);
  const [history, setHistory] = useState<MoveHistoryEntry[]>([]);
  const [lastMove, setLastMove] = useState<{
    from: [number, number];
    to: [number, number];
  } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [computerThinking, setComputerThinking] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: PieceColor | "DRAW" | null;
    reason: string;
  } | null>(null);
  const [moveCount, setMoveCount] = useState(1);

  const whiteInCheck = useMemo(() => isKingInCheck(board, "w"), [board]);
  const blackInCheck = useMemo(() => isKingInCheck(board, "b"), [board]);
  const currentInCheck = turn === "w" ? whiteInCheck : blackInCheck;

  // Material advantage
  const whiteScore = useMemo(
    () =>
      capturedBlack.reduce((sum, p) => sum + (PIECE_VALUES[p.type] / 100 || 0), 0),
    [capturedBlack]
  );
  const blackScore = useMemo(
    () =>
      capturedWhite.reduce((sum, p) => sum + (PIECE_VALUES[p.type] / 100 || 0), 0),
    [capturedWhite]
  );
  const scoreDiff = whiteScore - blackScore;

  // Selected piece legal moves
  const validMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return getLegalMoves(board, selectedSquare[0], selectedSquare[1]);
  }, [board, selectedSquare]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setBoard(createInitialBoard());
    setTurn("w");
    setSelectedSquare(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setHistory([]);
    setLastMove(null);
    setGameResult(null);
    setMoveCount(1);
    setIsFlipped(false);
    setComputerThinking(false);
    setScreen("GAME");
  };

  // Check GameOver condition
  const checkGameOver = useCallback(
    (nextBoard: Board, nextTurn: PieceColor) => {
      const legalMoves = getAllLegalMoves(nextBoard, nextTurn);

      if (legalMoves.length === 0) {
        const inCheck = isKingInCheck(nextBoard, nextTurn);
        if (inCheck) {
          const winner: PieceColor = nextTurn === "w" ? "b" : "w";
          let reason = `Checkmate! ${winner === "w" ? "White" : "Black"
            } wins the match!`;
          if (gameMode === "COMPUTER") {
            reason =
              winner === "w"
                ? "Checkmate! You defeated the Computer!"
                : "Checkmate! The Computer outplayed you.";
          }
          setGameResult({ winner, reason });
        } else {
          setGameResult({
            winner: "DRAW",
            reason: "Stalemate! No legal moves remaining.",
          });
        }
        return true;
      }
      return false;
    },
    [gameMode]
  );

  // Apply move function
  const applyMove = useCallback(
    (
      sr: number,
      sc: number,
      tr: number,
      tc: number,
      currentBoard: Board,
      currentTurn: PieceColor,
      cWhite: ChessPiece[],
      cBlack: ChessPiece[]
    ) => {
      const newBoard = currentBoard.map(row => [...row]);
      const movingPiece = { ...newBoard[sr][sc]! };
      const capturedPiece = newBoard[tr][tc];
      const nextCapturedWhite = [...cWhite];
      const nextCapturedBlack = [...cBlack];

      if (capturedPiece) {
        if (capturedPiece.color === "w") {
          nextCapturedWhite.push(capturedPiece);
        } else {
          nextCapturedBlack.push(capturedPiece);
        }
      }

      // Handle Promotion
      if (movingPiece.type === "p" && (tr === 0 || tr === 7)) {
        movingPiece.type = "q";
      }

      newBoard[tr][tc] = movingPiece;
      newBoard[sr][sc] = null;

      const moveNotation = `${movingPiece.type.toUpperCase()}${capturedPiece ? "x" : ""
        }${FILE_LABELS[tc]}${RANK_LABELS[tr]}`;

      setHistory(prev => [
        ...prev,
        {
          board: currentBoard,
          turn: currentTurn,
          capturedWhite: cWhite,
          capturedBlack: cBlack,
          lastMove,
          moveNotation,
        },
      ]);

      const nextTurn: PieceColor = currentTurn === "w" ? "b" : "w";
      setBoard(newBoard);
      setTurn(nextTurn);
      setSelectedSquare(null);
      setCapturedWhite(nextCapturedWhite);
      setCapturedBlack(nextCapturedBlack);
      setLastMove({ from: [sr, sc], to: [tr, tc] });
      if (currentTurn === "b") {
        setMoveCount(prev => prev + 1);
      }

      checkGameOver(newBoard, nextTurn);
    },
    [checkGameOver, lastMove]
  );

  // Computer AI move trigger
  useEffect(() => {
    if (
      screen !== "GAME" ||
      gameMode !== "COMPUTER" ||
      turn !== "b" ||
      gameResult !== null
    ) {
      return;
    }

    setComputerThinking(true);
    const timer = setTimeout(() => {
      const bestMove = getBestComputerMove(board);
      setComputerThinking(false);

      if (bestMove) {
        const [fr, fc] = bestMove.from;
        const [tr, tc] = bestMove.to;
        applyMove(
          fr,
          fc,
          tr,
          tc,
          board,
          "b",
          capturedWhite,
          capturedBlack
        );
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [
    applyMove,
    board,
    capturedBlack,
    capturedWhite,
    gameMode,
    gameResult,
    screen,
    turn,
  ]);

  const handleSquarePress = (displayRow: number, displayCol: number) => {
    if (gameResult || computerThinking) return;

    // In Computer mode, prevent tapping Black pieces
    if (gameMode === "COMPUTER" && turn === "b") return;

    const r = isFlipped ? 7 - displayRow : displayRow;
    const c = isFlipped ? 7 - displayCol : displayCol;
    const clickedPiece = board[r][c];

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isMove = validMoves.some(([vr, vc]) => vr === r && vc === c);

      if (isMove) {
        applyMove(
          sr,
          sc,
          r,
          c,
          board,
          turn,
          capturedWhite,
          capturedBlack
        );
        return;
      }
    }

    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare([r, c]);
    } else {
      setSelectedSquare(null);
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || gameResult || computerThinking) return;

    // In computer mode, undo 2 moves (both AI and player move) if possible
    const stepsToUndo =
      gameMode === "COMPUTER" && history.length >= 2 && turn === "w" ? 2 : 1;
    const targetEntry = history[history.length - stepsToUndo];

    setBoard(targetEntry.board);
    setTurn(targetEntry.turn);
    setCapturedWhite(targetEntry.capturedWhite);
    setCapturedBlack(targetEntry.capturedBlack);
    setLastMove(targetEntry.lastMove);
    setSelectedSquare(null);
    setHistory(prev => prev.slice(0, -stepsToUndo));
    setMoveCount(prev => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    startGame(gameMode);
  };

  const handleResign = () => {
    const winner: PieceColor = turn === "w" ? "b" : "w";
    let reason = `${turn === "w" ? "White" : "Black"
      } resigned. ${winner === "w" ? "White" : "Black"} wins!`;
    if (gameMode === "COMPUTER") {
      reason =
        turn === "w"
          ? "You resigned. Computer wins the match!"
          : "Computer resigned. You win!";
    }
    setGameResult({ winner, reason });
  };

  // ==================== MODE SELECT SCREEN ====================
  if (screen === "MODE_SELECT") {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.modeSelectContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>TACTICAL STRATEGY</Text>
          <Text style={styles.heroTitle}>CHESS ARENA</Text>
          <Text style={styles.heroSubtitle}>
            Select your game mode to command your army and checkmate the King.
          </Text>
        </View>

        {/* 2 Players Local Card */}
        <Pressable
          style={styles.modeCard}
          onPress={() => startGame("TWO_PLAYER")}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeIcon}>👥</Text>
            <View style={styles.modeTagContainer}>
              <Text style={styles.modeTagText}>PASS & PLAY</Text>
            </View>
          </View>
          <Text style={styles.modeCardTitle}>2 PLAYERS</Text>
          <Text style={styles.modeDesc}>
            Challenge a friend locally on the same device with alternating White & Black turns.
          </Text>
          <View style={styles.modeFooter}>
            <Text style={styles.modeFeatures}>⚔️ Rotate Board • Move Hints • Undo</Text>
            <View style={styles.modePlayBadge}>
              <Text style={styles.modePlayText}>PLAY ▶</Text>
            </View>
          </View>
        </Pressable>

        {/* VS Computer Card */}
        <Pressable
          style={[styles.modeCard, styles.computerCardBorder]}
          onPress={() => startGame("COMPUTER")}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeIcon}>🤖</Text>
            <View style={[styles.modeTagContainer, styles.computerTagBg]}>
              <Text style={styles.computerTagText}>SMART AI</Text>
            </View>
          </View>
          <Text style={styles.modeCardTitle}>VS COMPUTER</Text>
          <Text style={styles.modeDesc}>
            Play as White against a responsive AI that evaluates tactical moves and counters your plays.
          </Text>
          <View style={styles.modeFooter}>
            <Text style={styles.modeFeatures}>🧠 Smart Tactics • Instant AI Response</Text>
            <View style={[styles.modePlayBadge, styles.computerPlayBadge]}>
              <Text style={styles.computerPlayText}>PLAY ▶</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.backHomeBtn} onPress={onBackToHome}>
          <Text style={styles.backHomeBtnText}>← BACK TO MAIN MENU</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ==================== IN-GAME PLAY SCREEN ====================
  const topColor: PieceColor = isFlipped ? "w" : "b";
  const isTopActive = turn === topColor;
  const topCaptured = topColor === "b" ? capturedWhite : capturedBlack;
  const topScore = topColor === "b" ? -scoreDiff : scoreDiff;
  const isTopComputer = gameMode === "COMPUTER" && topColor === "b";

  const bottomColor: PieceColor = isFlipped ? "b" : "w";
  const isBottomActive = turn === bottomColor;
  const bottomCaptured = bottomColor === "w" ? capturedBlack : capturedWhite;
  const bottomScore = bottomColor === "w" ? scoreDiff : -scoreDiff;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <Pressable style={styles.navButton} onPress={() => setScreen("MODE_SELECT")}>
          <Text style={styles.navButtonText}>← MODES</Text>
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.titleIcon}>♟️</Text>
          <Text style={styles.titleText}>
            {gameMode === "COMPUTER" ? "VS AI" : "2 PLAYERS"}
          </Text>
        </View>
        {gameMode === "TWO_PLAYER" ? (
          <Pressable style={styles.flipButton} onPress={() => setIsFlipped(f => !f)}>
            <Text style={styles.flipButtonText}>🔄 FLIP</Text>
          </Pressable>
        ) : (
          <View style={{ width: 68 }} />
        )}
      </View>

      {/* Top Player Card */}
      <View
        style={[
          styles.playerCard,
          topColor === "b" ? styles.blackPlayerBorder : styles.whitePlayerBorder,
          isTopActive && styles.activePlayerCardGlow,
        ]}
      >
        <View style={styles.playerInfoRow}>
          <View style={styles.playerNameGroup}>
            <View
              style={[
                styles.playerAvatar,
                topColor === "b" ? styles.blackAvatar : styles.whiteAvatar,
              ]}
            >
              <Text style={styles.avatarSymbol}>
                {isTopComputer ? "🤖" : topColor === "b" ? "♚" : "♔"}
              </Text>
            </View>
            <View>
              <Text style={styles.playerName}>
                {isTopComputer
                  ? "COMPUTER (AI)"
                  : topColor === "b"
                    ? "BLACK PLAYER"
                    : "WHITE PLAYER"}
              </Text>
              <Text
                style={[
                  styles.playerSubtext,
                  computerThinking && isTopActive && { color: "#00E5FF" },
                ]}
              >
                {computerThinking && isTopActive
                  ? "🤖 THINKING MOVE..."
                  : isTopActive
                    ? "● ACTIVE TURN"
                    : "WAITING"}
              </Text>
            </View>
          </View>

          {topScore > 0 && (
            <View style={styles.advantageBadge}>
              <Text style={styles.advantageText}>+{topScore}</Text>
            </View>
          )}
        </View>

        {/* Captured row */}
        <View style={styles.capturedRow}>
          <Text style={styles.capturedLabel}>Captured:</Text>
          {topCaptured.length === 0 ? (
            <Text style={styles.noneCaptured}>None</Text>
          ) : (
            <View style={styles.capturedPiecesList}>
              {topCaptured.map((piece, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.capturedPieceSymbol,
                    piece.color === "w"
                      ? styles.capturedWhitePiece
                      : styles.capturedBlackPiece,
                  ]}
                >
                  {PIECE_SYMBOLS[piece.type][piece.color]}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Check Alert Banner */}
      {currentInCheck && !gameResult && (
        <View style={styles.checkAlertBanner}>
          <Text style={styles.checkAlertText}>
            ⚠️ {turn === "w" ? "WHITE" : "BLACK"} KING IS IN CHECK!
          </Text>
        </View>
      )}

      {/* 8x8 Chessboard */}
      <View style={styles.boardWrapper}>
        <View style={styles.fileLabelsRow}>
          {Array.from({ length: 8 }).map((_, c) => {
            const colIndex = isFlipped ? 7 - c : c;
            return (
              <Text key={c} style={styles.coordinateLabel}>
                {FILE_LABELS[colIndex]}
              </Text>
            );
          })}
        </View>

        <View style={styles.boardWithRanks}>
          <View style={styles.rankLabelsColumn}>
            {Array.from({ length: 8 }).map((_, r) => {
              const rowIndex = isFlipped ? 7 - r : r;
              return (
                <Text key={r} style={styles.coordinateLabel}>
                  {RANK_LABELS[rowIndex]}
                </Text>
              );
            })}
          </View>

          <View style={styles.board}>
            {Array.from({ length: 8 }).map((_, displayRow) => {
              const r = isFlipped ? 7 - displayRow : displayRow;
              return (
                <View key={displayRow} style={styles.row}>
                  {Array.from({ length: 8 }).map((_, displayCol) => {
                    const c = isFlipped ? 7 - displayCol : displayCol;
                    const piece = board[r][c];
                    const isLightSquare = (r + c) % 2 === 0;

                    const isSelected =
                      selectedSquare &&
                      selectedSquare[0] === r &&
                      selectedSquare[1] === c;

                    const isValidTarget = validMoves.some(
                      ([vr, vc]) => vr === r && vc === c
                    );

                    const isLastMoveSquare =
                      lastMove &&
                      ((lastMove.from[0] === r && lastMove.from[1] === c) ||
                        (lastMove.to[0] === r && lastMove.to[1] === c));

                    const isKingChecked =
                      piece &&
                      piece.type === "k" &&
                      piece.color === turn &&
                      currentInCheck;

                    return (
                      <Pressable
                        key={displayCol}
                        style={[
                          styles.square,
                          isLightSquare
                            ? styles.lightSquare
                            : styles.darkSquare,
                          isLastMoveSquare && styles.lastMoveSquare,
                          isSelected && styles.selectedSquare,
                          isKingChecked && styles.checkedKingSquare,
                        ]}
                        onPress={() => handleSquarePress(displayRow, displayCol)}
                      >
                        {isValidTarget && !piece && (
                          <View style={styles.validMoveDot} />
                        )}
                        {isValidTarget && piece && (
                          <View style={styles.captureRing} />
                        )}

                        {piece && (
                          <Text
                            style={[
                              styles.pieceText,
                              piece.color === "w"
                                ? styles.whitePiece
                                : styles.blackPiece,
                            ]}
                          >
                            {PIECE_SYMBOLS[piece.type][piece.color]}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Bottom Player Card */}
      <View
        style={[
          styles.playerCard,
          bottomColor === "w"
            ? styles.whitePlayerBorder
            : styles.blackPlayerBorder,
          isBottomActive && styles.activePlayerCardGlow,
        ]}
      >
        <View style={styles.playerInfoRow}>
          <View style={styles.playerNameGroup}>
            <View
              style={[
                styles.playerAvatar,
                bottomColor === "w"
                  ? styles.whiteAvatar
                  : styles.blackAvatar,
              ]}
            >
              <Text style={styles.avatarSymbol}>
                {bottomColor === "w" ? "♔" : "♚"}
              </Text>
            </View>
            <View>
              <Text style={styles.playerName}>
                {gameMode === "COMPUTER" && bottomColor === "w"
                  ? "YOU (WHITE)"
                  : bottomColor === "w"
                    ? "WHITE PLAYER"
                    : "BLACK PLAYER"}
              </Text>
              <Text style={styles.playerSubtext}>
                {isBottomActive ? "● ACTIVE TURN" : "WAITING FOR MOVE"}
              </Text>
            </View>
          </View>

          {bottomScore > 0 && (
            <View style={styles.advantageBadge}>
              <Text style={styles.advantageText}>+{bottomScore}</Text>
            </View>
          )}
        </View>

        <View style={styles.capturedRow}>
          <Text style={styles.capturedLabel}>Captured:</Text>
          {bottomCaptured.length === 0 ? (
            <Text style={styles.noneCaptured}>None</Text>
          ) : (
            <View style={styles.capturedPiecesList}>
              {bottomCaptured.map((piece, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.capturedPieceSymbol,
                    piece.color === "w"
                      ? styles.capturedWhitePiece
                      : styles.capturedBlackPiece,
                  ]}
                >
                  {PIECE_SYMBOLS[piece.type][piece.color]}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Control Actions Bar */}
      <View style={styles.controlsBar}>
        <Pressable
          style={[
            styles.actionButton,
            (history.length === 0 || computerThinking) && styles.disabledButton,
          ]}
          disabled={history.length === 0 || computerThinking}
          onPress={handleUndo}
        >
          <Text style={styles.actionButtonText}>↩️ UNDO</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, computerThinking && styles.disabledButton]}
          disabled={computerThinking}
          onPress={handleResign}
        >
          <Text style={[styles.actionButtonText, styles.resignText]}>
            🏳️ RESIGN
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, computerThinking && styles.disabledButton]}
          disabled={computerThinking}
          onPress={handleReset}
        >
          <Text style={[styles.actionButtonText, styles.resetText]}>
            ⚡ RESTART
          </Text>
        </Pressable>
      </View>

      {/* Game status footer */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Move #{moveCount} • Turn:{" "}
          <Text
            style={{
              color: turn === "w" ? "#49D17D" : "#FFB74D",
              fontWeight: "900",
            }}
          >
            {gameMode === "COMPUTER"
              ? turn === "w"
                ? "YOUR TURN"
                : "COMPUTER'S TURN"
              : turn === "w"
                ? "WHITE"
                : "BLACK"}
          </Text>
        </Text>
      </View>

      {/* Victory / Game Over Modal */}
      <Modal
        visible={gameResult !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTrophy}>👑 🏆 👑</Text>
            <Text style={styles.modalTitle}>GAME OVER</Text>
            <Text style={styles.modalReason}>{gameResult?.reason}</Text>

            <Pressable
              style={[styles.modalPrimaryBtn, styles.rematchBtn]}
              onPress={handleReset}
            >
              <Text style={styles.rematchBtnText}>🔄 PLAY AGAIN</Text>
            </Pressable>

            <Pressable
              style={[styles.modalSecondaryBtn, { marginBottom: 8 }]}
              onPress={() => {
                setGameResult(null);
                setScreen("MODE_SELECT");
              }}
            >
              <Text style={styles.modalSecondaryText}>🎮 CHANGE MODE</Text>
            </Pressable>

            <Pressable style={styles.modalSecondaryBtn} onPress={onBackToHome}>
              <Text style={styles.modalSecondaryText}>🏠 EXIT TO MENU</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


