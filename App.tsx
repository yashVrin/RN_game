import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import HomeScreen from "./src/games/home/HomeScreen";
import BlockDropGame from "./src/games/blockdrop/BlockDropGame";
import MazeGame from "./src/games/maze/MazeGame";
import SnakeGame from "./src/games/snake/SnakeGame";
import TicTacToeGame from "./src/games/tictactoe/TicTacToeGame";

type ActiveView = "HOME" | "MAZE" | "SNAKE" | "TICTACTOE" | "BLOCKDROP";

export default function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<ActiveView>("HOME");

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      try {
        SplashScreen.hide();
      } catch {
        // Ignored if native splash screen is not present
      }
    }, 1800);

    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView
        style={styles.container}
        edges={["top", "bottom", "left", "right"]}
      >
        {activeView === "HOME" && (
          <HomeScreen
            onSelectMaze={() => setActiveView("MAZE")}
            onSelectSnake={() => setActiveView("SNAKE")}
            onSelectTicTacToe={() => setActiveView("TICTACTOE")}
            onSelectBlockDrop={() => setActiveView("BLOCKDROP")}
          />
        )}

        {activeView === "MAZE" && (
          <MazeGame onBackToHome={() => setActiveView("HOME")} />
        )}

        {activeView === "SNAKE" && (
          <SnakeGame onBackToHome={() => setActiveView("HOME")} />
        )}

        {activeView === "TICTACTOE" && (
          <TicTacToeGame onBackToHome={() => setActiveView("HOME")} />
        )}

        {activeView === "BLOCKDROP" && (
          <BlockDropGame onBackToHome={() => setActiveView("HOME")} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
  },
});
