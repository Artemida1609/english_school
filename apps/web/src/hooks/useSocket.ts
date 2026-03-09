import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "");

export const useSocket = (roomId: string | number) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!SOCKET_URL || !token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_room", String(roomId));
    });

    socket.on("connect_error", () => setIsConnected(false));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = (text: string) => {
    socketRef.current?.emit("send_message", {
      roomId: String(roomId),
      message: text,
    });
  };

  const onMessage = (callback: (data: { text: string; userId?: string; time?: string }) => void) => {
    socketRef.current?.on("receive_message", (data: { message?: string; text?: string; user?: { id: string }; userId?: string; createdAt?: string }) => {
      callback({
        text: data.message ?? data.text ?? "",
        userId: data.user?.id ?? data.userId,
        time: data.createdAt ? new Date(data.createdAt).toLocaleTimeString("uk", { hour: "2-digit", minute: "2-digit" }) : undefined,
      });
    });
  };

  return { isConnected, sendMessage, onMessage };
};