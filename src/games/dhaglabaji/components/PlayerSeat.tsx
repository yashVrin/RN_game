import React from "react";
import { Text, View } from "react-native";
import { styles } from "../Styles";
import { Player } from "../types";

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  isLocalPlayer?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
}) => {
  return (
    <View
      style={[
        styles.seatBox,
        isCurrentTurn && styles.activeSeatBox,
      ]}
    >
      <Text style={styles.seatAvatar}>{player.avatar}</Text>
      <Text style={styles.seatName} numberOfLines={1}>
        {player.name}
      </Text>

      <View style={styles.seatStats}>
        {/* Remaining Cards Badge */}
        <View style={styles.seatCardCountBadge}>
          <Text style={styles.seatCardCountText}>🂠 {player.cardCount}</Text>
        </View>

        {/* Tens Captured Badge */}
        {player.tensCaptured > 0 && (
          <View style={styles.seatTensBadge}>
            <Text style={styles.seatTensText}>⭐ {player.tensCaptured}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
