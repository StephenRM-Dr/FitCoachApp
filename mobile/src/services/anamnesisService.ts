import api from "./api";

export type ActivityLevel = "sedentario" | "ligero" | "activo" | "muy_activo";

export interface UserProfileData {
  age: number | null;
  occupation: string | null;
  activity_level: ActivityLevel | null;
  main_objective: string | null;
}

export interface AnamnesisResponse {
  profile: UserProfileData | null;
  history: Record<string, unknown> | null;
}

export const anamnesisService = {
  getMyAnamnesis: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get("/anamnesis", { params });
    return response.data as AnamnesisResponse;
  },

  saveAnamnesis: async (data: Partial<UserProfileData>, clientId?: number) => {
    const payload = clientId ? { ...data, client_id: clientId } : data;
    const response = await api.post("/anamnesis", payload);
    return response.data;
  },
};
