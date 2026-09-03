import React, { useEffect, useMemo, useState } from "react";
import { ClientManager } from "./network/clientManager";
import { HostManager } from "./network/hostManager";
import { GamePlayScreen } from "./screens/GamePlayScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { Card, GameState } from "./types";

interface DhaglaBajiGameProps {
  onBackToHome: () => void;
}

type ScreenMode = "LOBBY" | "GAMEPLAY";

export default function DhaglaBajiGame({
  onBackToHome,
}: DhaglaBajiGameProps): React.JSX.Element {
  const [screen, setScreen] = useState<ScreenMode>("LOBBY");
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [localSeat, setLocalSeat] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(true);

  const hostManager = useMemo(() => new HostManager(), []);
  const clientManager = useMemo(() => new ClientManager(), []);

  // Listen to HostManager state changes
  useEffect(() => {
    const unsubHost = hostManager.subscribe((event, data) => {
      if (event === "STATE_CHANGED" && data) {
        setGameState(data);
      }
    });

    return () => unsubHost();
  }, [hostManager]);

  // Listen to ClientManager state syncs
  useEffect(() => {
    const unsubClient = clientManager.subscribe((event, data) => {
      if (event === "STATE_SYNC" && data) {
        setGameState(data.gameState);
        if (data.localSeat !== undefined) {
          setLocalSeat(data.localSeat);
        }
      }
    });

    return () => unsubClient();
  }, [clientManager]);

  const handleStartHostGame = (initialState: GameState) => {
    setIsHost(true);
    setLocalSeat(0);
    setGameState(initialState);
    setScreen("GAMEPLAY");
  };

  const handleJoinedGameStarted = (
    initialState: GameState,
    joinedSeat: number
  ) => {
    setIsHost(false);
    setLocalSeat(joinedSeat);
    setGameState(initialState);
    setScreen("GAMEPLAY");
  };

  const handlePlayCard = (card: Card) => {
    if (!gameState) return;

    if (isHost) {
      hostManager.handleClientCardPlay("p_0", card.id);
    } else {
      clientManager.playCard(card.id);
    }
  };

  const handleRestart = () => {
    if (isHost) {
      const freshState = hostManager.startGame();
      if (freshState) {
        setGameState(freshState);
      }
    }
  };

  const handleExitToMenu = () => {
    hostManager.stopHost();
    clientManager.disconnect();
    setScreen("LOBBY");
  };

  return (
    <>
      {screen === "LOBBY" && (
        <LobbyScreen
          playerCount={playerCount}
          hostManager={hostManager}
          clientManager={clientManager}
          onStartHostGame={handleStartHostGame}
          onJoinedGameStarted={handleJoinedGameStarted}
          onBack={onBackToHome}
        />
      )}

      {screen === "GAMEPLAY" && gameState && (
        <GamePlayScreen
          initialState={gameState}
          localPlayerSeat={localSeat}
          onPlayCardAction={handlePlayCard}
          onExitGame={handleExitToMenu}
          onRestartGame={handleRestart}
        />
      )}
    </>
  );
}
