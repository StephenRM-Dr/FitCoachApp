import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationPreferences {
  workoutReminders: boolean;
  nutritionReminders: boolean;
  coachMessages: boolean;
}

interface PreferencesState {
  notifications: NotificationPreferences;
  toggleNotification: (key: keyof NotificationPreferences) => void;
  // Guardado para cuando exista un modo claro real (ver AppearanceScreen);
  // hoy no cambia nada visualmente, la app es dark-only.
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Preferencias 100% locales (AsyncStorage vía Zustand persist): no existe
// infraestructura de push (Expo Notifications/FCM) ni tabla en el backend,
// así que no hay nada real que sincronizar todavía. Estos toggles solo
// controlan si, cuando esa infraestructura exista, el usuario querrá
// recibir cada tipo de aviso.
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      notifications: {
        workoutReminders: true,
        nutritionReminders: true,
        coachMessages: true,
      },
      toggleNotification: (key) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        })),
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: "fitcoach-preferences",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
