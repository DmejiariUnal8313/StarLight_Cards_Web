import { useGameStore } from "../store/gameStore";
import { Card as CardType } from "../types";

function CardComponent({ 
  card, 
  onClick, 
  isVisible = true  // Nuevo parámetro
}: { 
  card: CardType; 
  onClick: () => void;
  isVisible?: boolean;
}) {
  const totalAtk = card.stats.baseAtk + card.stats.dynamicAtk + card.stats.fixedAtk;
  const totalDef = card.stats.baseDef + card.stats.dynamicDef + card.stats.fixedDef;

  // Usar getImagePath si existe, si no usar imagePath
  const imageSrc = card.getImagePath ? card.getImagePath(isVisible) : card.imagePath;

  return (
    <div
      onClick={onClick}
      className="card w-24 h-32 cursor-pointer flex flex-col justify-between p-2 hover:scale-105 transition-transform relative overflow-hidden"
    >
      {/* Imagen de fondo */}
      <img 
        src={imageSrc} 
        alt={isVisible ? card.name : "Card Back"} 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay con info (solo si la carta es visible) */}
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

function GameBoard() {
  const { gameState, playerId } = useGameStore();

  if (!gameState) {
    return <div>Cargando juego...</div>;
  }

  const currentPlayerState = gameState.players[playerId];
  const opponentId = Object.keys(gameState.players).find((id) => id !== playerId);
  const opponentState = opponentId ? gameState.players[opponentId] : null;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Turno {gameState.turn}</h2>
          <p className="text-sm text-slate-400">Fase: {gameState.phase.replace("_", " ")}</p>
        </div>
      </div>

      {/* Tablero de oponente - REVERSO */}
      {opponentState && (
        <div className="card p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{opponentState.name}</h3>
            <div className="text-2xl font-bold text-red-400">{opponentState.lifePoints} LP</div>
          </div>

          <div className="flex gap-2 mb-2">
            <span className="text-xs text-slate-400">
              📚 Mazo: {opponentState.deck.length} cartas
            </span>
            <span className="text-xs text-slate-400">
              📋 Mano: {opponentState.hand.length} cartas
            </span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {opponentState.battleZone.map((card: CardType) => (
              <CardComponent 
                key={card.cardId} 
                card={card} 
                onClick={() => {}}
                isVisible={false} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Zona de batalla central */}
      <div className="flex-1 card p-4 mb-4">
        <h3 className="text-center text-lg font-bold mb-4">Zona de Batalla</h3>
        {/* Aquí iría la lógica de batalla visual */}
        <div className="text-center text-slate-400">Batalla en progreso...</div>
      </div>

      {/* Mi zona - FRONTAL */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">{currentPlayerState.name} (Tú)</h3>
          <div className="text-2xl font-bold text-green-400">{currentPlayerState.lifePoints} LP</div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Cartas en Batalla:</h4>
          <div className="flex gap-2 flex-wrap mb-4">
            {currentPlayerState.battleZone.map((card: CardType) => (
              <CardComponent 
                key={card.cardId} 
                card={card} 
                onClick={() => {}}
                isVisible={true}  
              />
            ))}
          </div>
          {currentPlayerState.battleZone.length === 0 && (
            <p className="text-xs text-slate-400">Sin cartas en combate</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Mano ({currentPlayerState.hand.length}):</h4>
          <div className="flex gap-2 flex-wrap">
            {currentPlayerState.hand.map((card: CardType) => (
              <CardComponent
                key={card.cardId}
                card={card}
                onClick={() => {
                  console.log("Jugar:", card.name);
                }}
                isVisible={true}  
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="btn flex-1">📤 Jugar Carta</button>
          <button className="btn flex-1">⚔️ Atacar</button>
          <button className="btn flex-1">➡️ Siguiente Fase</button>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
