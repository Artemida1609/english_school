// App.tsx з layout
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { ModulesPage } from "./pages/ModulesPage";
import { ModulePage } from "./pages/ModulePage";
import { ChatsPage } from "./pages/ChatsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StorePage } from "./pages/StorePage";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/:id" element={<ModulePage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/store" element={<StorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};