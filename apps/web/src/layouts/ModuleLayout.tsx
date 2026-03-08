import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";

export const ModuleLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-1 pt-16 overflow-y-auto overflow-x-hidden bg-[#f3fbf9]">
        <Outlet />
      </main>
    </div>
  );
};