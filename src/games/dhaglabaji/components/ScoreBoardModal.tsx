import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { GameResult } from "../types";

interface ScoreBoardModalProps {
  visible: boolean;
  result: GameResult | null;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const ScoreBoardModal: React.FC<ScoreBoardModalProps> = ({
  visible,
  result,
  onPlayAgain,
  onExit,
}) => {
  if (!result) return null;

  const medalEmojis = ["🥇", "🥈", "🥉", "4th"];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.overlay}>
        <View style={localStyles.card}>
          <Text style={localStyles.trophyIcon}>🏆</Text>
          <Text style={localStyles.title}>GAME COMPLETE</Text>
          <Text style={localStyles.subTitle}>
            {result.isTie ? "IT'S A TIE!" : `${result.winnerName.toUpperCase()} WINS!`}
          </Text>

          {/* Player Leaderboard */}
          <View style={localStyles.tableContainer}>
            <View style={localStyles.tableHeader}>
              <Text style={[localStyles.thText, { flex: 1 }]}>Rank</Text>
              <Text style={[localStyles.thText, { flex: 2 }]}>Player</Text>
              <Text style={[localStyles.thText, { flex: 1.2, textAlign: "center" }]}>
                ⭐ Tens
              </Text>
              <Text style={[localStyles.thText, { flex: 1.2, textAlign: "right" }]}>
                Rounds
              </Text>
            </View>

            {result.playerStats.map((stat, idx) => {
              const isFirst = idx === 0;
              return (
                <View
                  key={stat.playerId}
                  style={[
                    localStyles.tableRow,
                    isFirst && localStyles.firstPlaceRow,
                  ]}
                >
                  <Text style={[localStyles.tdRank, { flex: 1 }]}>
                    {medalEmojis[idx] || `${idx + 1}`}
                  </Text>
                  <Text
                    style={[
                      localStyles.tdName,
                      { flex: 2 },
                      isFirst && localStyles.winnerNameHighlight,
                    ]}
                    numberOfLines={1}
                  >
                    {stat.playerName}
                  </Text>
                  <Text style={[localStyles.tdTens, { flex: 1.2, textAlign: "center" }]}>
                    {stat.tensCaptured} / 4
                  </Text>
                  <Text style={[localStyles.tdTricks, { flex: 1.2, textAlign: "right" }]}>
                    {stat.roundsWon}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={localStyles.buttonsRow}>
            <Pressable style={localStyles.playAgainButton} onPress={onPlayAgain}>
              <Text style={localStyles.playAgainText}>PLAY AGAIN 🔄</Text>
            </Pressable>

            <Pressable style={localStyles.exitButton} onPress={onExit}>
              <Text style={localStyles.exitText}>EXIT TO MENU 🏠</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0D251A",
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: "#D4AF37",
    padding: 20,
    alignItems: "center",
  },
  trophyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    color: "#FFD700",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  subTitle: {
    color: "#34D399",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  tableContainer: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
    paddingBottom: 6,
    marginBottom: 6,
  },
  thText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  firstPlaceRow: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  tdRank: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  tdName: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "700",
  },
  winnerNameHighlight: {
    color: "#FFD700",
    fontWeight: "900",
  },
  tdTens: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "900",
  },
  tdTricks: {
    color: "#A7F3D0",
    fontSize: 13,
    fontWeight: "700",
  },
  buttonsRow: {
    width: "100%",
    gap: 10,
  },
  playAgainButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  playAgainText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  exitButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  exitText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
});
