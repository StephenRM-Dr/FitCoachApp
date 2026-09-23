import api from "./api";
import { Program, WorkoutSession, WorkoutExecution } from "../types";

export const workoutService = {
  // Obtener el programa activo del alumno
  getActiveProgram: async () => {
    const response = await api.get("/client/programs/active");
    return response.data as Program | null;
  },

  // Obtener una sesión específica con sus ejercicios
  getSessionDetails: async (sessionId: number) => {
    const response = await api.get(`/client/sessions/${sessionId}`);
    return response.data as WorkoutSession;
  },

  // Guardar la ejecución de un entrenamiento completo
  storeExecution: async (data: WorkoutExecution) => {
    const response = await api.post("/client/executions", data);
    return response.data;
  },

  // Obtener historial de ejecuciones (endpoint paginado)
  getExecutionHistory: async (page = 1, perPage = 20) => {
    const response = await api.get("/client/executions/history", {
      params: { page, per_page: perPage },
    });
    return response.data.data as WorkoutExecution[];
  },
};
