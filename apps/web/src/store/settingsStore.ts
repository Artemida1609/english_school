import { create } from "zustand";
import { persist } from "zustand/middleware";

type GoalId = "casual" | "regular" | "intense";
type PlanId = "free" | "pro";

interface NotificationState {
  push: boolean;
  email: boolean;
  streak: boolean;
  achievements: boolean;
  reminders: boolean;
}

interface SettingsStore {
  // Notifications
  notifications: NotificationState;
  setNotifications: (n: NotificationState) => void;

  // Goal
  goal: GoalId;
  setGoal: (g: GoalId) => void;

  // Subscription
  subscription: PlanId;
  setSubscription: (s: PlanId) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      notifications: {
        push: true,
        email: true,
        streak: true,
        achievements: false,
        reminders: true,
      },
      setNotifications: (n) => set({ notifications: n }),

      goal: "regular",
      setGoal: (g) => set({ goal: g }),

      subscription: "free",
      setSubscription: (s) => set({ subscription: s }),
    }),
    { name: "settings-storage" }
  )
);