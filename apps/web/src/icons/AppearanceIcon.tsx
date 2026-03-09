import { useThemeStore } from "../store/themeStore";

export const AppearanceIcon = ({ className }: { className?: string }) => {
  const { theme } = useThemeStore();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="19" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5.636" y1="5.636" x2="7.05" y2="7.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16.95" y1="16.95" x2="18.364" y2="18.364" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5.636" y1="18.364" x2="7.05" y2="16.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16.95" y1="7.05" x2="18.364" y2="5.636" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};