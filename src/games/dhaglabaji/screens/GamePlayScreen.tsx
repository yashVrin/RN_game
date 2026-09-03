import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { DhaglaPileView } from "../components/DhaglaPileView";
import { HandView } from "../components/HandView";
import { PlayerSeat } from "../components/PlayerSeat";
import { ScoreBoardModal } from "../components/ScoreBoardModal";
import { calculateFinalResults } from "../logic/gameEngine";
import { styles } from "../Styles";
import { Card, GameResult, GameState } from "../types";

interface GamePlayScreenProps {
  initialState: GameState;
  localPlayerSeat?: number; // In Hotspot mode, your seat index (0..3)
  onPlayCardAction: (card: Card) => void;
  onExitGame: () => void;
  onRestartGame: () => void;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  initialState,
  localPlayerSeat = 0,
  onPlayCardAction,
  onExitGame,
  onRestartGame,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Sync state from authoritative host broadcast
  useEffect(() => {
    setGameState(initialState);
  }, [initialState]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn =
    gameState.currentPlayerIndex === localPlayerSeat &&
    gameState.status === "PLAYING";

  // Check Game Over
  useEffect(() => {
    if (gameState.status === "GAME_OVER") {
      const res = calculateFinalResults(gameState);
      setGameResult(res);
    }
  }, [gameState.status]);

  const handleLocalCardPlay = (card: Card) => {
    if (!isMyTurn) return;
    onPlayCardAction(card);
  };

  const handleConfirmExit = () => {
    Alert.alert("Exit Game", "Are you sure you want to exit to lobby?", [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", style: "destructive", onPress: onExitGame },
    ]);
  };

  const localPlayer = gameState.players[localPlayerSeat] || gameState.players[0];
  const opponents = gameState.players.filter((_, idx) => idx !== localPlayerSeat);

  const totalRounds =
    gameState.playerCount === 4 ? 13 : gameState.playerCount === 2 ? 26 : 17;

  return (
    <View style={styles.container}>
      <View style={styles.tableFelt}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.backButton} onPress={handleConfirmExit}>
              <Text style={styles.backButtonText}>✕ EXIT</Text>
            </Pressable>
            <View>
              <Text style={styles.gameTitleGujarati}>ઢગલાબાજી</Text>
              <Text style={styles.gameTitleEng}>Dhagla Baji</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.roundBadge}>
              <Text style={styles.roundBadgeText}>
                ROUND {gameState.roundNumber} / {totalRounds}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Summary Bar Showing Total Cards for Both You and All Opponents */}
        <View style={localStyles.topPlayersSummaryBar}>
          {gameState.players.map((p, idx) => {
            const isMe = idx === localPlayerSeat;
            const isTurn = idx === gameState.currentPlayerIndex;
            return (
              <View
                key={`summary_${p.id}`}
                style={[
                  localStyles.summaryPill,
                  isMe && localStyles.summaryPillMe,
                  isTurn && localStyles.summaryPillActiveTurn,
                ]}
              >
                <Text style={localStyles.summaryAvatar}>{p.avatar}</Text>
                <View>
                  <Text style={localStyles.summaryName} numberOfLines={1}>
                    {isMe ? `${p.name} (YOU)` : p.name}
                  </Text>
                  <Text style={localStyles.summaryCount}>
                    🂠 {p.cardCount} cards {p.tensCaptured > 0 ? `• ⭐${p.tensCaptured}` : ""}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Opponent Seats at Top */}
        <View style={styles.opponentsContainer}>
          {opponents.map((opp) => (
            <PlayerSeat
              key={opp.id}
              player={opp}
              isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === opp.id}
            />
          ))}
        </View>

        {/* Center Dhagla Board with Big Cards */}
        <DhaglaPileView
          currentRoundCards={gameState.currentRoundCards}
          dhaglaCenterPile={gameState.dhaglaCenterPile}
          leadSuit={gameState.leadSuit}
          players={gameState.players}
          consecutiveWinnerId={gameState.consecutiveWinnerId}
          consecutiveWinCount={gameState.consecutiveWinCount}
          lastCaptureEvent={gameState.lastCaptureEvent}
        />

        {/* Local Player Face-Down Hand with Drop Action at Bottom */}
        <HandView
          player={localPlayer}
          isMyTurn={isMyTurn}
          leadSuit={gameState.leadSuit}
          onPlayCard={handleLocalCardPlay}
        />
      </View>

      {/* Game Over Scoreboard Modal */}
      <ScoreBoardModal
        visible={gameState.status === "GAME_OVER"}
        result={gameResult}
        onPlayAgain={onRestartGame}
        onExit={onExitGame}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  topPlayersSummaryBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.25)",
    gap: 4,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    flex: 1,
    maxWidth: 130,
  },
  summaryPillMe: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10B981",
  },
  summaryPillActiveTurn: {
    borderColor: "#00E5FF",
    backgroundColor: "rgba(0, 229, 255, 0.2)",
  },
  summaryAvatar: {
    fontSize: 16,
  },
  summaryName: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  summaryCount: {
    color: "#A7F3D0",
    fontSize: 9,
    fontWeight: "700",
  },
});
