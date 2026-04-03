import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { ModulePage } from "./pages/ModulePage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { ChatsPage } from "./pages/ChatsPage";
import { SettingsPage } from "./pages/SettingsPage";
// import { StorePage } from "./pages/StorePage";
import { ModuleLayout } from "./layouts/ModuleLayout";
import {
  NotificationSettings,
  LanguageSettings,
  GoalSettings,
  SecuritySettings,
  ThemeSettings,
  PrivacySettings,
  SubscriptionSettings,
} from "./components/Settings";
import i18n from "./i18n";
import { useThemeStore } from "./store/themeStore";
import { useEffect } from "react";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthGuard } from "./components/AuthGuard";
import { ProfilePage } from "./pages/ProfilePage";
import { MainHomePage } from "./pages/MainHomePage";
import { StaffGuard } from "./components/StaffGuard";
import { ModuleConstructorPage } from "./pages/ModuleConstructorPage";

export const App = () => {
  const { theme, setTheme } = useThemeStore();

  // Ініціалізуємо тему один раз при монтуванні
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Ініціалізуємо мову зі збереженого стану
  useEffect(() => {
    const saved = localStorage.getItem("language-storage");
    if (saved) {
      try {
        const { state } = JSON.parse(saved);
        if (state?.language) i18n.changeLanguage(state.language);
      } catch {
        // мовчки ігноруємо — залишиться дефолтна мова
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainHomePage />} />
            <Route path="/course" element={<CourseDetailPage />} />
            <Route path="/profile" element={<HomePage />} />
            <Route path="/profile-settings" element={<ProfilePage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/settings/notifications"
              element={<NotificationSettings />}
            />
            <Route path="/settings/language" element={<LanguageSettings />} />
            <Route path="/settings/goals" element={<GoalSettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/theme" element={<ThemeSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route
              path="/settings/subscription"
              element={<SubscriptionSettings />}
            />
            {/* <Route path="/store" element={<StorePage />} /> */}
            <Route element={<StaffGuard />}>
              <Route path="/constructor" element={<ModuleConstructorPage />} />
            </Route>
          </Route>

          <Route element={<ModuleLayout />}>
          <Route path="/course/modules/:id" element={<ModulePage />} />  
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
