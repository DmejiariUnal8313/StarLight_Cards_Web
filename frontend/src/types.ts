// Copiados del backend para el frontend
export interface CardInfo {
  name: string;
  imagePath: string;
  baseAtk: number;
  baseDef: number;
}

export interface CardStats {
  baseAtk: number;
  baseDef: number;
  dynamicAtk: number;
  dynamicDef: number;
  fixedAtk: number;
  fixedDef: number;
}

export type GamePhase = "draw_phase" | "main_phase" | "battle_phase" | "end_phase";

export interface Card {
  cardId: string;
  name: string;
  imagePath: string;
  stats: CardStats;
}

export interface PlayerState {
  id: string;
  name: string;
  hand: Card[];
  battleZone: Card[];
  graveyard: Card[];
  deck: Card[];
  lifePoints: number;
}

export interface GameState {
  phase: GamePhase;
  currentPlayer: string;
  players: {
    [key: string]: PlayerState;
  };
  battleZone: any[];
  turn: number;
}

export interface GameMessage {
  type: "join" | "play_card" | "attack" | "next_phase" | "game_state" | "error" | "chat";
  playerId: string;
  data?: any;
  message?: string;
}
