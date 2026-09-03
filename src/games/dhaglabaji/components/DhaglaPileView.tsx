import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { countTens } from "../logic/deck";
import { styles } from "../Styles";
import { Card, PlayedCard, Player, Suit } from "../types";
import { PlayingCard } from "./PlayingCard";

interface DhaglaPileViewProps {
  currentRoundCards: PlayedCard[];
  dhaglaCenterPile: Card[];
  leadSuit: Suit | null;
  players: Player[];
  consecutiveWinnerId: string | null;
  consecutiveWinCount: number;
  lastCaptureEvent: {
    winnerId: string;
    winnerName: string;
    cardCount: number;
    tensCount: number;
  } | null;
}

export const DhaglaPileView: React.FC<DhaglaPileViewProps> = ({
  currentRoundCards,
  dhaglaCenterPile,
  leadSuit,
  players,
  consecutiveWinnerId,
  consecutiveWinCount,
  lastCaptureEvent,
}) => {
  const streakPlayer = players.find((p) => p.id === consecutiveWinnerId);
  const tensInDhagla = countTens(dhaglaCenterPile);

  return (
    <View style={styles.centerBoard}>
      <View style={localStyles.dhaglaFeltArea}>
        {/* Center Dhagla Pile Counter */}
        <View style={localStyles.dhaglaHeaderBadge}>
          <Text style={localStyles.dhaglaHeaderText}>
            📦 DHAGLA PILE: {dhaglaCenterPile.length} CARDS
            {tensInDhagla > 0 ? ` • ⭐ ${tensInDhagla} TENS` : ""}
          </Text>
        </View>

        {/* Current Round Played Cards - Rendered BIG */}
        <View style={localStyles.centerTrickBigRow}>
          {currentRoundCards.length === 0 ? (
            <View style={localStyles.waitingPlaceholder}>
              <Text style={localStyles.waitingEmoji}>🃏</Text>
              <Text style={localStyles.emptyPrompt}>Waiting for player to drop card...</Text>
            </View>
          ) : (
            currentRoundCards.map((played, idx) => {
              const player = players.find((p) => p.id === played.playerId);
              return (
                <View key={`played_${played.card.id}_${idx}`} style={localStyles.playedCardWrapper}>
                  <View style={localStyles.playerNamePill}>
                    <Text style={localStyles.playedPlayerName} numberOfLines={1}>
                      {player?.name || `Player ${played.seat + 1}`}
                    </Text>
                  </View>
                  <PlayingCard
                    card={played.card}
                    isBigCenter={true}
                    width={84}
                    height={122}
                  />
                </View>
              );
            })
          )}
        </View>

        {/* Lead Suit Indicator */}
        {leadSuit && (
          <View style={styles.leadSuitTag}>
            <Text style={styles.leadSuitText}>
              ACTIVE SUIT: {leadSuit.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Streak Alert / Capture Banner */}
      {lastCaptureEvent ? (
        <View style={localStyles.captureCelebrationBanner}>
          <Text style={localStyles.captureCelebrationText}>
            🎉 {lastCaptureEvent.winnerName} CAPTURED THE DHAGLA! (+{lastCaptureEvent.cardCount} cards, +{lastCaptureEvent.tensCount} Tens)
          </Text>
        </View>
      ) : consecutiveWinCount === 1 && streakPlayer ? (
        <View style={styles.streakBanner}>
          <Text style={styles.streakBannerText}>
            🔥 {streakPlayer.name}: 1 Win Streak! Win next round to capture Dhagla!
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const localStyles = StyleSheet.create({
  dhaglaFeltArea: {
    width: "94%",
    minHeight: 210,
    borderRadius: 24,
    backgroundColor: "rgba(2, 24, 12, 0.75)",
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: "relative",
  },
  dhaglaHeaderBadge: {
    position: "absolute",
    top: 8,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  dhaglaHeaderText: {
    color: "#FFDF79",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  centerTrickBigRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
    marginBottom: 12,
    flexWrap: "nowrap",
  },
  waitingPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  waitingEmoji: {
    fontSize: 32,
    opacity: 0.5,
    marginBottom: 4,
  },
  emptyPrompt: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    fontWeight: "700",
    fontStyle: "italic",
  },
  playedCardWrapper: {
    alignItems: "center",
  },
  playerNamePill: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  playedPlayerName: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "800",
    maxWidth: 80,
    textAlign: "center",
  },
  captureCelebrationBanner: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 6,
  },
  captureCelebrationText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
});
