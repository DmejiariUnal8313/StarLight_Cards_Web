# Arquitectura Web - StarLight Cards

## 📂 Estructura del Proyecto

```
LinVT_StarLight_Cards/
├── backend/                 # Servidor WebSocket (Node.js + Express)
│   ├── src/
│   │   ├── server.ts       # Servidor principal
│   │   ├── Game.ts         # Lógica del juego
│   │   ├── Card.ts         # Definición de cartas
│   │   └── types.ts        # Tipos TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
│
├── frontend/                # App React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── store/          # Estado (Zustand)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── types.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── package.json
│   └── .gitignore
│
├── assets/                  # Recursos (imágenes de cartas)
├── src/                    # Código Python original
├── README.md
└── requirements.txt
```

## 🚀 Instalación Rápida

### Backend

```bash
cd backend
npm install
npm run dev         # Desarrollo
npm run build      # Compilar
npm start          # Producción
```

**Servidor en:** `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev        # Desarrollo
npm run build      # Compilar
npm run preview    # Preview de producción
```

**App en:** `http://localhost:5173`

## 🎮 Flujo del Juego

1. **Conexión**: Jugadores se conectan via WebSocket
2. **Matchmaking**: El sistema busca un oponente
3. **Setup**: Se distribuyen 5 cartas iniciales a cada jugador
4. **Fases de Turno**:
   - `draw_phase`: Robar una carta
   - `main_phase`: Jugar cartas
   - `battle_phase`: Atacar
   - `end_phase`: Finalizar turno

5. **Condición de Victoria**: Reducir LP del oponente a 0

## 🔌 Protocolo WebSocket

### Mensajes Cliente → Servidor

```json
{
  "type": "join",
  "playerId": "abc123",
  "data": { "name": "Jugador1" }
}
```

```json
{
  "type": "play_card",
  "playerId": "abc123",
  "data": {
    "type": "play_card",
    "cardId": "card-001"
  }
}
```

```json
{
  "type": "attack",
  "playerId": "abc123",
  "data": {
    "type": "attack",
    "cardId": "attacker-001",
    "targetCardId": "defender-001"
  }
}
```

### Mensajes Servidor → Cliente

```json
{
  "type": "game_state",
  "playerId": "",
  "data": {
    "gameState": { /* Estado completo del juego */ },
    "gameOver": false,
    "winner": null
  }
}
```

## 📋 Próximos Pasos

- [ ] Integrar sistema de cartas con imágenes
- [ ] Formulario interactivo para jugar cartas
- [ ] Animaciones de ataque
- [ ] Chat en vivo
- [ ] Sistema de salas privadas
- [ ] Persistencia de datos (BD)
- [ ] Autenticación (JWT)
- [ ] Despliegue (Heroku/Vercel/AWS)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Zustand
- **Backend**: Node.js + Express + WebSocket + TypeScript
- **Comunicación**: WebSocket (P2P)
- **Styling**: TailwindCSS

## ⚙️ Configuración de Desarrollo

### Variables de Entorno

**Backend (.env)**:
```
PORT=8080
NODE_ENV=development
```

**Frontend (.env)**:
```
VITE_API_URL=ws://localhost:8080
```

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Port 8080 ya en uso
```bash
# Cambiar puerto en backend/src/server.ts
const PORT = process.env.PORT || 3000;
```

### WebSocket no conecta
- Verificar que backend esté corriendo
- Verificar CORS en backend
- Revisar consola del navegador (F12)

---

*Migración desde Pygame completada* ✅
