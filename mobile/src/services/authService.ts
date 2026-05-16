import api from "./api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: "coach" | "client";
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "coach" | "client";
    force_password_change?: boolean;
  };
}

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/register", data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post("/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/user");
    return response.data;
  },

  resetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/password/reset", { email });
    return response.data;
  },

  updatePassword: async (data: {
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string; user: AuthResponse["user"] }> => {
    const response = await api.post("/password/update", data);
    return response.data;
  },
};
