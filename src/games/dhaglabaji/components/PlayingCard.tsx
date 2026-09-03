import React from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { SUIT_COLORS, SUIT_SYMBOLS } from "../constants";
import { styles } from "../Styles";
import { Card } from "../types";

interface PlayingCardProps {
  card?: Card;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  isBigCenter?: boolean;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceDown = false,
  isSelected = false,
  isDisabled = false,
  onPress,
  width = 54,
  height = 78,
  style,
  isBigCenter = false,
}) => {
  const cardWidth = isBigCenter ? 84 : width;
  const cardHeight = isBigCenter ? 122 : height;

  if (isFaceDown || !card) {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        style={[
          styles.cardWrapper,
          styles.cardBack,
          { width: cardWidth, height: cardHeight },
          isSelected && styles.cardSelected,
          isDisabled && styles.cardDisabled,
          style,
        ]}
      >
        <View style={styles.cardBackPattern}>
          <Text style={[styles.cardBackIcon, { fontSize: cardWidth > 60 ? 24 : 16 }]}>
            🂠
          </Text>
        </View>
      </Pressable>
    );
  }

  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const isTen = card.rank === "10";

  // Dynamic font sizing based on card width
  const rankFontSize = isBigCenter ? 20 : cardWidth > 60 ? 16 : 13;
  const suitPipFontSize = isBigCenter ? 16 : cardWidth > 60 ? 13 : 10;
  const centerSymbolFontSize = isBigCenter ? 38 : cardWidth > 60 ? 28 : 20;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        styles.cardWrapper,
        { width: cardWidth, height: cardHeight, borderRadius: isBigCenter ? 12 : 8 },
        isSelected && styles.cardSelected,
        isDisabled && styles.cardDisabled,
        isTen && { borderColor: "#F59E0B", borderWidth: isBigCenter ? 3 : 2 },
        isBigCenter && styles.bigCenterCardShadow,
        style,
      ]}
    >
      <View style={[styles.cardInner, { padding: isBigCenter ? 6 : 3 }]}>
        {/* Top-left rank & suit pip */}
        <View style={styles.cardCornerTop}>
          <Text style={[styles.cardRankText, { color: suitColor, fontSize: rankFontSize, lineHeight: rankFontSize + 2 }]}>
            {card.rank}
          </Text>
          <Text style={[styles.cardSuitSmall, { color: suitColor, fontSize: suitPipFontSize, lineHeight: suitPipFontSize + 2 }]}>
            {suitSymbol}
          </Text>
        </View>

        {/* Big center symbol */}
        <Text
          style={[
            styles.cardCenterSymbol,
            { color: suitColor, fontSize: centerSymbolFontSize },
          ]}
        >
          {suitSymbol}
        </Text>

        {/* Bottom-right inverted rank & suit pip */}
        <View style={styles.cardCornerBottom}>
          <Text style={[styles.cardRankText, { color: suitColor, fontSize: rankFontSize, lineHeight: rankFontSize + 2 }]}>
            {card.rank}
          </Text>
          <Text style={[styles.cardSuitSmall, { color: suitColor, fontSize: suitPipFontSize, lineHeight: suitPipFontSize + 2 }]}>
            {suitSymbol}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
