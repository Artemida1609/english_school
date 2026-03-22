import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { apiFetch } from "../api/client";

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
  subtitle?: string;
  icon: string;
  bg: string;
  lastMessage?: string;
  time?: string;
  unread: number;
  online: boolean;
}

interface ServerMessage {
  id: string;
  message: string;
  user_id: string;
  room_id: string;
  created_at: string;
  user?: { id: string; name?: string };
}

interface ServerRoom {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface ChatState {
  rooms: Room[];
  messages: Record<string, Message[]>;
  roomsLoading: boolean;
  messagesLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: [],
  messages: {},
  roomsLoading: false,
  messagesLoading: false,
  error: null,
};

// const API_URL = import.meta.env.DEV 
//   ? ""  // ← локально: відносний URL, проксіюється через vite
//   : (import.meta.env.VITE_API_URL ?? "https://english-school-1izu.onrender.com");

// const API_URL = "";


// іконки та кольори для кімнат
const ROOM_STYLES: Record<
  string,
  { icon: string; bg: string; subtitle: string }
> = {
  PRIVATE: {
    icon: "👩‍🏫",
    bg: "from-emerald-400 to-teal-500",
    subtitle: "Твій особистий вчитель",
  },
  GROUP: {
    icon: "👥",
    bg: "from-violet-400 to-purple-500",
    subtitle: "Спільнота студентів",
  },
};

export const fetchRooms = createAsyncThunk(
  "chat/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<ServerRoom[]>("/api/chat/rooms");
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to fetch rooms");
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const messages = await apiFetch<ServerMessage[]>(`/api/chat/rooms/${roomId}/messages`);
      return { roomId, messages };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to fetch messages");
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
        // перетворюємо ServerRoom → Room
        state.rooms = action.payload.map((r) => {
          const style = ROOM_STYLES[r.type] ?? ROOM_STYLES.GROUP;
          return {
            id: r.id,
            name: r.name,
            subtitle: style.subtitle,
            icon: style.icon,
            bg: style.bg,
            lastMessage: "",
            time: "",
            unread: 0,
            online: r.type === "PRIVATE",
          };
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
        state.messages[action.payload.roomId] = action.payload.messages.map(
          (m: any) => {
            const timeString = new Date(m.created_at || m.createdAt || Date.now()).toLocaleTimeString("uk", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const actualUserId = m.user?.id || m.user_id || m.userId;
            
            return {
              id: m.id,
              text: m.message || m.text || "",
              mine: false, // determined in component via currentUser
              time: timeString === "Invalid Date" ? "" : timeString,
              userId: actualUserId,
              userName: m.user?.name || "Unknown",
            };
          }
        );
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearUnread } = chatSlice.actions;
export default chatSlice.reducer;
