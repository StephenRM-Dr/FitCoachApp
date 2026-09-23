import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Plus, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  DAY_OF_WEEK_LABELS,
  WorkoutSession,
} from "../../types";

export function PlanningScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  // null = "la semana vigente" (la de mayor week_number). Se fija a un
  // número concreto al navegar con las flechas ‹ › a una semana anterior.
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(
    null,
  );
  // Resetea la semana seleccionada al cambiar de alumno. Se ajusta durante
  // el render (patrón recomendado por React para "derivar" estado de una
  // prop que cambia) en vez de useEffect, así evita el commit extra que
  // implicaría un efecto solo para esto.
  const [clientIdForWeekReset, setClientIdForWeekReset] =
    useState(selectedClientId);
  if (selectedClientId !== clientIdForWeekReset) {
    setClientIdForWeekReset(selectedClientId);
    setSelectedWeekNumber(null);
  }

  const { data: myClients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["my-clients"],
    queryFn: () => coachService.getMyClients(),
  });

  // Idempotente: provisiona (solo la primera vez) Programa + Mesociclo +
  // Microciclo de la semana vigente del alumno seleccionado, y la devuelve.
  const { data: weeklyPlan, isLoading: loadingPlan } = useQuery({
    queryKey: ["weekly-plan", selectedClientId],
    queryFn: () => coachService.ensureWeeklyPlan(selectedClientId as number),
    enabled: !!selectedClientId,
  });

  const mesocycleId = weeklyPlan?.mesocycle_id ?? null;
  const currentWeekNumber = weeklyPlan?.microcycle.week_number ?? null;
  const activeWeekNumber = selectedWeekNumber ?? currentWeekNumber;
  const isViewingCurrentWeek = activeWeekNumber === currentWeekNumber;

  // Las semanas se crean siempre de forma secuencial (1..N, ver
  // newWeekMutation más abajo), así que los límites de paginación se derivan
  // sin consultar la base de datos: alcanza con saber cuál es la semana
  // vigente (currentWeekNumber), que ya vino incluida en ensureWeeklyPlan.
  const canGoPrevWeek = !!activeWeekNumber && activeWeekNumber > 1;
  const canGoNextWeek =
    !!activeWeekNumber &&
    !!currentWeekNumber &&
    activeWeekNumber < currentWeekNumber;

  // Al navegar a una semana que no es la vigente, se pide su detalle
  // completo (con sesiones) puntualmente por número de semana — solo la que
  // se solicita, no un listado completo — la vigente ya vino con sesiones
  // desde ensureWeeklyPlan, no hace falta pedirla de nuevo.
  const { data: pastWeekDetail, isLoading: loadingPastWeek } = useQuery({
    queryKey: ["microcycle-week", mesocycleId, activeWeekNumber],
    queryFn: () =>
      coachService.getMicrocycleByWeek(
        mesocycleId as number,
        activeWeekNumber as number,
      ),
    enabled: !!mesocycleId && !isViewingCurrentWeek,
  });

  const activeMicrocycle = isViewingCurrentWeek
    ? weeklyPlan?.microcycle
    : pastWeekDetail;

  const newWeekMutation = useMutation({
    mutationFn: () =>
      coachService.createMicrocycle(weeklyPlan!.mesocycle_id, {
        week_number: weeklyPlan!.microcycle.week_number + 1,
      }),
    onSuccess: () => {
      setSelectedWeekNumber(null);
      queryClient.invalidateQueries({
        queryKey: ["weekly-plan", selectedClientId],
      });
    },
    onError: () => Alert.alert("Error", "No se pudo crear la nueva semana."),
  });

  const sessionsByDay = new Map<DayOfWeek, WorkoutSession>();
  activeMicrocycle?.workout_sessions?.forEach((session) => {
    if (session.day_of_week) {
      sessionsByDay.set(session.day_of_week, session);
    }
  });

  const goToSession = (day: DayOfWeek) => {
    if (!activeMicrocycle) return;
    const existing = sessionsByDay.get(day);
    if (existing) {
      // Sesión ya guardada: entra en modo edición para poder
      // añadir/quitar ejercicios cuando quiera, no solo verla.
      navigation.navigate("SessionBuilder", { sessionId: existing.id });
    } else {
      navigation.navigate("SessionBuilder", {
        microcycleId: activeMicrocycle.id,
        dayOfWeek: day,
      });
    }
  };

  let weeklyGridContent: React.ReactNode = null;
  if (!selectedClientId) {
    weeklyGridContent = (
      <Text
        style={[
          Typography.body,
          {
            color: Colors.textMuted,
            textAlign: "center",
            marginTop: Spacing.xl,
          },
        ]}
      >
        Selecciona un alumno para ver o crear su plan semanal.
      </Text>
    );
  } else if (loadingPlan && !weeklyPlan) {
    weeklyGridContent = (
      <ActivityIndicator
        color={Colors.primary}
        style={{ marginTop: Spacing.xl }}
      />
    );
  } else if (weeklyPlan) {
    weeklyGridContent = (
      <>
        <View style={[styles.cardRow, { marginBottom: Spacing.sm }]}>
          <View style={styles.weekNavRow}>
            <TouchableOpacity
              style={[
                styles.weekNavButton,
                !canGoPrevWeek && styles.weekNavButtonDisabled,
              ]}
              onPress={() =>
                canGoPrevWeek &&
                setSelectedWeekNumber((activeWeekNumber as number) - 1)
              }
              disabled={!canGoPrevWeek}
            >
              <ChevronLeft
                size={18}
                color={canGoPrevWeek ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
            <Text style={[Typography.h5, { color: Colors.primary }]}>
              Semana {activeWeekNumber}
            </Text>
            <TouchableOpacity
              style={[
                styles.weekNavButton,
                !canGoNextWeek && styles.weekNavButtonDisabled,
              ]}
              onPress={() =>
                canGoNextWeek &&
                setSelectedWeekNumber((activeWeekNumber as number) + 1)
              }
              disabled={!canGoNextWeek}
            >
              <ChevronRight
                size={18}
                color={canGoNextWeek ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => newWeekMutation.mutate()}
            disabled={newWeekMutation.isPending}
          >
            {newWeekMutation.isPending ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.outlineButtonText}>+ Nueva semana</Text>
            )}
          </TouchableOpacity>
        </View>

        {!isViewingCurrentWeek && (
          <TouchableOpacity
            style={styles.backToCurrentBanner}
            onPress={() => setSelectedWeekNumber(null)}
          >
            <Text style={styles.backToCurrentBannerText}>
              Viendo una semana anterior — toca para volver a la vigente (Semana{" "}
              {currentWeekNumber})
            </Text>
          </TouchableOpacity>
        )}

        {!isViewingCurrentWeek && loadingPastWeek ? (
          <ActivityIndicator
            color={Colors.primary}
            style={{ marginTop: Spacing.lg }}
          />
        ) : (
          DAYS_OF_WEEK.map((day) => {
            const session = sessionsByDay.get(day);
            return (
              <TouchableOpacity
                key={day}
                style={styles.dayCard}
                onPress={() => goToSession(day)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayLabel}>{DAY_OF_WEEK_LABELS[day]}</Text>
                  {session ? (
                    <>
                      <Text style={styles.daySessionName}>{session.name}</Text>
                      <Text style={Typography.caption}>
                        {session.session_exercises?.length || 0} ejercicios
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.dayEmptyText}>
                      Sin sesión — toca para crear
                    </Text>
                  )}
                </View>
                {session ? (
                  <Dumbbell size={20} color={Colors.primary} />
                ) : (
                  <Plus size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Planificación Semanal</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Elegí un alumno y armá su semana de entrenamiento.
        </Text>
      </View>

      {/* Client Selector */}
      <View style={[styles.card, { marginBottom: Spacing.lg }]}>
        <Text style={[Typography.label, { marginBottom: Spacing.sm }]}>
          Seleccionar Alumno
        </Text>
        {loadingClients ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.clientRow}
          >
            {myClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientPill,
                  selectedClientId === client.id && styles.clientPillActive,
                ]}
                onPress={() => setSelectedClientId(client.id)}
              >
                <Text
                  style={[
                    styles.clientPillText,
                    selectedClientId === client.id &&
                      styles.clientPillTextActive,
                  ]}
                >
                  {client.name}
                </Text>
              </TouchableOpacity>
            ))}
            {myClients.length === 0 && (
              <Text style={[Typography.body, { color: Colors.textMuted }]}>
                No tienes alumnos asignados.
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Weekly grid */}
      {weeklyGridContent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
  },
  header: {
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.transparent,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientRow: {
    flexDirection: "row",
  },
  clientPill: {
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  clientPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  clientPillText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  clientPillTextActive: {
    color: Colors.white,
  },
  outlineButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  outlineButtonText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  weekNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  weekNavButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  weekNavButtonDisabled: {
    opacity: 0.4,
  },
  backToCurrentBanner: {
    backgroundColor: "rgba(59,130,246,0.12)",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backToCurrentBannerText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  dayCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  dayLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  daySessionName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  dayEmptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
