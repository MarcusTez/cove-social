import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getApiUrl, getAccessToken } from "@/lib/query-client";

let socketInstance: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  const baseUrl = getApiUrl();
  const token = getAccessToken();

  socketInstance = io(baseUrl, {
    path: "/socket.io",
    auth: { token },
    transports: ["polling", "websocket"],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socketInstance.on("connect", () => {
    console.log("Socket connected");
    notifyListeners();
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socketInstance.on("connect_error", (error) => {
    console.log("Socket connection error:", error.message);
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    notifyListeners();
  }
}

export function getSocket(): Socket | null {
  return socketInstance;
}

type SocketListener = (socket: Socket | null) => void;
const listeners = new Set<SocketListener>();

function notifyListeners() {
  listeners.forEach((fn) => fn(socketInstance));
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    setSocket(socketInstance);
    listeners.add(setSocket);
    return () => {
      listeners.delete(setSocket);
    };
  }, []);

  return socket;
}

export function generateClientMessageId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
