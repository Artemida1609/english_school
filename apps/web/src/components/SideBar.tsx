// SideBar.tsx
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { NavLink } from "react-router-dom"
import { LayoutTemplate } from "lucide-react"
import { ChatsIcon } from "../icons/ChatsIcon"
import { CoursesIcon } from "../icons/CoursesIcon"
import { SettingsIcon } from "../icons/SettingsIcon"
import type { RootState } from "../store"
// import { StoreIcon } from "../icons/StoreIcon"

const constructorItem = {
  name: "Конструктор",
  href: "/constructor",
  icon: <LayoutTemplate className="w-6 h-6" strokeWidth={1.8} />,
}

const baseNavItems = [
  {
    name: "Головна",
    href: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9.5V20h13V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { name: "Налаштування", href: "/settings", icon: <SettingsIcon /> },
  { name: "Чати",    href: "/chats",    icon: <ChatsIcon /> },
  { name: "Курс",  href: "/course",  icon: <CoursesIcon /> },
  // {
  //   name: "Профіль",
  //   href: "/profile",
  //   icon: (
  //     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
  //       <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
  //       <path d="M4.5 20c1.8-3.7 4.5-5.5 7.5-5.5s5.7 1.8 7.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  //     </svg>
  //   ),
  // },
  // { name: "Store",    href: "/store",    icon: <StoreIcon /> },
]

export const SideBar = () => {
  const role = useSelector((s: RootState) => s.auth.user?.role)
  const navItems = useMemo(() => {
    if (role === "TEACHER" || role === "ADMIN") {
      const items = [...baseNavItems]
      const courseIdx = items.findIndex((i) => i.href === "/course")
      const insertAt = courseIdx >= 0 ? courseIdx + 1 : items.length - 1
      items.splice(insertAt, 0, constructorItem)
      return items
    }
    return baseNavItems
  }, [role])

  return (
    <aside className="
      fixed z-40
      bg-slate-50 dark:bg-[#030812]
      border-slate-200 dark:border-white/5
      bottom-0 left-0 right-0 h-16 border-t flex flex-row
      md:bottom-auto md:top-16 md:left-0 md:right-auto
      md:h-[calc(100vh-4rem)] md:w-20 md:border-r md:border-t-0 md:flex-col
      transition-colors duration-500
    ">
      {navItems.map((item, index) => (
        <NavLink
          to={item.href}
          key={index}
          className={({ isActive }) =>
            `nav-item group/item flex flex-col items-center justify-center
            flex-1 md:flex-none p-2 md:px-2 md:py-3
            transition-colors duration-200
            ${isActive
              ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
              : "text-gray-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
            }`
          }
        >
          <span className="w-6 h-6 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 [&_svg]:stroke-current">
            {item.icon}
          </span>
          <span className="text-[10px] md:text-[10px] font-semibold mt-1 w-full px-1 text-center leading-tight whitespace-normal break-words">
            {item.name}
          </span>
        </NavLink>
      ))}
    </aside>
  )
}