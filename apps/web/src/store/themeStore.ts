// store/themeStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: () => boolean
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme })
        const dark =
          theme === "dark" ||
          (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
        document.documentElement.classList.toggle("dark", dark)
      },
      isDark: () => {
        const { theme } = get()
        if (theme === "dark") return true
        if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches
        return false
      },
    }),
    { name: "theme-storage" }
  )
)