import api from "./api";

export interface Anthropometric {
  id: number;
  user_id: number;
  weight: number | null;
  height: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  fcr_lpm: number | null;
  recorded_at: string;
}

export const progressService = {
  getAnthropometrics: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get("/anthropometrics", { params });
    return response.data;
  },

  getLatestAnthropometric: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get("/anthropometrics/latest", { params });
    return response.data;
  },

  saveAnthropometric: async (
    data: Partial<Anthropometric>,
    clientId?: number,
  ) => {
    const payload = clientId ? { ...data, client_id: clientId } : data;
    const response = await api.post("/anthropometrics", payload);
    return response.data;
  },
};
