import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Dumbbell, Eye } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "@react-navigation/native";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export function SessionPreviewScreen() {
  const route = useRoute<any>();
  const { sessionId } = route.params;

  const { data: session, isLoading } = useQuery({
    queryKey: ["session-preview", sessionId],
    queryFn: () => coachService.getSessionPreview(sessionId),
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Eye size={16} color={Colors.primary} />
        <Text style={styles.bannerText}>
          Solo lectura — así la verá tu alumno
        </Text>
      </View>

      <Text style={[Typography.h3, { marginBottom: Spacing.lg }]}>
        {session?.name}
      </Text>

      <View style={{ gap: Spacing.md }}>
        {session?.session_exercises?.map((se) => (
          <View key={se.id} style={styles.exerciseCard}>
            <View style={styles.exerciseIcon}>
              <Dumbbell size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exerciseTitle}>{se.exercise?.name}</Text>
              <Text style={Typography.caption}>
                Objetivo: {se.target_sets} x {se.target_reps} @RPE{" "}
                {se.target_rpe}
              </Text>
              {se.rest_time_seconds != null && (
                <Text style={Typography.caption}>
                  Descanso: {se.rest_time_seconds}s
                </Text>
              )}
            </View>
          </View>
        ))}
        {!session?.session_exercises?.length && (
          <Text style={[Typography.body, { color: Colors.textMuted }]}>
            Esta sesión no tiene ejercicios cargados.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  bannerText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
