import api from "./api";
import { User } from "../store/authStore";
import {
  Program,
  Mesocycle,
  Microcycle,
  WorkoutSession,
  Exercise,
  NewExercise,
  WeeklyPlan,
  DayOfWeek,
} from "../types";

export const coachService = {
  /**
   * Crea la cuenta de un asesorado asignada a este coach. La contraseña es
   * temporal: el asesorado la cambia y acepta los términos al primer ingreso.
   */
  createClient: async (data: {
    name: string;
    email: string;
    gender: "male" | "female";
    password: string;
  }) => {
    const response = await api.post("/coach/clients", data);
    return response.data as User;
  },

  /** Nueva contraseña temporal para un asesorado propio (no hay recuperación por correo). */
  resetClientPassword: async (clientId: number, password: string) => {
    const response = await api.post(`/coach/clients/${clientId}/password`, {
      password,
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

  /**
   * Lista liviana (sin sesiones) de las semanas de un mesociclo, ordenadas
   * por week_number — para navegar entre semanas ya creadas.
   */
  getMicrocycles: async (mesocycleId: number) => {
    const response = await api.get(
      `/coach/mesocycles/${mesocycleId}/microcycles`,
    );
    return response.data as Microcycle[];
  },

  /** Detalle de una semana específica, con sus sesiones. */
  getMicrocycle: async (microcycleId: number) => {
    const response = await api.get(`/coach/microcycles/${microcycleId}`);
    return response.data as Microcycle;
  },

  /**
   * Detalle de una semana por su número (no por id) — usado por la
   * paginación de PlanningScreen para pedir solo la semana a la que se
   * navega, en vez de traer antes el listado completo del mesociclo.
   */
  getMicrocycleByWeek: async (mesocycleId: number, weekNumber: number) => {
    const response = await api.get(
      `/coach/mesocycles/${mesocycleId}/microcycles/week/${weekNumber}`,
    );
    return response.data as Microcycle;
  },

  createSession: async (
    microcycleId: number,
    data: { name: string; day_of_week?: DayOfWeek | null; exercises: any[] },
  ) => {
    const response = await api.post(
      `/coach/microcycles/${microcycleId}/sessions`,
      data,
    );
    return response.data as WorkoutSession;
  },

  /** Edita una sesión ya guardada: reemplaza nombre, día y ejercicios. */
  updateSession: async (
    sessionId: number,
    data: { name: string; day_of_week?: DayOfWeek | null; exercises: any[] },
  ) => {
    const response = await api.put(`/coach/sessions/${sessionId}`, data);
    return response.data as WorkoutSession;
  },

  getSessionPreview: async (sessionId: number) => {
    const response = await api.get(`/coach/sessions/${sessionId}`);
    return response.data as WorkoutSession;
  },

  /**
   * Idempotente: provisiona (la primera vez) y devuelve el Programa activo +
   * Mesociclo + Microciclo (semana más reciente) de un alumno.
   */
  ensureWeeklyPlan: async (clientId: number) => {
    const response = await api.post(`/coach/clients/${clientId}/weekly-plan`);
    return response.data as WeeklyPlan;
  },

  /**
   * Sube/reemplaza la imagen o GIF de un ejercicio del catálogo (se sube una
   * vez por ejercicio, no por sesión — la ven todos los coaches).
   */
  uploadExerciseMedia: async (
    exerciseId: number,
    asset: { uri: string; name: string; type: string },
  ) => {
    const formData = new FormData();
    // React Native's FormData accepts this shape for file uploads.
    formData.append("image", {
      uri: asset.uri,
      name: asset.name,
      type: asset.type,
    } as any);

    const response = await api.post(
      `/coach/exercises/${exerciseId}/media`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data as Exercise;
  },

  /** Crea un ejercicio personalizado (solo visible para este coach). */
  createExercise: async (data: NewExercise) => {
    const response = await api.post("/coach/exercises", data);
    return response.data as Exercise;
  },
};
