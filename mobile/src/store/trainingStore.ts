import { create } from "zustand";

interface Session {
  id: string;
  name: string;
  type: "Strength" | "Endurance";
  exercises: any[];
}

interface Microcycle {
  id: string;
  weekNumber: number;
  sessions: Session[];
}

interface Mesocycle {
  id: string;
  name: string;
  objective: string;
  microcycles: Microcycle[];
}

interface TrainingState {
  macrocicloName: string;
  currentMesocycleId: string | null;
  mesociclos: Mesociclo[];
  setMacrocicloName: (name: string) => void;
  addMesociclo: (meso: Mesociclo) => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  macrocicloName: "Plan Anual 2026",
  currentMesocycleId: "1",
  mesociclos: [
    {
      id: "1",
      name: "Fuerza Base",
      objective: "Mejorar RM en ejercicios multiarticulares",
      microcycles: [],
    },
  ],
  setMacrocicloName: (name) => set({ macrocicloName: name }),
  addMesociclo: (meso) =>
    set((state) => ({ mesociclos: [...state.mesociclos, meso] })),
}));
