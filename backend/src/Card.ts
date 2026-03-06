import { CardInfo, CardStats, GamePhase } from "./types";

export class Card {
  name: string;
  imagePath: string;
  cardId: string;
  stats: CardStats;

  constructor(
    cardId: string,
    info: CardInfo
  ) {
    this.cardId = cardId;
    this.name = info.name;
    this.imagePath = info.imagePath;
    this.stats = {
      baseAtk: info.baseAtk,
      baseDef: info.baseDef,
      dynamicAtk: 0,
      dynamicDef: 0,
      fixedAtk: 0,
      fixedDef: 0,
    };
  }

  getTotalAtk(): number {
    return this.stats.baseAtk + this.stats.dynamicAtk + this.stats.fixedAtk;
  }

  getTotalDef(): number {
    return this.stats.baseDef + this.stats.dynamicDef + this.stats.fixedDef;
  }

  applyBuff(atkBuff: number, defBuff: number): void {
    this.stats.dynamicAtk += atkBuff;
    this.stats.dynamicDef += defBuff;
  }

  resetDynamicStats(): void {
    this.stats.dynamicAtk = 0;
    this.stats.dynamicDef = 0;
  }

  getDescription(): string {
    return `${this.name}\nATK: ${this.getTotalAtk()} | DEF: ${this.getTotalDef()}`;
  }
}

// Base de datos de cartas
export const CARDS_INFO: CardInfo[] = [
  { name: "Yon", imagePath: "assets/cards/Carta_1.jpg", baseAtk: 0, baseDef: 0 },
  { name: "Igna", imagePath: "assets/cards/Carta_2.jpg", baseAtk: 500, baseDef: 500 },
  { name: "Ado", imagePath: "assets/cards/Carta_3.jpg", baseAtk: 500, baseDef: 500 },
  { name: "Osado", imagePath: "assets/cards/Carta_4.jpg", baseAtk: 1000, baseDef: 0 },
  { name: "Bortex", imagePath: "assets/cards/Carta_5.jpg", baseAtk: 0, baseDef: 0 },
  { name: "Mizuki", imagePath: "assets/cards/Carta_6.jpg", baseAtk: 0, baseDef: 1000 },
  { name: "Lin", imagePath: "assets/cards/Carta_7.jpg", baseAtk: 250, baseDef: 750 },
];
