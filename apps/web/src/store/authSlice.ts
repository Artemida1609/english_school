import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") ?? "null"),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Login failed");
      return await res.json(); // { user, token }
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: { email: string; password: string; firstName: string; lastName: string }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Register failed");
      return await res.json();
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
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const handleFulfilled = (state: AuthState, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
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

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;