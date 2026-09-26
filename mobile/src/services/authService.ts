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
  gender: "male" | "female";
  coach_code?: string;
  accept_terms: boolean;
  accept_health_data: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "coach" | "client";
    gender?: "male" | "female" | null;
    force_password_change?: boolean;
    needs_legal_acceptance?: boolean;
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

  /** Usuario actual con sus banderas al día (el guardado en el dispositivo puede estar desactualizado). */
  me: async (): Promise<AuthResponse["user"]> => {
    const response = await api.get("/me");
    return response.data;
  },

  /** Registra la aceptación de la versión vigente de los textos legales. */
  acceptLegal: async (data: {
    accept_terms: boolean;
    accept_health_data?: boolean;
  }): Promise<AuthResponse["user"]> => {
    const response = await api.post("/legal/accept", data);
    return response.data;
  },

  /** Elimina la cuenta y todos sus datos (requiere la contraseña actual). */
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await api.delete("/account", { data: { password } });
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

  confirmResetCode: async (
    email: string,
    code: string,
  ): Promise<AuthResponse> => {
    const response = await api.post("/password/reset/confirm", {
      email,
      code,
    });
    return response.data;
  },

  updatePassword: async (data: {
    current_password?: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string; user: AuthResponse["user"] }> => {
    const response = await api.post("/password/update", data);
    return response.data;
  },
};
