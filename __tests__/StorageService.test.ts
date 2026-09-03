import {
  DEFAULT_PROFILE,
  getLastJoinedIp,
  getUserProfile,
  saveLastJoinedIp,
  saveUserProfile,
} from "../src/services/storageService";

describe("StorageService (Profile & IP Persistence)", () => {
  test("Loads default profile when nothing stored", async () => {
    const profile = await getUserProfile();
    expect(profile.nickname).toBeDefined();
    expect(profile.avatar).toBeDefined();
  });

  test("Saves and retrieves updated user profile", async () => {
    const customProfile = { nickname: "Yash", avatar: "🦁" };
    const saved = await saveUserProfile(customProfile);
    expect(saved).toBe(true);

    const retrieved = await getUserProfile();
    expect(retrieved.nickname).toBe("Yash");
    expect(retrieved.avatar).toBe("🦁");
  });

  test("Saves and retrieves last joined host IP", async () => {
    const testIp = "192.168.43.105";
    const saved = await saveLastJoinedIp(testIp);
    expect(saved).toBe(true);

    const retrieved = await getLastJoinedIp();
    expect(retrieved).toBe(testIp);
  });
});
