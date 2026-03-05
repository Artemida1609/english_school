import { NavLink } from "react-router-dom";
import { FireIcon } from "../icons/FireIcon";
import { LogoIcon } from "../icons/LogoIcon";
import { ProfileIcon } from "../icons/ProfileIcon";

export const Header = () => {
  return (
    <header className="fixed z-50 w-full h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100">
      
      {/* Logo */}
      <NavLink to={'/'} className="flex items-center gap-2 cursor-pointer group">
        <div className="transition-transform duration-200 group-hover:scale-110">
          <LogoIcon />
        </div>
      </NavLink>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-orange-100 bg-orange-50 hover:bg-orange-100 transition-colors duration-150 cursor-pointer">
          <FireIcon size={20} />
          <span className="text-sm font-bold text-orange-500 tabular-nums">0</span>
          <span className="text-sm text-orange-400 font-medium hidden sm:inline">days</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-150 cursor-pointer">
          <span className="text-xs font-extrabold text-white inline-flex items-center justify-center bg-emerald-400 rounded-full w-5 h-5 leading-none tracking-tight">
            xp
          </span>
          <span className="text-sm font-bold text-emerald-600 tabular-nums">0</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Profile */}
        <button className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
          <ProfileIcon />
        </button>

      </div>
    </header>
  );
};