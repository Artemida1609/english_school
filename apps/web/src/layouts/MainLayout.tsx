import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";

export const MainLayout = () => {
  const { pathname } = useLocation();
  const isChats = pathname.startsWith("/chats");

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-[#030812] transition-colors duration-500">
      {/* Spacer: Header is position:fixed and does not consume flex space */}
      <div className="h-16 w-full flex-shrink-0" aria-hidden />
      <Header />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SideBar />
        <main
          className={`relative flex min-h-0 flex-1 flex-col
          bg-slate-50 pb-16 dark:bg-[#030812] md:ml-20 md:pb-0
          transition-colors duration-500
          ${isChats ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
