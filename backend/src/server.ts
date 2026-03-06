import express from "express";
import { Server, createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { Game } from "./Game";
import { GameMessage, PlayerMove } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

const server: Server = createServer(app);
const wss = new WebSocketServer({ server });

// Almacenamiento de salas de juego
interface GameRoom {
  id: string;
  game: Game;
  players: { [playerId: string]: WebSocket };
  status: "waiting" | "in_progress" | "finished";
}

const gameRooms: Map<string, GameRoom> = new Map();
const playerToRoom: Map<WebSocket, string> = new Map();

// Generar ID único
const generateId = () => Math.random().toString(36).substring(2, 11);

// Broadcast a ambos jugadores
const broadcastToRoom = (roomId: string, message: GameMessage) => {
  const room = gameRooms.get(roomId);
  if (room) {
    Object.values(room.players).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
};

// Conexión WebSocket
wss.on("connection", (ws: WebSocket) => {
  console.log("Nuevo cliente conectado");

  ws.on("message", (data: Buffer) => {
    try {
      const message: GameMessage = JSON.parse(data.toString());
      const roomId = playerToRoom.get(ws);

      if (message.type === "join") {
        handleJoin(ws, message);
      } else if (roomId && gameRooms.has(roomId)) {
        handleGameMessage(ws, roomId, message);
      }
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      ws.send(JSON.stringify({ type: "error", message: "Error procesando mensaje" }));
    }
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
    const roomId = playerToRoom.get(ws);
    if (roomId) {
      const room = gameRooms.get(roomId);
      if (room) {
        // Notificar al otro jugador
        broadcastToRoom(roomId, {
          type: "error",
          playerId: "",
          message: "El otro jugador se desconectó",
        });
        gameRooms.delete(roomId);
      }
      playerToRoom.delete(ws);
    }
  });

  ws.on("error", (error) => {
    console.error("Error WebSocket:", error);
  });
});

function handleJoin(ws: WebSocket, message: GameMessage) {
  const playerId = message.playerId || generateId();
  const existingRoom = Array.from(gameRooms.values()).find(
    (room) => room.status === "waiting" && Object.keys(room.players).length === 1
  );

  let roomId: string;
  let room: GameRoom;

  if (existingRoom) {
    // Unirse a sala existente
    roomId = existingRoom.id;
    room = existingRoom;
    room.players[playerId] = ws;
    room.status = "in_progress";

    // Inicializar juego
    const playerIds = Object.keys(room.players);
    room.game = new Game(playerIds[0], playerIds[1]);

    // Repartir cartas iniciales (5 cartas)
    playerIds.forEach((pId) => {
      for (let i = 0; i < 5; i++) {
        room.game.drawCard(pId);
      }
    });

    // Notificar a ambos jugadores
    broadcastToRoom(roomId, {
      type: "game_state",
      playerId: "",
      data: {
        gameState: room.game.getGameState(),
        message: `¡Juego iniciado! Jugadores: ${playerIds.join(" vs ")}`,
      },
    });
  } else {
    // Crear nueva sala
    roomId = generateId();
    room = {
      id: roomId,
      game: new Game(playerId, "pending"),
      players: { [playerId]: ws },
      status: "waiting",
    };
    gameRooms.set(roomId, room);
  }

  playerToRoom.set(ws, roomId);

  ws.send(
    JSON.stringify({
      type: "join",
      playerId,
      data: { roomId, status: room.status },
    })
  );

  console.log(`Jugador ${playerId} en sala ${roomId}`);
}

function handleGameMessage(ws: WebSocket, roomId: string, message: GameMessage) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const playerId = message.playerId;
  const move: PlayerMove = message.data;

  switch (move.type) {
    case "play_card":
      if (move.cardId) {
        room.game.playCard(playerId, move.cardId);
      }
      break;

    case "attack":
      if (move.cardId && move.targetCardId) {
        room.game.attack(playerId, move.cardId, move.targetCardId);
      }
      break;

    case "next_phase":
      room.game.endTurn(playerId);
      break;

    case "surrender":
      room.status = "finished";
      break;
  }

  // Enviar estado actualizado
  broadcastToRoom(roomId, {
    type: "game_state",
    playerId: "",
    data: {
      gameState: room.game.getGameState(),
      gameOver: room.game.isGameOver(),
      winner: room.game.getWinner(),
    },
  });
}

// Rutas HTTP
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/rooms", (req, res) => {
  const rooms = Array.from(gameRooms.values()).map((room) => ({
    id: room.id,
    status: room.status,
    players: Object.keys(room.players).length,
  }));
  res.json(rooms);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🎮 Servidor WebSocket ejecutándose en puerto ${PORT}`);
});
