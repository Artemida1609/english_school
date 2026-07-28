import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { chatApi, type ChatRoomDto } from "../api/chat";

export interface Message {
  id: string;
  text: string;
  mine: boolean;
  time: string;
  userId?: string;
  userName?: string;
}

export interface Room {
  id: string;
  name: string;
  type: "PRIVATE" | "GROUP" | "PUBLIC" | string;
  subtitle?: string;
  icon: string;
  bg: string;
  lastMessage?: string;
  time?: string;
  unread: number;
  online: boolean;
  members: Array<{ id: string; name: string; email: string; role: string }>;
  memberCount: number;
}

interface ChatState {
  rooms: Room[];
  messages: Record<string, Message[]>;
  roomsLoading: boolean;
  messagesLoading: boolean;
  creatingRoom: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  messages: {},
  roomsLoading: false,
  messagesLoading: false,
  creatingRoom: false,
  error: null,
};

const ROOM_STYLES: Record<string, { icon: string; bg: string; subtitle: string }> = {
  PRIVATE: {
    icon: "💬",
    bg: "from-emerald-400 to-teal-500",
    subtitle: "Приватний чат",
  },
  GROUP: {
    icon: "👥",
    bg: "from-violet-400 to-purple-500",
    subtitle: "Група",
  },
  PUBLIC: {
    icon: "🌐",
    bg: "from-sky-400 to-blue-500",
    subtitle: "Публічний чат",
  },
};

function mapServerRoom(r: ChatRoomDto): Room {
  const style = ROOM_STYLES[r.type] ?? ROOM_STYLES.GROUP;
  const time = r.lastMessageAt
    ? new Date(r.lastMessageAt).toLocaleTimeString("uk", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    subtitle:
      r.type === "PRIVATE"
        ? r.members.find((m) => m.role === "TEACHER" || m.role === "ADMIN")?.email
          ?? style.subtitle
        : `${r.memberCount || r.members.length} учасників`,
    icon: style.icon,
    bg: style.bg,
    lastMessage: r.lastMessage || "",
    time,
    unread: 0,
    online: r.type === "PRIVATE",
    members: r.members ?? [],
    memberCount: r.memberCount ?? r.members?.length ?? 0,
  };
}

export const fetchRooms = createAsyncThunk(
  "chat/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      return await chatApi.getRooms();
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to fetch rooms");
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const messages = await chatApi.getMessages(roomId);
      return { roomId, messages };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to fetch messages");
    }
  },
);

export const createChatRoom = createAsyncThunk(
  "chat/createRoom",
  async (
    body: Parameters<typeof chatApi.createRoom>[0],
    { rejectWithValue },
  ) => {
    try {
      return await chatApi.createRoom(body);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to create room");
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(
      state,
      action: PayloadAction<{ roomId: string; message: Message }>,
    ) {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) state.messages[roomId] = [];
      if (state.messages[roomId].some((m) => m.id === message.id)) return;
      state.messages[roomId].push(message);

      const room = state.rooms.find((r) => r.id === roomId);
      if (room) {
        room.lastMessage = message.text;
        room.time = message.time;
        if (!message.mine) room.unread += 1;
      }
    },
    clearUnread(state, action: PayloadAction<string>) {
      const room = state.rooms.find((r) => r.id === action.payload);
      if (room) room.unread = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.roomsLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.roomsLoading = false;
        const prevUnread = new Map(state.rooms.map((r) => [r.id, r.unread]));
        state.rooms = action.payload.map((r) => {
          const mapped = mapServerRoom(r);
          mapped.unread = prevUnread.get(r.id) ?? 0;
          return mapped;
        });
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.roomsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages[action.payload.roomId] = action.payload.messages.map((m) => {
          const created = (m as { createdAt?: string; created_at?: string }).createdAt
            ?? (m as { created_at?: string }).created_at
            ?? Date.now();
          const timeString = new Date(created).toLocaleTimeString("uk", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            id: m.id,
            text: m.message || "",
            mine: false,
            time: timeString === "Invalid Date" ? "" : timeString,
            userId: m.user?.id || m.userId,
            userName: m.user?.name || "Unknown",
          };
        });
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createChatRoom.pending, (state) => {
        state.creatingRoom = true;
        state.error = null;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.creatingRoom = false;
        const mapped = mapServerRoom(action.payload);
        const idx = state.rooms.findIndex((r) => r.id === mapped.id);
        if (idx >= 0) state.rooms[idx] = { ...mapped, unread: state.rooms[idx].unread };
        else state.rooms.unshift(mapped);
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.creatingRoom = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearUnread } = chatSlice.actions;
export default chatSlice.reducer;
