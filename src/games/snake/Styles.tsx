import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 18,
        justifyContent: "center",
    },

    centerScreen: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    scrollScreen: {
        flex: 1,
    },

    gameContent: {
        padding: 18,
        alignItems: "center",
        paddingBottom: 40,
    },

    screenTitle: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
    },

    screenSubtitle: {
        color: "#A8B0C2",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 25,
    },

    primaryButton: {
        width: "100%",
        maxWidth: 300,
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 12,
    },

    secondaryButton: {
        width: "100%",
        maxWidth: 300,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3B4355",
        alignItems: "center",
        marginTop: 12,
    },

    secondaryButtonText: {
        color: "#D8DCE5",
        fontWeight: "800",
        letterSpacing: 1,
    },

    difficultyButton: {
        backgroundColor: "#151C2E",
        borderWidth: 1,
        borderColor: "#293248",
        borderRadius: 14,
        padding: 20,
        marginBottom: 14,
    },

    snakeCardBorder: {
        borderColor: "#00E5FF33",
    },

    snakeDifficultyTitle: {
        color: "#00E5FF",
        fontSize: 20,
        fontWeight: "900",
    },

    difficultyGrid: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 6,
    },

    difficultyDescription: {
        color: "#98A2B3",
        marginTop: 8,
    },

    gameHeader: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#151C2E",
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
    },

    levelText: {
        color: "#FFFFFF",
        marginTop: 3,
        fontWeight: "700",
    },

    stats: {
        alignItems: "center",
    },

    statLabel: {
        color: "#7B8497",
        fontSize: 10,
        fontWeight: "800",
    },

    statValue: {
        color: "#FFFFFF",
        marginTop: 4,
        fontSize: 17,
        fontWeight: "800",
    },

    gestureZone: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#151C2E",
        borderWidth: 1,
        borderColor: "#28344E",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        marginTop: 16,
    },

    gestureIcon: {
        fontSize: 22,
        marginBottom: 4,
    },

    snakeGestureTitle: {
        color: "#00E5FF",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1,
    },

    gestureSubtitle: {
        color: "#8B96AA",
        fontSize: 12,
        textAlign: "center",
        marginTop: 4,
    },

    quitButton: {
        marginTop: 14,
        padding: 10,
    },

    quitButtonText: {
        color: "#FF7373",
        fontWeight: "800",
        fontSize: 13,
    },

    trophy: {
        fontSize: 64,
        marginBottom: 8,
    },

    resultTitle: {
        color: "#FFFFFF",
        fontSize: 30,
        fontWeight: "900",
        textAlign: "center",
    },

    resultCard: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#151C2E",
        borderRadius: 14,
        padding: 20,
        marginTop: 24,
        marginBottom: 12,
    },

    resultRow: {
        paddingVertical: 8,
    },

    resultLabel: {
        color: "#8D96A8",
        fontSize: 11,
        fontWeight: "800",
    },

    resultValue: {
        color: "#FFFFFF",
        fontSize: 23,
        fontWeight: "900",
        marginTop: 4,
    },

    snakeBoard: {
        backgroundColor: "#0D1424",
        borderWidth: 3,
        borderColor: "#FF4D4F", // Red border indicating lethal boundary
        position: "relative",
    },

    snakeBorderWarning: {
        color: "#FF7373",
        fontWeight: "700",
        fontSize: 13,
        marginBottom: 12,
    },

    snakeFoodDot: {
        position: "absolute",
        backgroundColor: "#FFD24A",
        shadowColor: "#FFD24A",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 5,
    },

    snakeHead: {
        position: "absolute",
        backgroundColor: "#00E5FF",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        borderRadius: 6,
    },

    snakeEyesRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "70%",
    },

    snakeEye: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#08130C",
    },

    eyeUp: {
        marginTop: -2,
    },

    eyeDown: {
        marginBottom: -2,
    },

    snakeBody: {
        position: "absolute",
        backgroundColor: "#00B4D8",
        zIndex: 5,
        borderRadius: 4,
    },

    snakeActionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginTop: 10,
    },

    pauseButton: {
        backgroundColor: "#1D2B44",
        paddingVertical: 10,
        paddingHorizontal: 22,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#304266",
        marginTop: 14,
    },

    pauseButtonText: {
        color: "#00E5FF",
        fontWeight: "900",
        fontSize: 13,
        letterSpacing: 1,
    },

    snakeReasonText: {
        color: "#FF7373",
        fontSize: 15,
        fontWeight: "700",
        marginTop: 6,
    },

    snakeScoreValue: {
        color: "#00E5FF",
        fontSize: 28,
        fontWeight: "900",
        marginTop: 4,
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
});