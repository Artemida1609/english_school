import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../store";

/** Доступ лише для TEACHER та ADMIN */
export const StaffGuard = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
