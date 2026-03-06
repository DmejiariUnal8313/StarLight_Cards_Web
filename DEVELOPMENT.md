# 🛠️ Guía de Desarrollo - StarLight Cards Web

## 🎯 Checklist de Funcionalidades

### ✅ Core Implementado
- [x] WebSocket P2P bidireccional
- [x] Matchmaking automático
- [x] Lógica de juego (4 fases)
- [x] Sistema de cartas (7 cartas base)
- [x] Cálculo de daño/defensa
- [x] UI básica con React

### 📋 TODO: Próxima Fase

#### 1. **Interactividad de Juego** (Prioridad Alta)
```typescript
// En frontend/src/components/GameBoard.tsx
// TODO: Implementar estos handlers

const handlePlayCard = (cardId: string) => {
  // 1. Validar que es turno del jugador
  // 2. Validar que es main_phase o battle_phase
  // 3. Enviar play_card mensaje al servidor
  // 4. Actualizar estado local
}

const handleAttack = (attackerId: string, defenderId: string) => {
  // 1. Validar que es battle_phase
  // 2. Validar que el atacante existe en battleZone
  // 3. Calcular daño (delegado al servidor)
  // 4. Animar ataque
}

const handleNextPhase = () => {
  // 1. Enviar next_phase al servidor
  // 2. Servidor cambia fase
  // 3. Si es end_phase, cambiar jugador
}
```

#### 2. **Renderizado de Cartas**
```typescript
// TODO: Mejorar CardComponent en frontend/src/components/

// Opciones:
// A. Usar Canvas (Pixi.js) para renderizado 2D
// B. Usar SVG para animaciones vectoriales
// C. Usar imágenes reales + CSS transforms

// Recomendación: Opción B (SVG) por simplicidad
```

#### 3. **Animaciones**
```typescript
// TODO: Agregar Framer Motion o react-spring

// Animaciones críticas:
// 1. Cartas volando del mazo a la mano
// 2. Cartas moviéndose a batalla
// 3. Efecto de impacto en ataque
// 4. Transición de fases
```

#### 4. **Persistencia de Datos**
```typescript
// Backend: Agregar base de datos

// Opciones:
// - MongoDB (cloud: MongoDB Atlas)
// - PostgreSQL (cloud: Railway)
// - SQLite (local/desarrollo)

// Modelos:
// - User { id, name, avatar, stats }
// - GameRecord { player1, player2, winner, date }
// - Cards { stats, history }
```

#### 5. **Autenticación**
```typescript
// Backend: Agregar JWT
// Frontend: usar AuthContext

// Flow:
// 1. Registro/Login
// 2. JWT token en localStorage
// 3. Incluir en cada mensaje WebSocket
// 4. Validar en servidor
```

---

## 🔧 Guías Rápidas

### Agregar una Nueva Carta

**Backend (`backend/src/Card.ts`):**
```typescript
export const CARDS_INFO: CardInfo[] = [
  // ... cartas existentes ...
  {
    name: "NuevaCartaX",
    imagePath: "assets/cards/Carta_8.jpg",
    baseAtk: 750,
    baseDef: 250,
  },
];
```

**Asset:**
```bash
# Copiar imagen a assets/cards/Carta_8.jpg
```

### Cambiar Mecánica de Daño

**Backend (`backend/src/Game.ts`):**
```typescript
private calculateDamage(atk: number, def: number): number {
  // Actual: Math.max(0, atk - def)
  
  // Cambio: Daño crítico 10% probabilidad
  const isCrit = Math.random() < 0.1;
  const baseDamage = Math.max(0, atk - def);
  return isCrit ? baseDamage * 2 : baseDamage;
}
```

### Agregar Chat

**Backend (`backend/src/server.ts`):**
```typescript
if (message.type === "chat") {
  const room = gameRooms.get(roomId);
  broadcastToRoom(roomId, {
    type: "chat",
    playerId: message.playerId,
    data: { text: message.data.text, timestamp: Date.now() }
  });
}
```

**Frontend (new component `Chat.tsx`):**
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);

const sendMessage = (text: string) => {
  ws.send(JSON.stringify({
    type: "chat",
    playerId,
    data: { text }
  }));
};
```

---

## 🧪 Testing

### Backend Testing

```bash
# Instalar dependencias
cd backend
npm install --save-dev jest @types/jest ts-jest

# Crear test
# backend/src/Game.test.ts
```

**Ejemplo:**
```typescript
import { Game } from "./Game";

describe("Game", () => {
  it("should decrease opponent LP on attack", () => {
    const game = new Game("p1", "p2");
    // ... setup
    game.attack("p1", "card1", "card2");
    // ... expect
  });
});
```

### Frontend Testing

```bash
cd frontend
npm install --save-dev vitest @testing-library/react

# En src/components/GameBoard.test.tsx
```

---

## 📡 Debugging WebSocket

### Ver mensajes en tiempo real

**Browser DevTools (F12):**
```javascript
// En consola:
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Ver en backend

**En `backend/src/server.ts`:**
```typescript
ws.on("message", (data: Buffer) => {
  const message = JSON.parse(data.toString());
  console.log("📨 Mensaje recibido:", message); // ← Agregar esto
  // ... resto
});
```

---

## 🚀 Deployment Checklist

### Before Deploy
- [ ] TypeScript stricta sin errores
- [ ] Tests pasando
- [ ] Variables de entorno configuradas
- [ ] CORS habilitado correctamente
- [ ] WebSocket URL actualizada

### Frontend (Vercel)
```bash
# 1. Push a GitHub
# 2. Conectar a Vercel
# 3. Build command: npm run build
# 4. Output: frontend/dist
# 5. Environment: VITE_API_URL=wss://...
```

### Backend (Railway/Fly)
```bash
# 1. Crear Dockerfile
# 2. Push a GitHub
# 3. Deploy desde platform
# 4. Environment: PORT, NODE_ENV
```

---

## 📚 Recursos Útiles

**React:**
- https://react.dev (docs oficial)
- Zustand: https://github.com/pmndrs/zustand

**WebSocket:**
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- ws library: https://github.com/websockets/ws

**TypeScript:**
- https://www.typescriptlang.org/docs/

**TailwindCSS:**
- https://tailwindcss.com/docs

---

## 💡 Tips de Desarrollo

1. **HMR rápido**: Vite tiene Hot Module Replacement integrado
2. **DevTools**: Instala React DevTools Extension para mejor debugging
3. **Logging**: Usa `console.log` durante desarrollo, cambia a logger en producción
4. **Git**: Haz commits frecuentes
5. **Branching**: Usa `feature/` para nuevas funciones

---

## ❓ Preguntas Frecuentes

**P: ¿Cómo agrego más de 2 jugadores?**
A: Cambiar lógica de rooms en backend para permitir 3+ jugadores y ajustar turnos.

**P: ¿Cómo hago salas privadas?**
A: Agregar password/code a la sala y verificar en `handleJoin`.

**P: ¿Puedo usar la app sin servidor?**
A: No, P2P requiere sincronización. Podría hacerse local-storage only en single-player.

**P: ¿Cómo escalo a 1000+ jugadores?**
A: Usar clustering de Node.js + Redis para estado distribuido.

---

**Última actualización:** 6 de marzo de 2026  
**Status:** Listo para desarrollo 🚀
