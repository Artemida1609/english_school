// src/hooks/useAuth.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../index";
import { login, register, logout, clearError } from "../authSlice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error } = useSelector((s: RootState) => s.auth);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    login: (email: string, password: string) =>
      dispatch(login({ email, password })),
    register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
      dispatch(register(data)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};