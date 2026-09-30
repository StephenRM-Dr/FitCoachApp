import api from "./api";
import { Exercise, ExerciseTaxonomy } from "../types";

export const catalogService = {
  getExercises: async () => {
    const response = await api.get("/exercises");
    return response.data as Exercise[];
  },

  /** Listas cerradas para crear y filtrar ejercicios. */
  getTaxonomy: async () => {
    const response = await api.get("/exercises/taxonomy");
    return response.data as ExerciseTaxonomy;
  },
};
