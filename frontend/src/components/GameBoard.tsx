import { useEffect, useMemo, useState } from "react";
import { CARDS_INFO } from "../cards";
import { useGameStore } from "../store/gameStore";
import { Card as CardType, GameState, PlayerState } from "../types";

type LocalPlayerId = "p1" | "p2";

interface LocalGameState {
  phase: GameState["phase"];
  currentPlayer: LocalPlayerId;
  players: Record<LocalPlayerId, PlayerState>;
  battleZone: CardType[];
  turn: number;
}

function toImageSrc(path: string): string {
  if (path.startsWith("http") || path.startsWith("/")) {
    return path;
  }
  return `/${path}`;
}

function CardComponent({
  card,
  onClick,
  isVisible = true,
  isSelected = false,
}: {
  card: CardType;
  onClick: () => void;
  isVisible?: boolean;
  isSelected?: boolean;
}) {
  const totalAtk = card.stats.baseAtk + card.stats.dynamicAtk + card.stats.fixedAtk;
  const totalDef = card.stats.baseDef + card.stats.dynamicDef + card.stats.fixedDef;

  return (
    <div
      onClick={onClick}
      className={`card w-24 h-32 cursor-pointer flex flex-col justify-between p-2 hover:scale-105 transition-transform relative overflow-hidden ${
        isSelected ? "ring-2 ring-yellow-300" : ""
      }`}
    >
      <img
        src={toImageSrc(card.imagePath)}
        alt={isVisible ? card.name : "Card Back"}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {isVisible && (
        <div className="relative z-10 bg-black bg-opacity-60 p-1 rounded">
          <div className="text-xs font-bold line-clamp-2">{card.name}</div>
          <div className="flex justify-between text-xs font-bold">
            <div className="text-red-400">ATK: {totalAtk}</div>
            <div className="text-blue-400">DEF: {totalDef}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDefaultDecks() {
  const cards = CARDS_INFO.slice(0, 42).map((info, idx) => ({
    cardId: `${idx + 1}`,
    name: info.name,
    imagePath: info.imagePath,
    stats: {
      baseAtk: info.baseAtk,
      baseDef: info.baseDef,
      dynamicAtk: 0,
      dynamicDef: 0,
      fixedAtk: 0,
      fixedDef: 0,
    },
  }));

  const shuffled = shuffle(cards);
  return {
    deck1: shuffled.slice(0, 21),
    deck2: shuffled.slice(21, 42),
  };
}

function drawOne(player: PlayerState): PlayerState {
  if (player.deck.length === 0) {
    return player;
  }

  const [drawn, ...remaining] = player.deck;
  return {
    ...player,
    hand: [...player.hand, drawn],
    deck: remaining,
  };
}

function createInitialLocalState(name1: string, name2: string): LocalGameState {
  const { deck1, deck2 } = getDefaultDecks();

  return {
    phase: "draw_phase",
    currentPlayer: "p1",
    players: {
      p1: {
        id: "p1",
        name: name1,
        hand: deck1.slice(0, 7),
        battleZone: [],
        graveyard: [],
        deck: deck1.slice(7),
        lifePoints: 4000,
      },
      p2: {
        id: "p2",
        name: name2,
        hand: deck2.slice(0, 7),
        battleZone: [],
        graveyard: [],
        deck: deck2.slice(7),
        lifePoints: 4000,
      },
    },
    battleZone: [],
    turn: 1,
  };
}

function GameBoard() {
  const { gameState, playerId, gameMode } = useGameStore();
  const [localState, setLocalState] = useState<LocalGameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (gameMode === "local" || gameMode === "ai") {
      const player1 = window.localStorage.getItem("localPlayer1Name") || "Jugador 1";
      const player2 =
        gameMode === "ai"
          ? "IA"
          : window.localStorage.getItem("localPlayer2Name") || "Jugador 2";

      setLocalState(createInitialLocalState(player1, player2));
      setSelectedCardId(null);
    }
  }, [gameMode]);

  const currentLocalPlayerId = localState?.currentPlayer ?? "p1";
  const opponentLocalPlayerId: LocalPlayerId = currentLocalPlayerId === "p1" ? "p2" : "p1";

  const isHumanTurn = useMemo(() => {
    if (gameMode !== "ai") {
      return true;
    }
    return currentLocalPlayerId === "p1";
  }, [currentLocalPlayerId, gameMode]);

  const endLocalTurn = () => {
    setLocalState((prev) => {
      if (!prev) {
        return prev;
      }

      const nextPlayer: LocalPlayerId = prev.currentPlayer === "p1" ? "p2" : "p1";
      return {
        ...prev,
        currentPlayer: nextPlayer,
        turn: prev.turn + 1,
        players: {
          ...prev.players,
          [nextPlayer]: drawOne(prev.players[nextPlayer]),
        },
      };
    });

    setSelectedCardId(null);
  };

  const playSelectedCard = () => {
    if (!localState || !selectedCardId || !isHumanTurn) {
      return;
    }

    const player = localState.players[currentLocalPlayerId];
    const cardIndex = player.hand.findIndex((card) => card.cardId === selectedCardId);
    if (cardIndex === -1) {
      return;
    }

    const selected = player.hand[cardIndex];
    const newHand = player.hand.filter((card) => card.cardId !== selectedCardId);

    setLocalState({
      ...localState,
      players: {
        ...localState.players,
        [currentLocalPlayerId]: {
          ...player,
          hand: newHand,
          battleZone: [...player.battleZone, selected],
        },
      },
    });

    setSelectedCardId(null);
  };

  useEffect(() => {
    if (gameMode !== "ai" || !localState || localState.currentPlayer !== "p2") {
      return;
    }

    const timer = window.setTimeout(() => {
      setLocalState((prev) => {
        if (!prev || prev.currentPlayer !== "p2") {
          return prev;
        }

        const aiPlayer = prev.players.p2;
        const humanPlayer = prev.players.p1;

        const aiHand = [...aiPlayer.hand];
        const aiBattle = [...aiPlayer.battleZone];

        if (aiHand.length > 0) {
          const randomIndex = Math.floor(Math.random() * aiHand.length);
          const [playedCard] = aiHand.splice(randomIndex, 1);
          aiBattle.push(playedCard);
        }

        return {
          ...prev,
          currentPlayer: "p1",
          turn: prev.turn + 1,
          players: {
            p1: drawOne(humanPlayer),
            p2: {
              ...aiPlayer,
              hand: aiHand,
              battleZone: aiBattle,
            },
          },
        };
      });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [gameMode, localState]);

  if (gameMode === "online") {
    if (!gameState) {
      return <div className="p-6">Esperando estado de partida online...</div>;
    }

    const currentPlayerState = gameState.players[playerId];
    const opponentId = Object.keys(gameState.players).find((id) => id !== playerId);
    const opponentState = opponentId ? gameState.players[opponentId] : null;

    if (!currentPlayerState) {
      return <div className="p-6">Esperando al segundo jugador...</div>;
    }

    return (
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Turno {gameState.turn}</h2>
            <p className="text-sm text-slate-400">Fase: {gameState.phase.replace("_", " ")}</p>
          </div>
        </div>

        {opponentState && (
          <div className="card p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{opponentState.name}</h3>
              <div className="text-2xl font-bold text-red-400">{opponentState.lifePoints} LP</div>
            </div>

            <div className="flex gap-2 mb-2">
              <span className="text-xs text-slate-400">📚 Mazo: {opponentState.deck.length} cartas</span>
              <span className="text-xs text-slate-400">📋 Mano: {opponentState.hand.length} cartas</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {opponentState.battleZone.map((card) => (
                <CardComponent key={card.cardId} card={card} onClick={() => {}} isVisible={false} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 card p-4 mb-4">
          <h3 className="text-center text-lg font-bold mb-4">Zona de Batalla</h3>
          <div className="text-center text-slate-400">Batalla en progreso...</div>
        </div>

        <div className="card p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{currentPlayerState.name} (Tú)</h3>
            <div className="text-2xl font-bold text-green-400">{currentPlayerState.lifePoints} LP</div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Cartas en Batalla:</h4>
            <div className="flex gap-2 flex-wrap mb-4">
              {currentPlayerState.battleZone.map((card) => (
                <CardComponent key={card.cardId} card={card} onClick={() => {}} isVisible={true} />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Mano ({currentPlayerState.hand.length}):</h4>
            <div className="flex gap-2 flex-wrap">
              {currentPlayerState.hand.map((card) => (
                <CardComponent key={card.cardId} card={card} onClick={() => {}} isVisible={true} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!localState) {
    return <div className="p-6">Preparando partida...</div>;
  }

  const currentPlayerState = localState.players[currentLocalPlayerId];
  const opponentState = localState.players[opponentLocalPlayerId];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Turno {localState.turn}</h2>
          <p className="text-sm text-slate-400">Fase: {localState.phase.replace("_", " ")}</p>
          <p className="text-sm text-slate-300">
            Juega: {currentPlayerState.name}
            {gameMode === "ai" && !isHumanTurn ? " (IA)" : ""}
          </p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">{opponentState.name}</h3>
          <div className="text-2xl font-bold text-red-400">{opponentState.lifePoints} LP</div>
        </div>
        <div className="flex gap-2 mb-2">
          <span className="text-xs text-slate-400">📚 Mazo: {opponentState.deck.length} cartas</span>
          <span className="text-xs text-slate-400">📋 Mano: {opponentState.hand.length} cartas</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {opponentState.battleZone.map((card) => (
            <CardComponent key={card.cardId} card={card} onClick={() => {}} isVisible={false} />
          ))}
        </div>
      </div>

      <div className="flex-1 card p-4 mb-4">
        <h3 className="text-center text-lg font-bold mb-4">Zona de Batalla</h3>
        <div className="text-center text-slate-400">Selecciona una carta de tu mano y pulsa "Jugar Carta".</div>
      </div>

      <div className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">{currentPlayerState.name}</h3>
          <div className="text-2xl font-bold text-green-400">{currentPlayerState.lifePoints} LP</div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Cartas en Batalla:</h4>
          <div className="flex gap-2 flex-wrap mb-4">
            {currentPlayerState.battleZone.map((card) => (
              <CardComponent key={card.cardId} card={card} onClick={() => {}} isVisible={true} />
            ))}
          </div>
          {currentPlayerState.battleZone.length === 0 && (
            <p className="text-xs text-slate-400">Sin cartas en combate</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Mano ({currentPlayerState.hand.length}):</h4>
          <div className="flex gap-2 flex-wrap">
            {currentPlayerState.hand.map((card) => (
              <CardComponent
                key={card.cardId}
                card={card}
                isVisible={true}
                isSelected={selectedCardId === card.cardId}
                onClick={() => {
                  if (!isHumanTurn) {
                    return;
                  }
                  setSelectedCardId((prev) => (prev === card.cardId ? null : card.cardId));
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="btn flex-1" onClick={playSelectedCard} disabled={!selectedCardId || !isHumanTurn}>
            📤 Jugar Carta
          </button>
          <button className="btn flex-1" disabled>
            ⚔️ Atacar (pronto)
          </button>
          <button className="btn flex-1" onClick={endLocalTurn} disabled={!isHumanTurn}>
            ➡️ Terminar Turno
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
