import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// const API_URL = import.meta.env.DEV 
//   ? ""  // ← локально: відносний URL, проксіюється через vite
//   : (import.meta.env.VITE_API_URL ?? "https://english-school-1izu.onrender.com");

const API_URL = "";

interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

interface AuthPayload {
  user: User;
  token: string;
  refreshToken: string;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  avatar: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") ?? "null"),
  token: localStorage.getItem("accessToken"),
  loading: false,
  error: null,
  avatar: localStorage.getItem("avatar") ?? null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Login failed");
      }
      const json = await res.json();

      let avatar: string | null = null;
      try {
        const profileRes = await fetch(`${API_URL}/api/profile/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${json.accessToken}`,
          },
        });
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          avatar = (profileJson as { profile?: { avatar?: string | null } }).profile?.avatar ?? null;
        }
      } catch {
        // ігноруємо помилку профілю – логін все одно успішний
      }

      return { user: json.user, token: json.accessToken, refreshToken: json.refreshToken, avatar } as AuthPayload;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; firstName: string; lastName: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`, // бекенд ожидает name
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Register failed");
      }
      const json = await res.json();

      let avatar: string | null = null;
      try {
        const profileRes = await fetch(`${API_URL}/api/profile/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${json.accessToken}`,
          },
        });
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          avatar = (profileJson as { profile?: { avatar?: string | null } }).profile?.avatar ?? null;
        }
      } catch {
        // ігноруємо помилку профілю – реєстрація все одно успішна
      }

      return { user: json.user, token: json.accessToken, refreshToken: json.refreshToken, avatar } as AuthPayload;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : "Register failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.avatar = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("avatar");
    },
    clearError(state) {
      state.error = null;
    },
    setAvatar(state, action: PayloadAction<string | null>) {
      state.avatar = action.payload;
      if (action.payload) {
        localStorage.setItem("avatar", action.payload);
      } else {
        localStorage.removeItem("avatar");
      }
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const handleFulfilled = (
      state: AuthState,
      action: PayloadAction<AuthPayload>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof action.payload.avatar !== "undefined") {
        state.avatar = action.payload.avatar;
        if (action.payload.avatar) {
          localStorage.setItem("avatar", action.payload.avatar);
        } else {
          localStorage.removeItem("avatar");
        }
      }
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("accessToken", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    };
    const handleRejected = (state: AuthState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected);
  },
});

export const { logout, clearError, setAvatar } = authSlice.actions;
export default authSlice.reducer;