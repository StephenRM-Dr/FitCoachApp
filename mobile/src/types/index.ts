export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  description: string | null;
  video_url: string | null;
}

export interface SessionExercise {
  id: number;
  workout_session_id: number;
  exercise_id: number;
  order: number;
  target_sets: number | null;
  target_reps: number | null;
  target_rpe: number | null;
  rest_time_seconds: number | null;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: number;
  microcycle_id: number;
  name: string;
  day_of_week: string | null;
  session_exercises?: SessionExercise[];
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
}

export interface WorkoutExecution {
  id?: number;
  workout_session_id: number;
  user_id?: number;
  started_at: string | null;
  completed_at: string | null;
  session_rpe: number | null;
  notes: string | null;
  sets?: ExecutionSet[];
}
