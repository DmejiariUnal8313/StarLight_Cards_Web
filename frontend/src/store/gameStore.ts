import { create } from "zustand";
import { GameState } from "../types";


export type GameMode = "online" | "local" | "ai";

interface GameStore {
  gameState: GameState | null;
  playerId: string;
  roomId: string;
  connected: boolean;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  updateGameState: (state: GameState) => void;
  setPlayerId: (id: string) => void;
  setRoomId: (id: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  playerId: "",
  roomId: "",
  connected: false,
  gameMode: "online",
  setGameMode: (mode) => set({ gameMode: mode }),
  updateGameState: (state) => set({ gameState: state }),
  setPlayerId: (id) => set({ playerId: id }),
  setRoomId: (id) => set({ roomId: id }),
  setConnected: (connected) => set({ connected }),
}));
