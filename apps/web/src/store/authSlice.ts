import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "../api/client";

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
      const json = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      let avatar: string | null = null;
      try {
        const profileJson = await apiFetch<{ profile?: { avatar?: string | null } }>("/api/profile/me", {
          headers: { Authorization: `Bearer ${json.accessToken}` }
        });
        avatar = profileJson.profile?.avatar ?? null;
      } catch {
        // ігноруємо помилку профілю
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
      const json = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
        }),
      });

      let avatar: string | null = null;
      try {
        const profileJson = await apiFetch<{ profile?: { avatar?: string | null } }>("/api/profile/me", {
          headers: { Authorization: `Bearer ${json.accessToken}` }
        });
        avatar = profileJson.profile?.avatar ?? null;
      } catch {
        // ігноруємо помилку профілю
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