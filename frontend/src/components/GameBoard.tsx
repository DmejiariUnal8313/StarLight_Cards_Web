import { useEffect, useMemo, useState } from "react";
import { CARDS_INFO } from "../cards";
import { useGameStore } from "../store/gameStore";
import { Card as CardType, GameState, PlayerState } from "../types";

type LocalPlayerId = "p1" | "p2";

const MAX_BATTLE_SLOTS = 5;
type BattleSlot = CardType | null;
type LocalPlayerState = Omit<PlayerState, "battleZone"> & { battleZoneSlots: BattleSlot[] };

interface LocalGameState {
  phase: GameState["phase"];
  currentPlayer: LocalPlayerId;
  players: Record<LocalPlayerId, LocalPlayerState>;
  battleZone: CardType[];
  turn: number;
}

interface PreviewCardState {
  card: CardType;
  isVisible: boolean;
}

const CARD_BACK_IMAGE = "/cards/ilustracion_reverso.png";
const PHASE_ORDER: LocalGameState["phase"][] = [
  "draw_phase",
  "main_phase",
  "battle_phase",
  "end_phase",
];

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
  onHoverStart,
  onHoverEnd,
}: {
  card: CardType;
  onClick: () => void;
  isVisible?: boolean;
  isSelected?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  const totalAtk = card.stats.baseAtk + card.stats.dynamicAtk + card.stats.fixedAtk;
  const totalDef = card.stats.baseDef + card.stats.dynamicDef + card.stats.fixedDef;
  const imageSrc = isVisible ? toImageSrc(card.imagePath) : CARD_BACK_IMAGE;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`card w-24 h-32 cursor-pointer flex flex-col justify-between p-2 hover:scale-105 transition-transform relative overflow-hidden ${
        isSelected ? "ring-2 ring-yellow-300" : ""
      }`}
    >
      <img
        src={imageSrc}
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

function drawOneLocal(player: LocalPlayerState): LocalPlayerState {
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

function firstEmptySlotIndex(slots: BattleSlot[]): number {
  return slots.findIndex((slot) => slot === null);
}

function occupiedCards(slots: BattleSlot[]): CardType[] {
  return slots.filter((slot): slot is CardType => slot !== null);
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
        battleZoneSlots: Array(MAX_BATTLE_SLOTS).fill(null),
        graveyard: [],
        deck: deck1.slice(7),
        lifePoints: 4000,
      },
      p2: {
        id: "p2",
        name: name2,
        hand: deck2.slice(0, 7),
        battleZoneSlots: Array(MAX_BATTLE_SLOTS).fill(null),
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
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<PreviewCardState | null>(null);
  const [isPreviewPinned, setIsPreviewPinned] = useState(false);

  const showPreview = (card: CardType, isVisible: boolean) => {
    if (!isPreviewPinned) {
      setPreviewCard({ card, isVisible });
    }
  };

  const hidePreview = () => {
    if (!isPreviewPinned) {
      setPreviewCard(null);
    }
  };

  const pinPreview = (card: CardType, isVisible: boolean) => {
    setPreviewCard({ card, isVisible });
    setIsPreviewPinned(true);
  };

  const clearPinnedPreview = () => {
    setIsPreviewPinned(false);
    setPreviewCard(null);
  };

  useEffect(() => {
    if (gameMode === "local" || gameMode === "ai") {
      const player1 = window.localStorage.getItem("localPlayer1Name") || "Jugador 1";
      const player2 =
        gameMode === "ai"
          ? "IA"
          : window.localStorage.getItem("localPlayer2Name") || "Jugador 2";

      setLocalState(createInitialLocalState(player1, player2));
      setSelectedCardId(null);
      setActionMessage(null);
      setPreviewCard(null);
      setIsPreviewPinned(false);
    }
  }, [gameMode]);

  const previewPanel = previewCard ? (
    <div className="fixed right-4 top-4 z-50 w-64 card p-3 bg-slate-900/95 border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-200">Vista previa</h4>
        {isPreviewPinned && (
          <button
            className="text-xs text-slate-300 hover:text-white"
            onClick={clearPinnedPreview}
            aria-label="Cerrar vista previa"
          >
            Cerrar
          </button>
        )}
      </div>
      <img
        src={previewCard.isVisible ? toImageSrc(previewCard.card.imagePath) : CARD_BACK_IMAGE}
        alt={previewCard.isVisible ? previewCard.card.name : "Card Back"}
        className="w-full h-80 object-cover rounded mb-2"
      />
      {previewCard.isVisible ? (
        <>
          <div className="text-sm font-bold text-white mb-1">{previewCard.card.name}</div>
          <div className="text-sm text-slate-200">
            ATK: {previewCard.card.stats.baseAtk + previewCard.card.stats.dynamicAtk + previewCard.card.stats.fixedAtk}
          </div>
          <div className="text-sm text-slate-200">
            DEF: {previewCard.card.stats.baseDef + previewCard.card.stats.dynamicDef + previewCard.card.stats.fixedDef}
          </div>
        </>
      ) : (
        <div className="text-sm text-slate-300">Carta oculta</div>
      )}
    </div>
  ) : null;

  const currentLocalPlayerId = localState?.currentPlayer ?? "p1";
  const opponentLocalPlayerId: LocalPlayerId = currentLocalPlayerId === "p1" ? "p2" : "p1";
  const currentPhase = localState?.phase ?? "draw_phase";

  const isHumanTurn = useMemo(() => {
    if (gameMode !== "ai") {
      return true;
    }
    return currentLocalPlayerId === "p1";
  }, [currentLocalPlayerId, gameMode]);

  const canPlayInMainPhase = isHumanTurn && currentPhase === "main_phase";
  const canAttackInBattlePhase = isHumanTurn && currentPhase === "battle_phase";

  const advanceLocalPhase = () => {
    setLocalState((prev) => {
      if (!prev) {
        return prev;
      }

      const phaseIndex = PHASE_ORDER.indexOf(prev.phase);
      const currentPlayer = prev.players[prev.currentPlayer];

      if (prev.phase === "draw_phase") {
        return {
          ...prev,
          phase: "main_phase",
          players: {
            ...prev.players,
            [prev.currentPlayer]: drawOneLocal(currentPlayer),
          },
        };
      }

      if (prev.phase === "end_phase") {
        const nextPlayer: LocalPlayerId = prev.currentPlayer === "p1" ? "p2" : "p1";
        return {
          ...prev,
          currentPlayer: nextPlayer,
          turn: prev.turn + 1,
          phase: "draw_phase",
        };
      }

      return {
        ...prev,
        phase: PHASE_ORDER[Math.min(phaseIndex + 1, PHASE_ORDER.length - 1)],
      };
    });

    setSelectedCardId(null);
    setActionMessage(null);
  };

  const playSelectedCard = () => {
    if (!localState || !selectedCardId || !isHumanTurn) {
      return;
    }

    if (localState.phase !== "main_phase") {
      setActionMessage("Solo puedes jugar cartas durante la Main Phase.");
      return;
    }

    const player = localState.players[currentLocalPlayerId];
    const cardIndex = player.hand.findIndex((card) => card.cardId === selectedCardId);
    if (cardIndex === -1) {
      return;
    }

    const selected = player.hand[cardIndex];
    const newHand = player.hand.filter((card) => card.cardId !== selectedCardId);
    const slotIndex = firstEmptySlotIndex(player.battleZoneSlots);

    if (slotIndex === -1) {
      setActionMessage(`Campo lleno: maximo ${MAX_BATTLE_SLOTS} cartas en batalla.`);
      return;
    }

    const nextSlots = [...player.battleZoneSlots];
    nextSlots[slotIndex] = selected;

    setLocalState({
      ...localState,
      players: {
        ...localState.players,
        [currentLocalPlayerId]: {
          ...player,
          hand: newHand,
          battleZoneSlots: nextSlots,
        },
      },
    });

    setSelectedCardId(null);
    setActionMessage(null);
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

        if (prev.phase === "draw_phase") {
          return {
            ...prev,
            phase: "main_phase",
            players: {
              ...prev.players,
              p2: drawOneLocal(aiPlayer),
            },
          };
        }

        if (prev.phase === "main_phase") {
          const aiHand = [...aiPlayer.hand];
          const aiBattleSlots = [...aiPlayer.battleZoneSlots];
          const slotIndex = firstEmptySlotIndex(aiBattleSlots);

          if (aiHand.length > 0 && slotIndex !== -1) {
            const randomIndex = Math.floor(Math.random() * aiHand.length);
            const [playedCard] = aiHand.splice(randomIndex, 1);
            aiBattleSlots[slotIndex] = playedCard;
          }

          return {
            ...prev,
            phase: "battle_phase",
            players: {
              ...prev.players,
              p2: {
                ...aiPlayer,
                hand: aiHand,
                battleZoneSlots: aiBattleSlots,
              },
            },
          };
        }

        if (prev.phase === "battle_phase") {
          return {
            ...prev,
            phase: "end_phase",
          };
        }

        if (prev.phase === "end_phase") {
          return {
            ...prev,
            currentPlayer: "p1",
            turn: prev.turn + 1,
            phase: "draw_phase",
          };
        }

        return prev;
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
      <>
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
                <CardComponent
                  key={card.cardId}
                  card={card}
                  isVisible={false}
                  onClick={() => pinPreview(card, false)}
                  onHoverStart={() => showPreview(card, false)}
                  onHoverEnd={hidePreview}
                />
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
                <CardComponent
                  key={card.cardId}
                  card={card}
                  isVisible={true}
                  onClick={() => pinPreview(card, true)}
                  onHoverStart={() => showPreview(card, true)}
                  onHoverEnd={hidePreview}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Mano ({currentPlayerState.hand.length}):</h4>
            <div className="flex gap-2 flex-wrap">
              {currentPlayerState.hand.map((card) => (
                <CardComponent
                  key={card.cardId}
                  card={card}
                  isVisible={true}
                  onClick={() => pinPreview(card, true)}
                  onHoverStart={() => showPreview(card, true)}
                  onHoverEnd={hidePreview}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {previewPanel}
      </>
    );
  }

  if (!localState) {
    return <div className="p-6">Preparando partida...</div>;
  }

  const currentPlayerState = localState.players[currentLocalPlayerId];
  const opponentState = localState.players[opponentLocalPlayerId];
  const currentBattleCards = occupiedCards(currentPlayerState.battleZoneSlots);
  const nextPhaseLabel = currentPhase === "end_phase" ? "Finalizar Turno" : "Siguiente Fase";

  return (
    <>
      <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Turno {localState.turn}</h2>
          <p className="text-sm text-slate-400">Fase: {localState.phase.replace("_", " ")}</p>
          <p className="text-sm text-slate-300">
            Juega: {currentPlayerState.name}
            {gameMode === "ai" && !isHumanTurn ? " (IA)" : ""}
          </p>
          <p className="text-xs text-slate-400">Fase activa: {currentPhase.replace("_", " ")}</p>
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
          {opponentState.battleZoneSlots.map((card, index) =>
            card ? (
              <CardComponent
                key={card.cardId}
                card={card}
                isVisible={false}
                onClick={() => pinPreview(card, false)}
                onHoverStart={() => showPreview(card, false)}
                onHoverEnd={hidePreview}
              />
            ) : (
              <div
                key={`op-slot-${index}`}
                className="card w-24 h-32 border border-dashed border-slate-600 opacity-60"
                aria-label={`Slot oponente ${index + 1} vacio`}
              />
            )
          )}
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
          <h4 className="text-sm font-semibold mb-2">
            Cartas en Batalla ({currentBattleCards.length}/{MAX_BATTLE_SLOTS}):
          </h4>
          <div className="flex gap-2 flex-wrap mb-4">
            {currentPlayerState.battleZoneSlots.map((card, index) =>
              card ? (
                <CardComponent
                  key={card.cardId}
                  card={card}
                  isVisible={true}
                  onClick={() => pinPreview(card, true)}
                  onHoverStart={() => showPreview(card, true)}
                  onHoverEnd={hidePreview}
                />
              ) : (
                <div
                  key={`me-slot-${index}`}
                  className="card w-24 h-32 border border-dashed border-slate-600 opacity-60"
                  aria-label={`Tu slot ${index + 1} vacio`}
                />
              )
            )}
          </div>
          {currentBattleCards.length === 0 && (
            <p className="text-xs text-slate-400">Sin cartas en combate</p>
          )}
        </div>

        {actionMessage && <p className="text-sm text-amber-300 mb-2">{actionMessage}</p>}

        {!isHumanTurn && gameMode === "ai" && (
          <p className="text-sm text-indigo-300 mb-2">La IA esta resolviendo su fase...</p>
        )}

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
                  pinPreview(card, true);
                  if (!isHumanTurn) {
                    return;
                  }
                  setSelectedCardId((prev) => (prev === card.cardId ? null : card.cardId));
                }}
                onHoverStart={() => showPreview(card, true)}
                onHoverEnd={hidePreview}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="btn flex-1" onClick={playSelectedCard} disabled={!selectedCardId || !canPlayInMainPhase}>
            📤 Jugar Carta
          </button>
          <button className="btn flex-1" disabled={!canAttackInBattlePhase}>
            ⚔️ Atacar (pronto)
          </button>
          <button className="btn flex-1" onClick={advanceLocalPhase} disabled={!isHumanTurn}>
            ➡️ {nextPhaseLabel}
          </button>
        </div>
      </div>
    </div>
    {previewPanel}
    </>
  );
}

export default GameBoard;
