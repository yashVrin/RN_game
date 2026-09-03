import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  nickname: string;
  avatar: string;
}

const STORAGE_KEYS = {
  USER_PROFILE: "@rn_game_user_profile",
  LAST_JOINED_IP: "@rn_game_last_joined_ip",
};

export const DEFAULT_AVATARS = [
  "👑",
  "🦁",
  "⚡",
  "🎯",
  "🚀",
  "💎",
  "🐉",
  "🥷",
  "🐺",
  "🏆",
  "🎲",
  "🃏",
];

export const DEFAULT_PROFILE: UserProfile = {
  nickname: "Player 1",
  avatar: "👑",
};

/**
 * Loads the user's profile from AsyncStorage
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const jsonStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed.nickname === "string") {
        return {
          nickname: parsed.nickname.trim() || DEFAULT_PROFILE.nickname,
          avatar: parsed.avatar || DEFAULT_PROFILE.avatar,
        };
      }
    }
  } catch (error) {
    // Ignore error and return default
  }
  return DEFAULT_PROFILE;
}

/**
 * Saves the user's profile to AsyncStorage
 */
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile)
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Loads the last saved host IP address entered by the joiner
 */
export async function getLastJoinedIp(): Promise<string> {
  try {
    const savedIp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_JOINED_IP);
    if (savedIp && savedIp.trim()) {
      return savedIp.trim();
    }
  } catch (error) {
    // Ignore error
  }
  return "192.168.43.1";
}

/**
 * Saves the host IP address entered by the joiner
 */
export async function saveLastJoinedIp(ip: string): Promise<boolean> {
  try {
    if (ip && ip.trim()) {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_JOINED_IP, ip.trim());
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
