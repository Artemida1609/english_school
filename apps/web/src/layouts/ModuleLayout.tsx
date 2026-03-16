import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";

export const ModuleLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f3fbf9] dark:bg-slate-900">
      <Header />
      <main className="flex-1 pt-16 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};