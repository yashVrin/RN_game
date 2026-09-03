import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getLegalMoves } from "../logic/deck";
import { styles } from "../Styles";
import { Card, Player, Suit } from "../types";
import { PlayingCard } from "./PlayingCard";

interface HandViewProps {
  player: Player;
  isMyTurn: boolean;
  leadSuit: Suit | null;
  onPlayCard: (card: Card) => void;
}

export const HandView: React.FC<HandViewProps> = ({
  player,
  isMyTurn,
  leadSuit,
  onPlayCard,
}) => {
  const hand = player.hand || [];
  const legalMoves = getLegalMoves(hand, leadSuit);

  const handlePlayTopCard = () => {
    if (!isMyTurn || hand.length === 0) return;
    // Select from legal moves (picks first valid card from player's hand)
    const cardToPlay = legalMoves[0] || hand[0];
    onPlayCard(cardToPlay);
  };

  const handlePlaySpecificIndex = (index: number) => {
    if (!isMyTurn || hand.length === 0) return;
    // If the card at this index is legal, play it; otherwise play first legal card
    const targetCard = hand[index];
    const isLegal = legalMoves.some((c) => c.id === targetCard.id);
    const cardToPlay = isLegal ? targetCard : legalMoves[0] || hand[0];
    onPlayCard(cardToPlay);
  };

  // Render a visual stack of face-down cards (up to 8 visible cards fanned/stacked)
  const visibleCardCount = Math.min(hand.length, 7);

  return (
    <View style={styles.bottomSection}>
      {/* Player Status Bar */}
      <View style={styles.playerStatusBar}>
        <View style={styles.playerStatsLeft}>
          <Text style={styles.playerAvatar}>{player.avatar}</Text>
          <Text style={styles.playerName}>{player.name} (You)</Text>
          <View style={localStyles.cardCountPill}>
            <Text style={localStyles.cardCountPillText}>
              🂠 {hand.length} CARDS
            </Text>
          </View>
        </View>

        <View style={styles.playerStatsRight}>
          <View style={styles.tensCollectedBadge}>
            <Text style={styles.tensCollectedText}>
              ⭐ TENS: {player.tensCaptured}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Face-Down Deck & Play Area */}
      <View style={localStyles.deckPlayContainer}>
        {/* Face-down cards cluster */}
        <View style={localStyles.cardStackWrapper}>
          {Array.from({ length: visibleCardCount }).map((_, idx) => {
            const offset = (idx - Math.floor(visibleCardCount / 2)) * 14;
            const rotation = (idx - Math.floor(visibleCardCount / 2)) * 4;
            return (
              <View
                key={`facedown_${idx}`}
                style={[
                  localStyles.stackedCardItem,
                  {
                    transform: [
                      { translateX: offset },
                      { rotate: `${rotation}deg` },
                    ],
                    zIndex: idx,
                  },
                ]}
              >
                <PlayingCard
                  isFaceDown={true}
                  isDisabled={!isMyTurn}
                  onPress={() => handlePlaySpecificIndex(idx)}
                  width={56}
                  height={80}
                />
              </View>
            );
          })}
        </View>

        {/* Big Action Button to Drop / Reveal Card */}
        <Pressable
          style={[
            localStyles.dropCardBtn,
            isMyTurn ? localStyles.dropCardBtnActive : localStyles.dropCardBtnDisabled,
          ]}
          onPress={handlePlayTopCard}
          disabled={!isMyTurn || hand.length === 0}
        >
          <Text style={localStyles.dropCardBtnText}>
            {isMyTurn
              ? "👉 DROP / REVEAL CARD 🂠"
              : "⏳ WAITING FOR OPPONENT..."}
          </Text>
          {isMyTurn && leadSuit && (
            <Text style={localStyles.dropCardSubText}>
              (Following {leadSuit.toUpperCase()})
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  cardCountPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  cardCountPillText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "800",
  },
  deckPlayContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  cardStackWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 90,
    width: "100%",
    marginBottom: 8,
  },
  stackedCardItem: {
    position: "absolute",
  },
  dropCardBtn: {
    width: "90%",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  dropCardBtnActive: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: "#34D399",
  },
  dropCardBtnDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  dropCardBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  dropCardSubText: {
    color: "#D1FAE5",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
});
