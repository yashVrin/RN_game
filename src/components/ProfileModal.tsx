import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  DEFAULT_AVATARS,
  getUserProfile,
  saveUserProfile,
  UserProfile,
} from "../services/storageService";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onProfileUpdated,
}) => {
  const [nickname, setNickname] = useState<string>("Player 1");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("👑");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      getUserProfile().then((profile) => {
        setNickname(profile.nickname);
        setSelectedAvatar(profile.avatar);
      });
    }
  }, [visible]);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert("Invalid Name", "Please enter a valid nickname.");
      return;
    }

    setIsSaving(true);
    const updated: UserProfile = {
      nickname: trimmed,
      avatar: selectedAvatar,
    };

    await saveUserProfile(updated);
    setIsSaving(false);
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.overlay}>
        <View style={localStyles.card}>
          {/* Header */}
          <View style={localStyles.headerRow}>
            <Text style={localStyles.title}>👤 Player Profile</Text>
            <Pressable style={localStyles.closeBtn} onPress={onClose}>
              <Text style={localStyles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar Preview */}
            <View style={localStyles.avatarPreviewContainer}>
              <View style={localStyles.avatarCircle}>
                <Text style={localStyles.avatarPreviewText}>{selectedAvatar}</Text>
              </View>
              <Text style={localStyles.previewName} numberOfLines={1}>
                {nickname || "Player"}
              </Text>
              <Text style={localStyles.previewHint}>
                This name & avatar will be used in Dhagla Baji and multiplayer matches.
              </Text>
            </View>

            {/* Nickname Input */}
            <Text style={localStyles.sectionLabel}>YOUR NICKNAME</Text>
            <TextInput
              style={localStyles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter your nickname"
              placeholderTextColor="#64748B"
              maxLength={15}
            />

            {/* Choose Avatar Grid */}
            <Text style={[localStyles.sectionLabel, { marginTop: 14 }]}>
              CHOOSE AVATAR
            </Text>
            <View style={localStyles.avatarGrid}>
              {DEFAULT_AVATARS.map((av) => (
                <Pressable
                  key={av}
                  style={[
                    localStyles.avatarItem,
                    selectedAvatar === av && localStyles.avatarItemSelected,
                  ]}
                  onPress={() => setSelectedAvatar(av)}
                >
                  <Text style={localStyles.avatarEmoji}>{av}</Text>
                </Pressable>
              ))}
            </View>

            {/* Save Button */}
            <Pressable
              style={localStyles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={localStyles.saveButtonText}>
                {isSaving ? "SAVING..." : "SAVE PROFILE ✓"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "85%",
    backgroundColor: "#0F172A",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#38BDF8",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  closeBtnText: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "900",
  },
  avatarPreviewContainer: {
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    borderWidth: 2,
    borderColor: "#38BDF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarPreviewText: {
    fontSize: 34,
  },
  previewName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  previewHint: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    marginVertical: 6,
  },
  avatarItem: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarItemSelected: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
    borderColor: "#38BDF8",
    transform: [{ scale: 1.08 }],
  },
  avatarEmoji: {
    fontSize: 24,
  },
  saveButton: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 6,
    shadowColor: "#0284C7",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
