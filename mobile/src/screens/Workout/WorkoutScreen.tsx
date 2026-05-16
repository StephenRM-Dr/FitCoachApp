import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Play, Dumbbell, Save, Clock, CheckCircle } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutService } from "../../services/workoutService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const EXERCISES = [
  { name: "Sentadilla con Barra", sets: "3 x 10", weight: "100 kg" },
  { name: "Remo con Pendlay", sets: "3 x 12", weight: "60 kg" },
  { name: "Facepulls", sets: "3 x 15", weight: "20 kg" },
];

export const WorkoutScreen = () => {
  const queryClient = useQueryClient();

  const finishSessionMutation = useMutation({
    mutationFn: async () => {
      // Mocking the completion of the current exercise for the MVP
      await workoutService.saveWorkoutLog({
        exercise_name: "Press de Banca",
        sets: 4,
        reps: 8,
        weight_kg: 85,
        rpe: 8,
        rir: 2,
        session_date: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      Alert.alert("¡Excelente!", "Entrenamiento guardado con éxito.");
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
    },
    onError: () => {
      Alert.alert("Error", "No se pudo guardar el entrenamiento.");
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Entrenamiento</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Sesión actual: Fuerza Base A
        </Text>
      </View>

      {/* Current Exercise Card */}
      <View style={styles.currentExercise}>
        <View style={styles.currentExHeader}>
          <Text style={styles.currentExName}>Press de Banca</Text>
          <View style={styles.currentExBadge}>
            <Text style={styles.currentExBadgeText}>4 Series x 8 Reps</Text>
          </View>
        </View>

        <View style={styles.currentExStats}>
          <View>
            <Text style={styles.currentExLabel}>PESO</Text>
            <Text style={styles.currentExValue}>85 kg</Text>
          </View>
          <View>
            <Text style={styles.currentExLabel}>RPE OBJETIVO</Text>
            <Text style={styles.currentExValue}>8</Text>
          </View>
          <View>
            <Text style={styles.currentExLabel}>DESCANSO</Text>
            <Text style={styles.currentExValue}>3 min</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
          <Play size={20} color={Colors.primary} fill={Colors.primary} />
          <Text style={styles.startButtonText}>Iniciar Serie 1</Text>
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Clock size={18} color={Colors.textSecondary} />
          <Text style={[Typography.label, { marginLeft: Spacing.sm }]}>
            Progreso de la Sesión
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: "25%" }]} />
        </View>
        <Text style={Typography.caption}>1 de 4 ejercicios completados</Text>
      </View>

      {/* Next Exercises */}
      <View style={styles.card}>
        <Text style={[Typography.h5, { marginBottom: Spacing.md }]}>
          Próximos Ejercicios
        </Text>
        {EXERCISES.map((ex, i) => (
          <View
            key={i}
            style={[
              styles.exerciseRow,
              i < EXERCISES.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              },
            ]}
          >
            <View style={styles.exerciseIcon}>
              <Dumbbell size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.exerciseInfo}>
              <Text
                style={[Typography.body, { fontWeight: "600", fontSize: 14 }]}
              >
                {ex.name}
              </Text>
              <Text style={Typography.caption}>{ex.sets}</Text>
            </View>
            <Text
              style={[Typography.body, { fontWeight: "700", fontSize: 14 }]}
            >
              {ex.weight}
            </Text>
          </View>
        ))}
      </View>

      {/* Finish button */}
      <TouchableOpacity
        style={styles.finishButton}
        activeOpacity={0.8}
        onPress={() => finishSessionMutation.mutate()}
        disabled={finishSessionMutation.isPending}
      >
        {finishSessionMutation.isPending ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Save size={20} color={Colors.white} />
            <Text
              style={[
                Typography.buttonText,
                { color: Colors.white, marginLeft: Spacing.sm },
              ]}
            >
              Finalizar Sesión
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

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
  currentExercise: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  currentExHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  currentExName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
  },
  currentExBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  currentExBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  currentExStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  currentExLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentExValue: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
  },
  startButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  startButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  progressCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  finishButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
