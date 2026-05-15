import api from './api';

export interface NutritionLog {
  id: number;
  user_id: number;
  water_liters: number | null;
  sleep_hours: number | null;
  session_completed: boolean;
  calories_consumed: number | null;
  recorded_at: string;
}

export const nutritionService = {
  getNutritionLogs: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get('/nutrition-logs', { params });
    return response.data;
  },

  getTodayLog: async (clientId?: number) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get('/nutrition-logs/today', { params });
    return response.data;
  },

  saveLog: async (data: Partial<NutritionLog>, clientId?: number) => {
    const payload = clientId ? { ...data, client_id: clientId } : data;
    const response = await api.post('/nutrition-logs', payload);
    return response.data;
  },
};
