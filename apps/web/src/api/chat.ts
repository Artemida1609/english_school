import { apiFetch } from "./client";

export type ChatUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN" | string;
};

export type ChatRoomMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ChatRoomDto = {
  id: string;
  name: string;
  type: "PRIVATE" | "GROUP" | "PUBLIC" | string;
  createdAt: string;
  members: ChatRoomMember[];
  memberCount: number;
  lastMessage?: string;
  lastMessageAt?: string | null;
  messageCount?: number;
};

export type CreateChatRoomBody =
  | { type: "PRIVATE"; memberIds: string[] }
  | { type: "GROUP"; name: string; memberIds: string[] };

export const chatApi = {
  getUsers: () => apiFetch<ChatUser[]>("/api/chat/users"),
  getRooms: () => apiFetch<ChatRoomDto[]>("/api/chat/rooms"),
  getMessages: (roomId: string) =>
    apiFetch<
      Array<{
        id: string;
        message: string;
        createdAt: string;
        user?: { id: string; name?: string };
        userId?: string;
      }>
    >(`/api/chat/rooms/${roomId}/messages`),
  createRoom: (body: CreateChatRoomBody) =>
    apiFetch<ChatRoomDto>("/api/chat/rooms", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
