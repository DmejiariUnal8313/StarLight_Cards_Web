import { useState } from "react";
import { useGameStore } from "../store/gameStore";

function MainMenu() {
  const { playerId } = useGameStore();
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          playerId: playerId || undefined,
          data: { name: playerName || "Jugador" },
        })
      );
    };
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          StarLight Cards
        </h1>
        <p className="text-center text-slate-400 mb-6">Juego de Cartas 1v1</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:border-indigo-500 focus:outline-none"
          />

          <button onClick={handleJoin} className="btn w-full">
            🎮 Buscar Partida
          </button>

          <div className="text-center text-sm text-slate-400">
            <p>Esperando a otro jugador...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
