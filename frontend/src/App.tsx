import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { GameMessage } from "./types";
import MainMenu from "./components/MainMenu";
import GameBoard from "./components/GameBoard";

function App() {
  const { gameState, connected, setConnected, gameMode } = useGameStore();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      setConnected(true);
      console.log("✅ Conectado al servidor");
    };

    ws.onmessage = (event) => {
      const message: GameMessage = JSON.parse(event.data);
      handleMessage(message);
    };

    ws.onerror = (error) => {
      console.error("❌ Error WebSocket:", error);
      setConnected(false);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("❌ Desconectado del servidor");
    };

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessage = (message: GameMessage) => {
    const { updateGameState, setPlayerId, setRoomId } = useGameStore.getState();

    switch (message.type) {
      case "join":
        setPlayerId(message.playerId);
        if (message.data?.roomId) {
          setRoomId(message.data.roomId);
        }
        break;

      case "game_state":
        updateGameState(message.data.gameState);
        break;

      case "error":
        console.error("Error:", message.message);
        alert(`Error: ${message.message}`);
        break;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800">
      {!connected && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-3xl mb-4">🔄</div>
            <p className="text-xl">Conectando al servidor...</p>
          </div>
        </div>
      )}

      {connected && gameMode === "online" && !gameState && <MainMenu />}
      {connected && (gameMode !== "online" || gameState) && <GameBoard />}
    </div>
  );
}

export default App;
