import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import prisma from "./prisma";

const app = express();
const httpServer = createServer(app);

// Простий health-check, щоб перевірити підключення до бекенда і БД
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error" });
  }
});

// Отримати останні 50 повідомлень (для тесту читання з БД)
app.get("/messages", async (_req, res) => {
  try {
    const messages = await prisma.messages.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
    });
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

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

  // Отримати і розіслати повідомлення + зберегти в БД
  socket.on(
    "send_message",
    async (data: {
      chatId: number;
      text: string;
      userId: string;
      time: string;
    }) => {
      const chatIdStr = String(data.chatId);
      const now = new Date();

      // Автоматичне створення (або знаходження) користувача
      await prisma.users.upsert({
        where: { id: data.userId },
        update: {},
        create: {
          id: data.userId,
          email: `${data.userId}@placeholder.local`,
          password_hash: "",
          name: `User ${data.userId}`,
          updated_at: now,
        },
      });

      // Автоматичне створення (або знаходження) чату
      await prisma.chat_rooms.upsert({
        where: { id: chatIdStr },
        update: {},
        create: {
          id: chatIdStr,
          name: `Chat ${chatIdStr}`,
          type: "PUBLIC",
        },
      });

      // Зберегти повідомлення в БД
      await prisma.messages.create({
        data: {
          id: crypto.randomUUID(),
          room_id: chatIdStr,
          user_id: data.userId,
          message: data.text,
        },
      });

      // Розіслати всім в кімнаті крім відправника
      socket.to(`chat_${data.chatId}`).emit("receive_message", data);
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});