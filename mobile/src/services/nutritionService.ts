import api from "./api";

export interface NutritionLog {
  id: number;
  user_id: number;
  water_liters: number | null;
  sleep_hours: number | null;
  session_completed: boolean;
  calories_consumed: number | null;
  recorded_at: string;
}

export interface NutritionSettings {
  user_id: number;
  nutrition_enabled: boolean;
  macro_protein_pct: number;
  macro_carbs_pct: number;
  macro_fat_pct: number;
}

export const nutritionService = {
  getNutritionLogs: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get("/nutrition-logs", { params });
    return response.data;
  },

  getTodayLog: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get("/nutrition-logs/today", { params });
    return response.data;
  },

  saveLog: async (data: Partial<NutritionLog>, clientId?: number) => {
    const payload = clientId ? { ...data, client_id: clientId } : data;
    const response = await api.post("/nutrition-logs", payload);
    return response.data;
  },

  /**
   * Estado de habilitación de Nutrición + macros configurados por el coach.
   * Sin `clientId`, devuelve los del usuario autenticado.
   */
  getNutritionSettings: async (
    clientId?: number,
  ): Promise<NutritionSettings> => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get("/nutrition-settings", { params });
    return response.data;
  },

  /**
   * Exclusivo coach: habilita/deshabilita Nutrición y fija los porcentajes
   * de macros de un alumno. No existe equivalente para que el cliente se
   * autohabilite.
   */
  updateNutritionSettings: async (
    clientId: number,
    data: Omit<NutritionSettings, "user_id">,
  ): Promise<NutritionSettings> => {
    const response = await api.put(
      `/coach/clients/${clientId}/nutrition-settings`,
      data,
    );
    return response.data;
  },
};
