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
        backgroundColor: "#49D17D",
        alignItems: "center",
        marginTop: 12,
    },

    primaryButtonText: {
        color: "#08130C",
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 1,
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

    difficultyName: {
        color: "#49D17D",
        fontSize: 22,
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

    gameDifficulty: {
        color: "#49D17D",
        fontWeight: "900",
        fontSize: 16,
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

    goalText: {
        color: "#A8B0C2",
        marginBottom: 14,
        fontSize: 14,
    },

    mazeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: "#101727",
    },

    cell: {
        borderColor: "#D8DCE5",
        alignItems: "center",
        justifyContent: "center",
    },

    wallTop: {
        borderTopWidth: 2,
    },

    wallRight: {
        borderRightWidth: 2,
    },

    wallBottom: {
        borderBottomWidth: 2,
    },

    wallLeft: {
        borderLeftWidth: 2,
    },

    player: {
        backgroundColor: "#49D17D",
    },

    exit: {
        backgroundColor: "#FF4D4F",
    },

    hintCell: {
        backgroundColor: "#FFD24A",
    },

    hintButton: {
        backgroundColor: "#273047",
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginTop: 16,
    },

    hintButtonText: {
        color: "#FFD24A",
        fontWeight: "900",
        fontSize: 15,
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

    gestureTitle: {
        color: "#49D17D",
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

    resultDifficulty: {
        color: "#49D17D",
        fontWeight: "800",
        marginTop: 10,
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
});