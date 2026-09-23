import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Activity,
  Target,
  TrendingUp,
  Calendar,
  Dumbbell,
  ChevronRight,
  Users,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { workoutService } from "../../services/workoutService";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import { DAY_OF_WEEK_LABELS } from "../../types";

export function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const isCoach = user?.role === "coach";

  const { data: activeProgram } = useQuery({
    queryKey: ["active-program"],
    queryFn: () => workoutService.getActiveProgram(),
    enabled: !isCoach,
  });

  const { data: executionHistory = [] } = useQuery({
    queryKey: ["execution-history"],
    queryFn: () => workoutService.getExecutionHistory(1, 20),
    enabled: !isCoach,
  });

  const { data: myClients = [] } = useQuery({
    queryKey: ["my-clients"],
    queryFn: () => coachService.getMyClients(),
    enabled: isCoach,
  });

  const currentMesocycle = activeProgram?.mesocycles?.[0];
  const upcomingSessions =
    currentMesocycle?.microcycles?.[0]?.workout_sessions || [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentExecutions = executionHistory.filter(
    (e) => e.completed_at && new Date(e.completed_at) >= sevenDaysAgo,
  );
  // Ordenado desc por completed_at desde el backend (history()).
  const lastExecution = executionHistory[0];
  const weeklyVolume = recentExecutions.reduce(
    (total, e) => total + (e.execution_sets?.length || 0),
    0,
  );
  const rpeValues = recentExecutions
    .map((e) => e.session_rpe)
    .filter((v): v is number => v != null);
  const avgRpe = rpeValues.length
    ? (rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length).toFixed(1)
    : null;

  let trainingLoadContent: React.ReactNode;
  if (recentExecutions.length > 0) {
    trainingLoadContent = (
      <View style={styles.statsBox}>
        <View style={styles.statRow}>
          <Text style={Typography.bodySmall}>Volumen Semanal</Text>
          <Text style={[Typography.body, { fontWeight: "700" }]}>
            {weeklyVolume} series
          </Text>
        </View>
        <View
          style={[
            styles.statRow,
            { borderTopWidth: 1, borderTopColor: Colors.border },
          ]}
        >
          <Text style={Typography.bodySmall}>RPE Promedio</Text>
          <Text
            style={[
              Typography.body,
              { fontWeight: "700", color: Colors.warning },
            ]}
          >
            {avgRpe ?? "--"}
          </Text>
        </View>
      </View>
    );
  } else if (lastExecution) {
    trainingLoadContent = (
      <View style={styles.statsBox}>
        <View style={styles.statRow}>
          <Text style={Typography.bodySmall}>Último entrenamiento</Text>
          <Text style={[Typography.body, { fontWeight: "700" }]}>
            {lastExecution.workout_session?.name || "Sesión"}
          </Text>
        </View>
        {lastExecution.completed_at && (
          <View
            style={[
              styles.statRow,
              { borderTopWidth: 1, borderTopColor: Colors.border },
            ]}
          >
            <Text style={Typography.bodySmall}>Fecha</Text>
            <Text
              style={[
                Typography.body,
                { fontWeight: "700", color: Colors.textMuted },
              ]}
            >
              {new Date(lastExecution.completed_at).toLocaleDateString(
                "es-ES",
                {
                  day: "2-digit",
                  month: "short",
                },
              )}
            </Text>
          </View>
        )}
      </View>
    );
  } else {
    trainingLoadContent = (
      <Text style={[Typography.bodySmall, { padding: Spacing.md }]}>
        Sin entrenamientos registrados esta semana.
      </Text>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.header}>
        <Text style={Typography.h2}>
          ¡Hola, {user?.name?.split(" ")[0] || "Atleta"}!
        </Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          {isCoach
            ? "Resumen de tus alumnos y su planificación."
            : "Tu resumen de entrenamiento personalizado."}
        </Text>
      </View>

      {isCoach ? (
        <>
          {/* Coach: resumen de alumnos */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Users
                color={Colors.primary}
                size={24}
                style={{ marginBottom: Spacing.sm }}
              />
              <Text style={Typography.caption}>Alumnos activos</Text>
              <Text style={[Typography.h5, { color: Colors.primary }]}>
                {myClients.length}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Users color={Colors.purple} size={20} />
              <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>
                Mis Alumnos
              </Text>
            </View>
            {myClients.length === 0 ? (
              <Text style={[Typography.bodySmall, { padding: Spacing.md }]}>
                Aún no tienes alumnos asignados.
              </Text>
            ) : (
              myClients.slice(0, 5).map((client, index) => (
                <View
                  key={client.id}
                  style={[
                    styles.sessionRow,
                    index < Math.min(myClients.length, 5) - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                    },
                  ]}
                >
                  <View style={styles.sessionIcon}>
                    <Users size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text
                      style={[
                        Typography.body,
                        { fontWeight: "600", fontSize: 14 },
                      ]}
                    >
                      {client.name}
                    </Text>
                    <Text style={Typography.caption}>{client.email}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Planning")}
          >
            <Text style={[Typography.buttonText, { color: Colors.white }]}>
              Ir a Planificación
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Cliente: resumen de programa activo */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Activity
                color={Colors.primary}
                size={24}
                style={{ marginBottom: Spacing.sm }}
              />
              <Text style={Typography.caption}>Programa</Text>
              <Text
                style={[Typography.h5, { color: Colors.primary }]}
                numberOfLines={1}
              >
                {activeProgram?.name || "Sin asignar"}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Target
                color={Colors.success}
                size={24}
                style={{ marginBottom: Spacing.sm }}
              />
              <Text style={Typography.caption}>Mesociclo</Text>
              <Text
                style={[Typography.h5, { color: Colors.success }]}
                numberOfLines={1}
              >
                {currentMesocycle?.name || "--"}
              </Text>
            </View>
          </View>

          {/* Training Load */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp color={Colors.info} size={20} />
              <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>
                Carga de Entrenamiento (7 días)
              </Text>
            </View>
            {trainingLoadContent}
          </View>

          {/* Upcoming Sessions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar color={Colors.purple} size={20} />
              <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>
                Próximas Sesiones
              </Text>
            </View>
            {upcomingSessions.length === 0 ? (
              <Text style={[Typography.bodySmall, { padding: Spacing.md }]}>
                No hay sesiones planificadas en tu microciclo actual.
              </Text>
            ) : (
              upcomingSessions.map((session, index) => (
                <TouchableOpacity
                  key={session.id}
                  style={[
                    styles.sessionRow,
                    index < upcomingSessions.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Workout")}
                >
                  <View style={styles.sessionIcon}>
                    <Dumbbell size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text
                      style={[
                        Typography.body,
                        { fontWeight: "600", fontSize: 14 },
                      ]}
                    >
                      {session.name}
                    </Text>
                    <Text style={Typography.caption}>
                      {(session.day_of_week &&
                        DAY_OF_WEEK_LABELS[session.day_of_week]) ||
                        "Día flexible"}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Workout")}
          >
            <Text style={[Typography.buttonText, { color: Colors.white }]}>
              Ver Microciclo Actual
            </Text>
          </TouchableOpacity>
        </>
      )}
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
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statsBox: {
    backgroundColor: Colors.bg,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
