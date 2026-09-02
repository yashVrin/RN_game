import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface HomeScreenProps {
  onSelectMaze: () => void;
  onSelectSnake: () => void;
  onSelectTicTacToe: () => void;
  onSelectBlockDrop: () => void;
}

export default function HomeScreen({
  onSelectMaze,
  onSelectSnake,
  onSelectTicTacToe,
  onSelectBlockDrop,
}: HomeScreenProps): React.JSX.Element {
  return (
    <ScrollView
      style={styles.scrollScreen}
      contentContainerStyle={styles.homeContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.arcadeHeader}>
        <Text style={styles.arcadeBadge}>RETRO ARCADE</Text>
        <Text style={styles.arcadeTitle}>GAME ZONE</Text>
        <Text style={styles.arcadeSubtitle}>
          Select a classic arcade game to play!
        </Text>
      </View>

      {/* Maze Game Selection Card */}
      <Pressable style={styles.gameCard} onPress={onSelectMaze}>
        <View style={styles.gameCardHeader}>
          <Text style={styles.gameCardIcon}>🌀</Text>
          <View style={styles.gameCardTagContainer}>
            <Text style={styles.gameCardTag}>PUZZLE</Text>
          </View>
        </View>

        <Text style={styles.gameCardTitle}>MAZE RUNNER</Text>
        <Text style={styles.gameCardDesc}>
          Infinite randomly generated mazes. Use swipe gestures to navigate and
          find the exit!
        </Text>

        <View style={styles.gameCardFooter}>
          <Text style={styles.gameCardFeature}>
            ✨ Solvable • BFS Hints • Infinite Levels
          </Text>
          <View style={styles.playBadge}>
            <Text style={styles.playBadgeText}>PLAY ▶</Text>
          </View>
        </View>
      </Pressable>

      {/* Snake Game Selection Card */}
      <Pressable
        style={[styles.gameCard, styles.snakeCardBorder]}
        onPress={onSelectSnake}
      >
        <View style={styles.gameCardHeader}>
          <Text style={styles.gameCardIcon}>🐍</Text>
          <View style={[styles.gameCardTagContainer, styles.snakeTagBg]}>
            <Text style={styles.snakeTagText}>CLASSIC</Text>
          </View>
        </View>

        <Text style={styles.gameCardTitle}>RETRO SNAKE</Text>
        <Text style={styles.gameCardDesc}>
          Capture glowing energy dots to increase snake length. Don&apos;t touch
          the screen border!
        </Text>

        <View style={styles.gameCardFooter}>
          <Text style={styles.gameCardFeature}>
            ⚡ Growing Tail • High Score • Wall Collision
          </Text>
          <View style={[styles.playBadge, styles.snakePlayBadge]}>
            <Text style={styles.snakePlayText}>PLAY ▶</Text>
          </View>
        </View>
      </Pressable>

      {/* Tic Tac Toe Game Selection Card */}
      <Pressable
        style={[styles.gameCard, styles.ticTacToeCardBorder]}
        onPress={onSelectTicTacToe}
      >
        <View style={styles.gameCardHeader}>
          <Text style={styles.gameCardIcon}>❌⭕</Text>
          <View style={[styles.gameCardTagContainer, styles.ticTacToeTagBg]}>
            <Text style={styles.ticTacToeTagText}>STRATEGY</Text>
          </View>
        </View>

        <Text style={styles.gameCardTitle}>TIC TAC TOE</Text>
        <Text style={styles.gameCardDesc}>
          Challenge a friend locally or battle the computer with smart
          moves and perfect turns.
        </Text>

        <View style={styles.gameCardFooter}>
          <Text style={styles.gameCardFeature}>
            🧠 2 Players • AI Opponent • Winning Lines
          </Text>
          <View style={[styles.playBadge, styles.ticTacToePlayBadge]}>
            <Text style={styles.ticTacToePlayText}>PLAY ▶</Text>
          </View>
        </View>
      </Pressable>

      {/* Block Drop Game Selection Card */}
      <Pressable
        style={[styles.gameCard, styles.blockDropCardBorder]}
        onPress={onSelectBlockDrop}
      >
        <View style={styles.gameCardHeader}>
          <Text style={styles.gameCardIcon}>🧱</Text>
          <View style={[styles.gameCardTagContainer, styles.blockDropTagBg]}>
            <Text style={styles.blockDropTagText}>FALLING</Text>
          </View>
        </View>

        <Text style={styles.gameCardTitle}>BLOCK DROP</Text>
        <Text style={styles.gameCardDesc}>
          Stack falling pieces, clear full rows, and keep the board from
          reaching the top.
        </Text>

        <View style={styles.gameCardFooter}>
          <Text style={styles.gameCardFeature}>
            ⬇️ Clear Lines • Speed Up • Hard Drop
          </Text>
          <View style={[styles.playBadge, styles.blockDropPlayBadge]}>
            <Text style={styles.blockDropPlayText}>PLAY ▶</Text>
          </View>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollScreen: {
    flex: 1,
  },

  homeContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },

  arcadeHeader: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },

  arcadeBadge: {
    color: "#49D17D",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 4,
  },

  arcadeTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 3,
  },

  arcadeSubtitle: {
    color: "#8E99B0",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  gameCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#151C2E",
    borderWidth: 1,
    borderColor: "#253046",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  snakeCardBorder: {
    borderColor: "#00E5FF33",
  },

  gameCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  gameCardIcon: {
    fontSize: 34,
  },

  gameCardTagContainer: {
    backgroundColor: "#49D17D22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  gameCardTag: {
    color: "#49D17D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  snakeTagBg: {
    backgroundColor: "#00E5FF22",
  },

  snakeTagText: {
    color: "#00E5FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  gameCardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 12,
  },

  gameCardDesc: {
    color: "#9AA4B8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  gameCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#202A3E",
  },

  gameCardFeature: {
    color: "#6D7992",
    fontSize: 11,
    flex: 1,
  },

  playBadge: {
    backgroundColor: "#49D17D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  playBadgeText: {
    color: "#08130C",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
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

  ticTacToeCardBorder: {
    borderColor: "#FFB74D33",
  },

  ticTacToeTagBg: {
    backgroundColor: "#FFB74D22",
  },

  ticTacToeTagText: {
    color: "#FFB74D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  ticTacToePlayBadge: {
    backgroundColor: "#FFB74D",
  },

  ticTacToePlayText: {
    color: "#2A1600",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },

  blockDropCardBorder: {
    borderColor: "#FF704D33",
  },

  blockDropTagBg: {
    backgroundColor: "#FF704D22",
  },

  blockDropTagText: {
    color: "#FF704D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  blockDropPlayBadge: {
    backgroundColor: "#FF704D",
  },

  blockDropPlayText: {
    color: "#2A1208",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});
