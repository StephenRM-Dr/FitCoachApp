export interface Exercise {
  id: number;
  /** null = catálogo global; con valor = ejercicio propio de ese coach. */
  coach_id: number | null;
  slug: string | null;
  name: string;
  /** Grupo amplio calculado por el backend (Pecho, Espalda, … Movilidad). */
  muscle_group: string;
  pattern: string | null;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string | null;
  level: string | null;
  contraindications: string[];
  technical_cues: string[];
  notes: string | null;
  description: string | null;
  video_url: string | null;
  image_url: string | null;
}

export interface TaxonomyOption {
  key: string;
  label: string;
}

/** Vocabulario cerrado del catálogo (GET exercises/taxonomy). */
export interface ExerciseTaxonomy {
  groups: string[];
  muscles: (TaxonomyOption & { group: string })[];
  patterns: TaxonomyOption[];
  equipment: TaxonomyOption[];
  levels: TaxonomyOption[];
}

export interface NewExercise {
  name: string;
  pattern: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  level: string;
  contraindications: string[];
  technical_cues: string[];
  notes: string | null;
}

export const DAYS_OF_WEEK = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export type WeightUnit = "kg" | "lb";

/** "60 / 65 / 70 kg" — null si no hay pesos cargados. */
export const formatTargetWeights = (
  weights: number[] | null | undefined,
  unit: WeightUnit | null | undefined,
): string | null =>
  weights?.length ? `${weights.join(" / ")} ${unit ?? "kg"}` : null;

export interface SessionExercise {
  id: number;
  workout_session_id: number;
  exercise_id: number;
  order: number;
  target_sets: number | null;
  target_reps: number | null;
  /** Hasta 3 pesos aproximados, en weight_unit. */
  target_weights: number[] | null;
  weight_unit: WeightUnit;
  target_rpe: number | null;
  rest_time_seconds: number | null;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: number;
  microcycle_id: number;
  name: string;
  day_of_week: DayOfWeek | null;
  session_exercises?: SessionExercise[];
  /** Solo en listados (coach/clients/{id}/programs), en vez de session_exercises. */
  session_exercises_count?: number;
  /** Solo en el programa activo del cliente (GET /client/programs/active). */
  is_completed?: boolean;
  last_execution_at?: string | null;
}

export interface Microcycle {
  id: number;
  mesocycle_id: number;
  week_number: number;
  focus: string | null;
  workout_sessions?: WorkoutSession[];
}

export interface Mesocycle {
  id: number;
  program_id: number;
  name: string;
  start_week: number;
  end_week: number;
  microcycles?: Microcycle[];
}

export interface Program {
  id: number;
  coach_id: number;
  client_id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  mesocycles?: Mesocycle[];
}

export interface ExecutionSet {
  id?: number;
  workout_execution_id?: number;
  exercise_id: number;
  set_number: number;
  weight_kg: number | null;
  reps_performed: number | null;
  rpe: number | null;
  rir: number | null;
  notes?: string | null;
}

export interface WorkoutExecution {
  id?: number;
  workout_session_id: number;
  user_id?: number;
  started_at: string | null;
  completed_at: string | null;
  session_rpe: number | null;
  notes: string | null;
  workout_session?: WorkoutSession;
  execution_sets?: ExecutionSet[];
}

export interface WeeklyPlan {
  program_id: number;
  mesocycle_id: number;
  microcycle: Microcycle;
}
