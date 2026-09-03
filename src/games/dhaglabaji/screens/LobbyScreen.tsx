import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getLastJoinedIp,
  getUserProfile,
  saveLastJoinedIp,
  UserProfile,
} from "../../../services/storageService";
import { ClientManager } from "../network/clientManager";
import { HostManager } from "../network/hostManager";
import { styles } from "../Styles";
import { GameState } from "../types";

interface LobbyScreenProps {
  playerCount: 2 | 3 | 4;
  hostManager: HostManager;
  clientManager: ClientManager;
  onStartHostGame: (initialState: GameState) => void;
  onJoinedGameStarted: (initialState: GameState, joinedSeat: number) => void;
  onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  playerCount: initialPlayerCount,
  hostManager,
  clientManager,
  onStartHostGame,
  onJoinedGameStarted,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"HOST" | "JOIN">("HOST");
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(initialPlayerCount);
  const [hostIp, setHostIp] = useState<string>("192.168.43.1");
  const [joinIpInput, setJoinIpInput] = useState<string>("192.168.43.1");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nickname: "Player 1",
    avatar: "👑",
  });
  const [playerNameInput, setPlayerNameInput] = useState<string>("Player 1");
  const [isHosting, setIsHosting] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnectedToHost, setIsConnectedToHost] = useState<boolean>(false);
  const [lobbySlots, setLobbySlots] = useState<any[]>([]);

  // Load saved profile & last joined IP on mount
  useEffect(() => {
    getUserProfile().then((profile) => {
      setUserProfile(profile);
      setPlayerNameInput(profile.nickname);
      if (activeTab === "HOST") {
        startHosting(playerCount, profile.nickname, profile.avatar);
      }
    });

    getLastJoinedIp().then((savedIp) => {
      if (savedIp) {
        setJoinIpInput(savedIp);
      }
    });
  }, []);

  // Initialize Host
  const startHosting = async (
    count: 2 | 3 | 4,
    name: string = userProfile.nickname,
    avatar: string = userProfile.avatar
  ) => {
    setIsHosting(true);
    const res = await hostManager.startHost(count, `${name} (Host)`, avatar);
    setHostIp(res.ip);
    setLobbySlots(hostManager.getSlots());
  };

  useEffect(() => {
    if (activeTab === "HOST") {
      startHosting(playerCount, userProfile.nickname, userProfile.avatar);
    } else {
      hostManager.stopHost();
      setIsHosting(false);
    }

    const unsubHost = hostManager.subscribe((event, data) => {
      if (event === "LOBBY_UPDATED") {
        setLobbySlots([...data.slots]);
      }
    });

    const unsubClient = clientManager.subscribe((event, data) => {
      if (event === "JOIN_ACCEPTED") {
        setIsConnectedToHost(true);
        setIsConnecting(false);
      } else if (event === "JOIN_REJECTED") {
        setIsConnecting(false);
        Alert.alert("Join Failed", data?.reason || "Could not join host room.");
      } else if (event === "STATE_SYNC") {
        onJoinedGameStarted(data.gameState, data.localSeat);
      }
    });

    return () => {
      unsubHost();
      unsubClient();
    };
  }, [activeTab, playerCount]);

  const handleConnectToHost = async () => {
    const trimmedIp = joinIpInput.trim();
    if (!trimmedIp) {
      Alert.alert("Input Error", "Please enter Host IP address.");
      return;
    }

    // Save IP persistently in AsyncStorage so user never has to re-type
    await saveLastJoinedIp(trimmedIp);

    setIsConnecting(true);
    const success = await clientManager.connectToHost(
      trimmedIp,
      playerNameInput.trim() || userProfile.nickname || "Player",
      userProfile.avatar || "🎯"
    );
    if (!success) {
      setIsConnecting(false);
      Alert.alert(
        "Connection Error",
        `Could not connect to ${trimmedIp}. Ensure you are connected to the Host's Wi-Fi hotspot!`
      );
    }
  };

  const handleStartHostMatch = () => {
    const initialState = hostManager.startGame();
    if (initialState) {
      onStartHostGame(initialState);
    }
  };

  return (
    <ScrollView style={styles.lobbyContainer} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← BACK</Text>
        </Pressable>
        <Text style={styles.lobbyTitle}>HOTSPOT LOBBY</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Profile summary pill */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 8, gap: 6 }}>
        <Text style={{ fontSize: 16 }}>{userProfile.avatar}</Text>
        <Text style={{ color: "#38BDF8", fontSize: 13, fontWeight: "800" }}>
          Playing as: {userProfile.nickname}
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        <Pressable
          style={[
            styles.playerCountBtn,
            { flex: 1, alignItems: "center" },
            activeTab === "HOST" && styles.playerCountBtnActive,
          ]}
          onPress={() => setActiveTab("HOST")}
        >
          <Text
            style={[
              styles.playerCountText,
              activeTab === "HOST" && styles.playerCountTextActive,
            ]}
          >
            👑 CREATE / HOST
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.playerCountBtn,
            { flex: 1, alignItems: "center" },
            activeTab === "JOIN" && styles.playerCountBtnActive,
          ]}
          onPress={() => setActiveTab("JOIN")}
        >
          <Text
            style={[
              styles.playerCountText,
              activeTab === "JOIN" && styles.playerCountTextActive,
            ]}
          >
            🔗 JOIN GAME
          </Text>
        </Pressable>
      </View>

      {activeTab === "HOST" ? (
        <View>
          {/* Player Count Filter */}
          <Text style={[styles.rulesTitle, { textAlign: "center" }]}>
            PLAYERS COUNT ({playerCount} PLAYERS)
          </Text>
          <View style={styles.playerCountSelector}>
            {([2, 3, 4] as const).map((cnt) => (
              <Pressable
                key={`host_cnt_${cnt}`}
                style={[
                  styles.playerCountBtn,
                  playerCount === cnt && styles.playerCountBtnActive,
                ]}
                onPress={() => {
                  setPlayerCount(cnt);
                  startHosting(cnt, userProfile.nickname, userProfile.avatar);
                }}
              >
                <Text
                  style={[
                    styles.playerCountText,
                    playerCount === cnt && styles.playerCountTextActive,
                  ]}
                >
                  {cnt} Players
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Host IP Card */}
          <View style={styles.ipCard}>
            <Text style={styles.ipLabel}>YOUR HOTSPOT / LOCAL IP</Text>
            <Text style={styles.ipValue}>{hostIp}</Text>
            <Text style={styles.ipHint}>
              Tell other players to connect to your Wi-Fi Hotspot and enter this IP to join!
            </Text>
          </View>

          {/* Connected Slots Card */}
          <View style={styles.slotsCard}>
            <Text style={styles.slotsTitle}>
              LOBBY PLAYERS ({lobbySlots.filter((s) => s.playerId).length}/{playerCount})
            </Text>
            {lobbySlots.map((slot, idx) => (
              <View key={`slot_${idx}`} style={styles.slotRow}>
                <View style={styles.slotLeft}>
                  <Text style={styles.slotAvatar}>{slot.avatar || "⚪"}</Text>
                  <Text style={styles.slotName}>
                    {slot.playerName || `Seat ${idx + 1} (Waiting...)`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.slotStatusBadge,
                    slot.playerId ? styles.slotStatusReady : styles.slotStatusWaiting,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotStatusText,
                      { color: slot.playerId ? "#10B981" : "#F59E0B" },
                    ]}
                  >
                    {slot.playerId ? (slot.isHost ? "HOST" : "READY") : "EMPTY"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Start Game Button */}
          <Pressable
            style={[styles.modeStartButton, { marginTop: 12 }]}
            onPress={handleStartHostMatch}
          >
            <Text style={styles.modeStartButtonText}>
              START GAME ({lobbySlots.filter((s) => s.playerId).length}/{playerCount}) ▶
            </Text>
          </Pressable>
        </View>
      ) : (
        <View>
          {/* Join Form */}
          <View style={styles.ipCard}>
            <Text style={styles.ipLabel}>ENTER HOST IP ADDRESS (AUTO-SAVED)</Text>
            <View style={styles.joinInputRow}>
              <TextInput
                style={styles.ipInput}
                value={joinIpInput}
                onChangeText={setJoinIpInput}
                placeholder="e.g. 192.168.43.1"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />
            </View>

            <Text style={[styles.ipLabel, { marginTop: 10 }]}>YOUR NICKNAME</Text>
            <View style={styles.joinInputRow}>
              <TextInput
                style={styles.ipInput}
                value={playerNameInput}
                onChangeText={setPlayerNameInput}
                placeholder="Enter your name"
                placeholderTextColor="#64748B"
              />
            </View>

            <Pressable
              style={[styles.modeStartButton, { width: "100%", marginTop: 12 }]}
              onPress={handleConnectToHost}
              disabled={isConnecting || isConnectedToHost}
            >
              {isConnecting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modeStartButtonText}>
                  {isConnectedToHost ? "CONNECTED! WAITING FOR HOST..." : "CONNECT TO HOST ▶"}
                </Text>
              )}
            </Pressable>
          </View>

          {isConnectedToHost && (
            <View style={styles.slotsCard}>
              <Text style={[styles.slotsTitle, { color: "#34D399", textAlign: "center" }]}>
                ✅ Connected! Please wait for the Host to start the match.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};
