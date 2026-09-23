import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export type UserRole = "coach" | "client";

export type Gender = "male" | "female";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  gender?: Gender | null;
  force_password_change?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  restoreSession: () => Promise<void>;
}

// SecureStore no admite "@" en las claves.
const STORAGE_KEYS = {
  USER: "fitcoach_user",
  TOKEN: "fitcoach_token",
};

// Claves antiguas en AsyncStorage (versiones previas guardaban la sesión
// sin cifrar). Se usan solo para migrar y limpiar.
const LEGACY_KEYS = {
  USER: "@fitcoach_user",
  TOKEN: "@fitcoach_token",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // starts loading to check stored session
  error: null,

  setAuth: async (user, token) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
    } catch (e) {
      // Storage save failed, session won't persist but auth still works
    }
    set({ user, token, isAuthenticated: true, isLoading: false, error: null });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    } catch (e) {
      // Ignore storage errors on logout
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  restoreSession: async () => {
    try {
      let userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      let tokenData = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);

      // Migración: sesiones guardadas por versiones anteriores en
      // AsyncStorage (sin cifrar) se mueven a SecureStore y se borran.
      if (!userData || !tokenData) {
        const legacyUser = await AsyncStorage.getItem(LEGACY_KEYS.USER);
        const legacyToken = await AsyncStorage.getItem(LEGACY_KEYS.TOKEN);
        if (legacyUser && legacyToken) {
          userData = legacyUser;
          tokenData = legacyToken;
          await SecureStore.setItemAsync(STORAGE_KEYS.USER, userData);
          await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, tokenData);
        }
        await AsyncStorage.removeItem(LEGACY_KEYS.USER);
        await AsyncStorage.removeItem(LEGACY_KEYS.TOKEN);
      }

      if (userData && tokenData) {
        const user: User = JSON.parse(userData);
        set({
          user,
          token: tokenData,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));
