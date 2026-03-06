# 🎮 Quick Start - StarLight Cards Web

## 📦 Instalación (5 minutos)

### 1️⃣ Instalar dependencias

```powershell
# En la raíz del proyecto
npm install:all
```

> ⏱️ Esto instalará dependencias de backend + frontend

### 2️⃣ Iniciar servidores

```powershell
npm run dev
```

> 🟢 Esto iniciará simultaneamente:
> - Backend WebSocket en **http://localhost:8080**
> - Frontend React en **http://localhost:5173**

### 3️⃣ Abrir navegador

```
👉 http://localhost:5173
```

---

## 🎯 Jugar una Partida

1. **Abre dos navegadores** (o dos pestañas en privado)
2. **Ambos hacen clic en "🎮 Buscar Partida"**
3. **Se conectan automáticamente**
4. ¡**Empieza el juego!** 🚀

---

## 📁 Archivos Importantes

```
backend/
  ├── src/server.ts      ← Lógica del servidor
  ├── src/Game.ts        ← Reglas del juego
  └── src/Card.ts        ← Definición de cartas

frontend/
  ├── src/App.tsx        ← App React
  ├── src/components/    ← UI (GameBoard, MainMenu)
  └── src/store/         ← Estado global (Zustand)

ARCHITECTURE.md          ← Documentación técnica
DEVELOPMENT.md           ← Guía para desarrollar
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia ambos servidores

# Backend solo
cd backend && npm run dev

# Frontend solo
cd frontend && npm run dev

# Compilar para producción
npm run build

# Type-checking
npm run typecheck
```

---

## ⚙️ Solución de Problemas

### Puerto 8080 o 5173 ya en uso

**Opción A:** Cambiar puerto en `backend/src/server.ts`:
```typescript
const PORT = process.env.PORT || 3000; // Cambiar 8080 a 3000
```

**Opción B:** Matar procesos:
```powershell
Get-Process node | Stop-Process -Force
```

### npm install falla

```powershell
# Limpiar caché
npm cache clean --force
rm node_modules -Recurse -Force
npm install:all
```

### WebSocket no conecta

1. ✅ Verificar que backend está corriendo (terminal 1)
2. ✅ Verificar que frontend está corriendo (terminal 2)  
3. ✅ Revisar consola del navegador (F12)
4. ✅ Ver logs en terminal del backend

---

## 📚 Documentación Completa

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura y protocolo
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guía de desarrollo
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Qué cambió de Pygame

---

## 🚀 Próximos Pasos

Una vez todo funcione:

1. ✅ **Leer [DEVELOPMENT.md](./DEVELOPMENT.md)** para agregar interactividad
2. ✅ **Hacer arrastrar cartas** (drag & drop)
3. ✅ **Agregar animaciones** (efectos de ataque)
4. ✅ **Integrar imágenes** de cartas reales

---

## 💡 Tips

- **F12** en navegador para ver logs
- **npm run dev** detecta cambios automáticamente (HMR)
- **Dos navegadores** para ver juego en tiempo real
- **Ctrl+C** para detener servidores

---

**¿Preguntas?** Revisa [DEVELOPMENT.md](./DEVELOPMENT.md) o los archivos en `/src` 🔍

Enjoy! 🎮✨
