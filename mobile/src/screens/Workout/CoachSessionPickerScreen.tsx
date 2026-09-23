import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Dumbbell, ChevronRight, Eye } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export function CoachSessionPickerScreen() {
  const navigation = useNavigation<any>();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: myClients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["my-clients"],
    queryFn: () => coachService.getMyClients(),
  });

  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ["client-programs", selectedClientId],
    queryFn: () => coachService.getClientPrograms(selectedClientId!),
    enabled: !!selectedClientId,
  });

  const sessions = programs.flatMap((program) =>
    (program.mesocycles || []).flatMap((meso) =>
      (meso.microcycles || []).flatMap((micro) =>
        (micro.workout_sessions || []).map((session) => ({
          session,
          context: `${meso.name} · Semana ${micro.week_number}`,
        })),
      ),
    ),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Vista Previa de Sesiones</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Revisa cómo se ve una sesión que planificaste, en solo lectura.
        </Text>
      </View>

      {/* Client Selector */}
      <View style={styles.card}>
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

      {/* Session List */}
      {selectedClientId && (
        <View style={styles.card}>
          <Text style={[Typography.label, { marginBottom: Spacing.sm }]}>
            Sesiones Planificadas
          </Text>
          {loadingPrograms ? (
            <ActivityIndicator color={Colors.primary} />
          ) : sessions.length === 0 ? (
            <Text style={[Typography.body, { color: Colors.textMuted }]}>
              Este alumno todavía no tiene sesiones planificadas.
            </Text>
          ) : (
            sessions.map(({ session, context }, index) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.sessionRow,
                  index < sessions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("SessionPreview", {
                    sessionId: session.id,
                  })
                }
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
                    {context} · {session.session_exercises?.length || 0}{" "}
                    ejercicios
                  </Text>
                </View>
                <Eye size={16} color={Colors.textMuted} />
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>
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
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
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
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
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
});
