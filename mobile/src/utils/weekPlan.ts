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

/**
 * Fecha real (lunes-domingo) de la semana que contiene `today` para un día
 * dado. El modelo de planificación no guarda ninguna fecha ancla (solo
 * `day_of_week`, una etiqueta que se repite cada semana) y la app siempre
 * trabaja sobre el microciclo "actual" — así que "la próxima/actual sesión
 * de un lunes" solo puede referirse al lunes de la semana real en curso.
 * Función pura (recibe "hoy") para poder razonarla y probarla sin depender
 * del reloj.
 */
export function dateForDayInCurrentWeek(day: DayOfWeek, today: Date): Date {
  const mondayOffset = (today.getDay() + 6) % 7; // lunes=0 ... domingo=6
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - mondayOffset);

  const targetOffset = DAYS_OF_WEEK.indexOf(day);
  const result = new Date(monday);
  result.setDate(monday.getDate() + targetOffset);
  return result;
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
