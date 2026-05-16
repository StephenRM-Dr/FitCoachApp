import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "coach" | "client";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  force_password_change?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  restoreSession: () => Promise<void>;
}

const STORAGE_KEYS = {
  USER: "@fitcoach_user",
  TOKEN: "@fitcoach_token",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // starts loading to check stored session
  error: null,

  setAuth: async (user, token) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (e) {
      // Storage save failed, session won't persist but auth still works
    }
    set({ user, token, isAuthenticated: true, isLoading: false, error: null });
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
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
      const [userJson, token] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TOKEN,
      ]);

      const userData = userJson[1];
      const tokenData = token[1];

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
