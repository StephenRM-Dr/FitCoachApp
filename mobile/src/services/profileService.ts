import api from "./api";
import { ActivityLevel } from "./anamnesisService";

export interface ProfileData {
  name: string;
  email: string;
  age: number | null;
  occupation: string | null;
  activity_level: ActivityLevel | null;
  main_objective: string | null;
}

export const profileService = {
  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data as ProfileData;
  },

  updateProfile: async (data: Partial<ProfileData>) => {
    const response = await api.put("/profile", data);
    return response.data as ProfileData;
  },
};
