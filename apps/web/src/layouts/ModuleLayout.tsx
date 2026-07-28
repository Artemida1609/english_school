import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";

export const ModuleLayout = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f3fbf9] dark:bg-slate-900">
      {/* Spacer: Header is position:fixed */}
      <div className="h-16 w-full flex-shrink-0" aria-hidden />
      <Header />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
