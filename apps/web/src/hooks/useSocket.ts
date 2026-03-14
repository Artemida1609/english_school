import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
type MessagePayload = {
  text: string;
  userId?: string;
  time?: string;
  mine?: boolean;
  userName: string,
};

// const SOCKET_URL =
//   import.meta.env.VITE_API_URL ?? "https://english-school-1izu.onrender.com";
// const SOCKET_URL = "";

const SOCKET_URL = import.meta.env.VITE_API_URL ?? "https://english-school-1izu.onrender.com";


export const useSocket = (roomId: string | number) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef<((data: MessagePayload) => void) | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // ← виправлено
    console.log("SOCKET URL:", SOCKET_URL); // ← лог для перевірки
    console.log("SOCKET TOKEN:", token); // ← лог для перевірки
    if (!token || !roomId) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket", "polling"], // ← додай
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED ✅");
      setIsConnected(true);
      socket.emit("join_room", String(roomId));
    });

    socket.on("connect_error", (err) => {
      console.log("SOCKET ERROR:", err.message); // ← покаже причину
      setIsConnected(false);
    });

    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED");
      setIsConnected(false);
    });

    socket.on(
      "receive_message",
      (data: {
        id: string;
        message: string;
        createdAt: string;
        user: { id: string; name: string };
      }) => {
        callbackRef.current?.({
          text: data.message,
          userId: data.user?.id,
          userName: data.user?.name,
          time: new Date(data.createdAt).toLocaleTimeString("uk", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      },
    );

    return () => {
      socket.emit("leave_room", String(roomId));
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text: string) => {
      console.log("SENDING:", { roomId: String(roomId), message: text });
      socketRef.current?.emit("send_message", {
        roomId: String(roomId),
        message: text,
      });
    },
    [roomId],
  );

  const onMessage = useCallback((callback: (data: MessagePayload) => void) => {
    callbackRef.current = callback;
  }, []);

  return { isConnected, sendMessage, onMessage };
};
