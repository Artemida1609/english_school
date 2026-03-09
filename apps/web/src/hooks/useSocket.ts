import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const useSocket = (chatId: number) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      // Приєднатись до кімнати
      socketRef.current?.emit("join_chat", chatId);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId]);

  const sendMessage = (text: string) => {
    socketRef.current?.emit("send_message", {
      chatId,
      text,
      userId: "current_user_id",
      time: new Date().toLocaleTimeString("uk", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const onMessage = (callback: (data: {
    text: string;
    userId: string;
    time: string;
  }) => void) => {
    socketRef.current?.on("receive_message", callback);
  };

  return { isConnected, sendMessage, onMessage };
};