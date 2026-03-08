import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";

export const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-900">
      <Header />
      <div className="flex flex-1 pt-16 min-h-0">
        <SideBar />
        <main
          className="flex-1 md:ml-16 mb-16 md:mb-0 p-4 md:p-6
          bg-[#f3fbf9] dark:bg-slate-900 overflow-y-auto overflow-x-hidden transition-colors duration-300"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
