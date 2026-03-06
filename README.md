# 🎮 StarLight Cards - Versión Web

**Juego de Cartas Cooperativo 1v1 en Navegador**

Arquitectura web moderna con **React + TypeScript + WebSocket P2P**. Versión web completamente migrada desde Pygame.

✨ **Características**:
- ♻️ Lógica de juego traducida de Python a TypeScript
- 🌐 Multiplayer P2P con WebSocket
- ⚛️ Frontend con React 18 + TailwindCSS
- 🔌 Backend con Node.js + Express
- 🎨 Interfaz moderna y responsiva
- ⚡ Actualizaciones en tiempo real

## 📁 Ubicación

```
D:\VSCode\
  ├── LinVT_StarLight_Cards/        ← Proyecto Python original
  └── StarLight_Cards_Web/          ← 👉 Este proyecto (Web)
```

## 📋 Estructura

```
backend/
  ├── src/
  │   ├── server.ts      (Servidor WebSocket)
  │   ├── Game.ts        (Lógica del juego)
  │   ├── Card.ts        (Sistema de cartas)
  │   └── types.ts       (Tipos TypeScript)
  └── package.json

frontend/
  ├── src/
  │   ├── App.tsx        (App principal)
  │   ├── components/    (GameBoard, MainMenu)
  │   ├── store/         (Zustand state)
  │   └── types.ts
  └── package.json

📚 Documentación:
  ├── QUICKSTART.md       (Inicio rápido)
  ├── ARCHITECTURE.md     (Diseño detallado)
  ├── DEVELOPMENT.md      (Guía desarrollo)
  └── MIGRATION_SUMMARY   (Cambios vs Pygame)
```

## 🚀 Quick Start (3 pasos)

### 1. Instalar Dependencias
```powershell
npm install:all
```

### 2. Iniciar Servidores
```powershell
npm run dev
```

Esto abre:
- **Frontend:** http://localhost:5173
- **Backend WebSocket:** ws://localhost:8080

### 3. ¡Juega!
- Abre 2 navegadores (o 2 pestañas en privado)
- Ambos hacen clic en "🎮 Buscar Partida"
- ¡Se conectan automáticamente! 🎉

## 📚 Documentación

| Archivo | Para qué |
|---------|----------|
| **[QUICKSTART.md](./QUICKSTART.md)** | 👉 **Comienza aquí** |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Protocolo WebSocket + Diseño |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Agregar funcionalidades |
| **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** | Cambios de Pygame |

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Backend + Frontend

# Individualidad
cd backend && npm run dev
cd frontend && npm run dev

# Compilar
npm run build

# Type-checking
npm run typecheck
```

## 🎮 Mecánicas

- **4 Fases:** Draw → Main → Battle → End
- **7 Cartas:** Diferentes stats (ATK/DEF)
- **Daño:** ATK - DEF
- **Victoria:** LP oponen ≤ 0

## 🚀 Próximos Pasos

- [ ] Drag & drop de cartas
- [ ] Animaciones
- [ ] Chat en vivo
- [ ] Base de datos (persistencia)
- [ ] Autenticación
- [ ] Sistema de ranking

## 📖 Referencia

- Proyecto original: [../LinVT_StarLight_Cards/](../LinVT_StarLight_Cards/)
- Código Python: [../LinVT_StarLight_Cards/src/](../LinVT_StarLight_Cards/src/)

---

**Status:** Listo para desarrollo 🟢

¿Preguntas? Lee [QUICKSTART.md](./QUICKSTART.md) o [DEVELOPMENT.md](./DEVELOPMENT.md)
