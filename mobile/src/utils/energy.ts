import { ActivityLevel } from "../services/anamnesisService";

export type Gender = "male" | "female";

export const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "sedentario",
    label: "Sedentario",
    description: "Poco o nada de ejercicio",
  },
  {
    value: "ligero",
    label: "Ligero",
    description: "Ejercicio 1–3 días/semana",
  },
  {
    value: "activo",
    label: "Activo",
    description: "Ejercicio 3–5 días/semana",
  },
  {
    value: "muy_activo",
    label: "Muy Activo",
    description: "Ejercicio 6–7 días/semana o trabajo físico",
  },
];

// Multiplicadores del gasto diario por nivel de actividad (mismo enum que UserProfile.activity_level).
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  activo: 1.55,
  muy_activo: 1.725,
};

export interface EnergyInput {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: Gender;
}

/** Tasa metabólica basal (kcal/día), fórmula de Mifflin-St Jeor. */
export const calcTMB = ({ weight, height, age, gender }: EnergyInput) =>
  Math.round(
    10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161),
  );

/** Gasto energético diario total (kcal/día) = TMB × factor de actividad. */
export const calcTDEE = (input: EnergyInput, activityLevel: ActivityLevel) =>
  Math.round(calcTMB(input) * ACTIVITY_FACTORS[activityLevel]);

/** Gramos de cada macro para unas kcal y unos porcentajes (4/4/9 kcal por gramo). */
export const calcMacroGrams = (
  kcal: number,
  pcts: { protein: number; carbs: number; fat: number },
) => ({
  protein: Math.round((kcal * pcts.protein) / 100 / 4),
  carbs: Math.round((kcal * pcts.carbs) / 100 / 4),
  fat: Math.round((kcal * pcts.fat) / 100 / 9),
});
