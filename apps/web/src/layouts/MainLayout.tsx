import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { SideBar } from "../components/SideBar";

export const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#030812] transition-colors duration-500">
      <Header />
      <div className="flex flex-1 pt-16 min-h-0">
        <SideBar />
        <main
          className="flex-1 md:ml-20 mb-16 md:mb-0
          bg-slate-50 dark:bg-[#030812] overflow-y-auto overflow-x-hidden transition-colors duration-500"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
