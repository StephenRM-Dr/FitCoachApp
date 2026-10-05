// Se usa expo-calendar/legacy a propósito: en el SDK instalado (57), la API
// "nueva" (import * as Calendar from "expo-calendar") dejó varias funciones
// de este mismo nombre como deprecadas y lanzan en tiempo de ejecución si se
// llaman — la ruta /legacy mantiene la API async estable y documentada.
import * as Calendar from "expo-calendar/legacy";
import { DayOfWeek } from "../types";
import { dateForDayInCurrentWeek } from "../utils/weekPlan";

export type AddToCalendarResult =
  | { ok: true }
  | {
      ok: false;
      reason: "no-day" | "permission-denied" | "no-calendar" | "error";
    };

/**
 * Agrega UNA sesión al calendario del dispositivo, en la fecha real del día
 * de la semana que le corresponde dentro de la semana actual (ver
 * `dateForDayInCurrentWeek`). Es una acción puntual a pedido del usuario, no
 * una sincronización: si el coach cambia el plan después, no se actualiza
 * sola — el asesorado tendría que volver a tocar el botón.
 */
export async function addSessionToDeviceCalendar(session: {
  name: string;
  day_of_week: DayOfWeek | null;
}): Promise<AddToCalendarResult> {
  if (!session.day_of_week) {
    return { ok: false, reason: "no-day" };
  }

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") {
    return { ok: false, reason: "permission-denied" };
  }

  try {
    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );
    const writable =
      calendars.find((c) => c.isPrimary && c.allowsModifications) ||
      calendars.find((c) => c.allowsModifications);

    if (!writable) {
      return { ok: false, reason: "no-calendar" };
    }

    const date = dateForDayInCurrentWeek(session.day_of_week, new Date());

    await Calendar.createEventAsync(writable.id, {
      title: `Entrenamiento: ${session.name}`,
      notes: "Planificado en FitCoach Pro.",
      startDate: date,
      endDate: date,
      allDay: true,
      timeZone:
        writable.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}
