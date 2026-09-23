import { create } from "zustand";

type Gender = "male" | "female";
type ActivityLevel = "sedentario" | "ligero" | "activo" | "muy_activo";

interface NutritionState {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityFactor: number;

  // Computed values
  getIMC: () => string;
  getTMB: () => number;
  getTDEE: () => number;

  // Actions
  hydrate: (data: {
    weight?: number | null;
    height?: number | null;
    age?: number | null;
    activityLevel?: ActivityLevel | null;
    gender?: Gender | null;
  }) => void;
  setGender: (gender: Gender) => void;
}

// Multiplicadores de Harris-Benedict por nivel de actividad (mismo enum que UserProfile.activity_level).
const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  activo: 1.55,
  muy_activo: 1.725,
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
  weight: 70,
  height: 170,
  age: 30,
  gender: "male",
  activityFactor: ACTIVITY_FACTORS.activo,

  getIMC: () => {
    const { weight, height } = get();
    return (weight / (height / 100) ** 2).toFixed(1);
  },

  getTMB: () => {
    const { weight, height, age, gender } = get();
    if (gender === "male") {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    }
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  },

  getTDEE: () => {
    return Math.round(get().getTMB() * get().activityFactor);
  },

  hydrate: (data) =>
    set((state) => ({
      weight: data.weight ?? state.weight,
      height: data.height ?? state.height,
      age: data.age ?? state.age,
      activityFactor: data.activityLevel
        ? ACTIVITY_FACTORS[data.activityLevel]
        : state.activityFactor,
      gender: data.gender ?? state.gender,
    })),

  setGender: (gender) => set({ gender }),
}));
