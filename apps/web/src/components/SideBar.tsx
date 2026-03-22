// SideBar.tsx
import { NavLink } from "react-router-dom"
import { ChatsIcon } from "../icons/ChatsIcon"
import { CoursesIcon } from "../icons/CoursesIcon"
import { SettingsIcon } from "../icons/SettingsIcon"
// import { StoreIcon } from "../icons/StoreIcon"

const navItems = [
  { name: "Course",  href: "/course",  icon: <CoursesIcon /> },
  { name: "Settings", href: "/settings", icon: <SettingsIcon /> },
  { name: "Chats",    href: "/chats",    icon: <ChatsIcon /> },
  // { name: "Store",    href: "/store",    icon: <StoreIcon /> },
]

export const SideBar = () => {
  return (
    <aside className="
      fixed z-40
      bg-slate-50 dark:bg-[#030812]
      border-slate-200 dark:border-white/5
      bottom-0 left-0 right-0 h-16 border-t flex flex-row
      md:bottom-auto md:top-16 md:left-0 md:right-auto
      md:h-[calc(100vh-4rem)] md:w-16 md:border-r md:border-t-0 md:flex-col
      transition-colors duration-500
    ">
      {navItems.map((item, index) => (
        <NavLink
          to={item.href}
          key={index}
          className={({ isActive }) =>
            `nav-item group/item flex flex-col items-center justify-center
            flex-1 md:flex-none p-2 md:p-4 md:rounded-xl
            transition-colors duration-200
            ${isActive
              ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
              : "text-gray-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
            }`
          }
        >
          <span>{item.icon}</span>
          <span className="text-[10px] md:text-[11px] font-semibold mt-0.5">{item.name}</span>
        </NavLink>
      ))}
    </aside>
  )
}