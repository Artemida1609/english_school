import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

export interface Message {
  id: string;
  text: string;
  mine: boolean;
  time: string;
  userId?: string;
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
  message: string; // бекенд повертає "message" а не "text"
  userId: string; // бекенд повертає "user_id" а не "userId"
  roomId: string;
  createdAt: string;
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

const API_URL = import.meta.env.DEV 
  ? ""  // ← локально: відносний URL, проксіюється через vite
  : (import.meta.env.VITE_API_URL ?? "https://english-school-1izu.onrender.com");


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
      const token = localStorage.getItem("accessToken");
      console.log("TOKEN:", token); // ← подивись що виводить

      const res = await fetch(`${API_URL}/api/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok)
        return rejectWithValue(json.message ?? "Failed to fetch rooms");
      return json as ServerRoom[];
    } catch {
      return rejectWithValue("Failed to fetch rooms");
    }
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok)
        return rejectWithValue(json.message ?? "Failed to fetch messages");
      return { roomId, messages: json as ServerMessage[] };
    } catch {
      return rejectWithValue("Failed to fetch messages");
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
        // перетворюємо ServerMessage → Message
        state.messages[action.payload.roomId] = action.payload.messages.map(
          (m) => ({
            id: m.id,
            text: m.message, // "message" → "text"
            mine: false, // визначається в компоненті через currentUser
            time: new Date(m.createdAt).toLocaleTimeString("uk", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            userId: m.user?.id ?? m.userId, // "user_id" → "userId"
          }),
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
