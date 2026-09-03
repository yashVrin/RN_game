import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ProfileModal } from "../../components/ProfileModal";
import { getUserProfile, UserProfile } from "../../services/storageService";
import { styles } from "./Styles";

interface HomeScreenProps {
  onSelectMaze: () => void;
  onSelectSnake: () => void;
  onSelectTicTacToe: () => void;
  onSelectBlockDrop: () => void;
  onSelectChess: () => void;
  onSelectDhaglaBaji: () => void;
}

export default function HomeScreen({
  onSelectMaze,
  onSelectSnake,
  onSelectTicTacToe,
  onSelectBlockDrop,
  onSelectChess,
  onSelectDhaglaBaji,
}: HomeScreenProps): React.JSX.Element {
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nickname: "Player 1",
    avatar: "👑",
  });

  useEffect(() => {
    getUserProfile().then((p) => setUserProfile(p));
  }, []);

  return (
    <ScrollView
      style={styles.scrollScreen}
      contentContainerStyle={styles.homeContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Profile Header Bar */}
      <View style={styles.profileTopBar}>
        <Pressable
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
        >
          <Text style={styles.profileAvatar}>{userProfile.avatar}</Text>
          <Text style={styles.profileName} numberOfLines={1}>
            {userProfile.nickname}
          </Text>
          <Text style={styles.profileEditIcon}>✏️</Text>
        </Pressable>
      </View>

      <View style={styles.arcadeHeader}>
        <Text style={styles.arcadeBadge}>RETRO ARCADE</Text>
        <Text style={styles.arcadeTitle}>GAME ZONE</Text>
        <Text style={styles.arcadeSubtitle}>
          Select a classic arcade game to play!
        </Text>
      </View>

      {/* Dhagla Baji Game Selection Card */}
      <Pressable
        style={[styles.gameCard, styles.dhaglaBajiCardBorder]}
        onPress={onSelectDhaglaBaji}
      >
        <View style={styles.gameCardHeader}>
          <Text style={styles.gameCardIcon}>🃏👑</Text>
          <View style={[styles.gameCardTagContainer, styles.dhaglaBajiTagBg]}>
            <Text style={styles.dhaglaBajiTagText}>ઢગલાબાજી • TRADITIONAL</Text>
          </View>
        </View>

        <Text style={styles.gameCardTitle}>DHAGLA BAJI (ઢગલાબાજી)</Text>
        <Text style={styles.gameCardDesc}>
          Traditional Gujarati card battle! Capture the center Dhagla with consecutive round wins and collect the Tens. Play multiplayer over Hotspot without internet (2 to 4 players)!
        </Text>

        <View style={styles.gameCardFooter}>
          <Text style={styles.gameCardFeature}>
            🔥 2-4 Players • Offline Hotspot • Real Cards • No Internet
          </Text>
          <View style={[styles.playBadge, styles.dhaglaBajiPlayBadge]}>
            <Text style={styles.dhaglaBajiPlayText}>PLAY ▶</Text>
          </View>
        </View>
      </Pressable>

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

      {/* Chess Game Selection Card */}
      <Pressable
        style={[styles.gameCard, styles.chessCardBorder]}
        onPress={onSelectChess}
      >
        <View style={styles.gameCardHeader}>
          <Text style={styles.gameCardIcon}>♟️👑</Text>
          <View style={[styles.gameCardTagContainer, styles.chessTagBg]}>
            <Text style={styles.chessTagText}>2P & VS AI</Text>
          </View>
        </View>

        <Text style={styles.gameCardTitle}>CHESS ARENA</Text>
        <Text style={styles.gameCardDesc}>
          Classic tactical showdown. Challenge a friend locally or test your skills against the smart Computer AI!
        </Text>

        <View style={styles.gameCardFooter}>
          <Text style={styles.gameCardFeature}>
            🧠 2 Players • Smart AI • Move Hints • Undo
          </Text>
          <View style={[styles.playBadge, styles.chessPlayBadge]}>
            <Text style={styles.chessPlayText}>PLAY ▶</Text>
          </View>
        </View>
      </Pressable>

      {/* User Profile Customization Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onProfileUpdated={(updated) => setUserProfile(updated)}
      />
    </ScrollView>
  );
}


