import { DAYS_OF_WEEK, DayOfWeek, WorkoutSession } from "../types";

// Date#getDay(): 0 = domingo ... 6 = sábado.
const JS_DAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

export function dayOfWeekFor(date: Date): DayOfWeek {
  return JS_DAY_TO_DAY_OF_WEEK[date.getDay()];
}

export interface WeekPlanDay {
  day: DayOfWeek;
  isToday: boolean;
  sessions: WorkoutSession[];
}

export interface WeekPlan {
  /** Lunes → domingo; los días sin sesión traen `sessions: []` (descanso). */
  days: WeekPlanDay[];
  /** Sesiones que el coach no asignó a ningún día. */
  unscheduled: WorkoutSession[];
}

/**
 * Reparte las sesiones de la semana en los 7 días. Es una función pura (recibe
 * "hoy") para poder razonarla y probarla sin depender del reloj.
 */
export function buildWeekPlan(
  sessions: WorkoutSession[],
  today: DayOfWeek,
): WeekPlan {
  return {
    days: DAYS_OF_WEEK.map((day) => ({
      day,
      isToday: day === today,
      sessions: sessions.filter((s) => s.day_of_week === day),
    })),
    unscheduled: sessions.filter((s) => !s.day_of_week),
  };
}
