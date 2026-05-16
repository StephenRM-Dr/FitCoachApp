import api from "./api";
import { User } from "../store/authStore";
import { Program, Mesocycle, Microcycle, WorkoutSession } from "../types";

export const coachService = {
  getAvailableClients: async () => {
    const response = await api.get("/coach/available-clients");
    return response.data as User[];
  },

  assignClient: async (clientId: number) => {
    const response = await api.post("/coach/assign-client", {
      client_id: clientId,
    });
    return response.data;
  },

  getMyClients: async () => {
    const response = await api.get("/coach/my-clients");
    return response.data as User[];
  },

  getMyCoach: async () => {
    const response = await api.get("/client/my-coach");
    return response.data as User | null;
  },

  // --- PERIODIZACIÓN ---

  getClientPrograms: async (clientId: number) => {
    const response = await api.get(`/coach/clients/${clientId}/programs`);
    return response.data as Program[];
  },

  createProgram: async (data: Partial<Program>) => {
    const response = await api.post("/coach/programs", data);
    return response.data as Program;
  },

  createMesocycle: async (programId: number, data: Partial<Mesocycle>) => {
    const response = await api.post(
      `/coach/programs/${programId}/mesocycles`,
      data,
    );
    return response.data as Mesocycle;
  },

  createMicrocycle: async (mesocycleId: number, data: Partial<Microcycle>) => {
    const response = await api.post(
      `/coach/mesocycles/${mesocycleId}/microcycles`,
      data,
    );
    return response.data as Microcycle;
  },

  createSession: async (
    microcycleId: number,
    data: { name: string; day_of_week?: string; exercises: any[] },
  ) => {
    const response = await api.post(
      `/coach/microcycles/${microcycleId}/sessions`,
      data,
    );
    return response.data as WorkoutSession;
  },
};
