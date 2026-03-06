import { create } from "zustand";

interface WebSocketStore {
  ws: WebSocket | null;
  connect: (url: string) => void;
  disconnect: () => void;
  send: (message: any) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  ws: null,
  connect: (url) => {
    const ws = new WebSocket(url);
    set({ ws });
  },
  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null });
    }
  },
  send: (message) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  },
}));
