import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";

export const MainLayout = () => {
  const { pathname } = useLocation();
  const isChats = pathname.startsWith("/chats");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors duration-500 dark:bg-[#030812]">
      {/* Spacer: Header is position:fixed and does not consume flex space */}
      <div className="h-16 w-full flex-shrink-0" aria-hidden />
      <Header />

      <div className="flex flex-1 min-h-0">
        <SideBar />
        <main
          className={`relative flex-1
          bg-slate-50 pb-16 dark:bg-[#030812] md:ml-20 md:pb-0
          min-h-0 transition-colors duration-500
          ${isChats ? "overflow-hidden" : ""}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
