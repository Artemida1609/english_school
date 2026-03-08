import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // твій Vite порт
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Приєднатись до кімнати чату
  socket.on("join_chat", (chatId: number) => {
    socket.join(`chat_${chatId}`);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Отримати і розіслати повідомлення
  socket.on("send_message", (data: {
    chatId: number;
    text: string;
    userId: string;
    time: string;
  }) => {
    // Розіслати всім в кімнаті крім відправника
    socket.to(`chat_${data.chatId}`).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on port 3001");
});