import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  LayoutAnimation,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import {
  Play,
  Dumbbell,
  Save,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutService } from "../../services/workoutService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import { Program, WorkoutSession, DAY_OF_WEEK_LABELS } from "../../types";

export const WorkoutScreen = () => {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const [exerciseSets, setExerciseSets] = useState<Record<number, any[]>>({});
  const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(
    null,
  );
  // Un comentario por ejercicio (no por set), clave = session_exercise.id.
  const [exerciseNotes, setExerciseNotes] = useState<Record<number, string>>(
    {},
  );
  // Imagen de referencia bajo demanda: no se pide/renderiza hasta que el
  // asesorado toca el ojo. expo-image cachea en disco, así que una vez
  // vista no se vuelve a descargar aunque se cierre y reabra el modal.
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 1. Obtener programa activo
  const { data: activeProgram, isLoading: loadingProgram } = useQuery({
    queryKey: ["active-program"],
    queryFn: () => workoutService.getActiveProgram(),
  });

  // 2. Obtener detalles de la sesión seleccionada
  const { data: sessionDetails, isLoading: loadingSession } = useQuery({
    queryKey: ["session-details", selectedSessionId],
    queryFn: () =>
      selectedSessionId
        ? workoutService.getSessionDetails(selectedSessionId)
        : Promise.resolve(null),
    enabled: !!selectedSessionId,
  });

  // Inicializar series cuando se carga la sesión
  useEffect(() => {
    if (sessionDetails?.session_exercises) {
      const initialSets: Record<number, any[]> = {};
      sessionDetails.session_exercises.forEach((se) => {
        const setsCount = se.target_sets || 3;
        initialSets[se.id] = Array.from({ length: setsCount }, (_, i) => ({
          set_number: i + 1,
          weight_kg: "",
          reps_performed: String(se.target_reps || ""),
          completed: false,
          exercise_id: se.exercise_id,
        }));
      });
      setExerciseSets(initialSets);
      setExerciseNotes({});
    }
  }, [sessionDetails]);

  const toggleExercise = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
  };

  const updateSetData = (
    exerciseId: number,
    setIndex: number,
    field: string,
    value: any,
  ) => {
    const updated = { ...exerciseSets };
    updated[exerciseId][setIndex][field] = value;
    if ((field === "weight_kg" || field === "reps_performed") && value !== "") {
      updated[exerciseId][setIndex].completed = true;
    }
    setExerciseSets(updated);
  };

  const handleFinishWorkout = () => {
    const allSets: any[] = [];
    Object.keys(exerciseSets).forEach((exId) => {
      const notes = exerciseNotes[Number(exId)]?.trim() || null;
      exerciseSets[Number(exId)].forEach((set) => {
        if (set.completed) {
          allSets.push({
            exercise_id: set.exercise_id,
            set_number: set.set_number,
            weight_kg: parseFloat(set.weight_kg) || 0,
            reps_performed: parseInt(set.reps_performed) || 0,
            notes,
          });
        }
      });
    });

    if (allSets.length === 0) {
      Alert.alert("Aviso", "Marca al menos una serie como completada.");
      return;
    }

    finishSessionMutation.mutate({
      workout_session_id: selectedSessionId,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      sets: allSets,
    });
  };

  const finishSessionMutation = useMutation({
    mutationFn: async (executionData: any) => {
      await workoutService.storeExecution(executionData);
    },
    onSuccess: () => {
      Alert.alert("¡Excelente!", "Entrenamiento guardado con éxito.");
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
      setSelectedSessionId(null);
    },
    onError: () => {
      Alert.alert("Error", "No se pudo guardar el entrenamiento.");
    },
  });

  if (loadingProgram) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!activeProgram) {
    return (
      <View style={[styles.container, styles.center, { padding: Spacing.xl }]}>
        <Dumbbell size={64} color={Colors.textMuted} />
        <Text
          style={[
            Typography.h4,
            { textAlign: "center", marginTop: Spacing.lg, color: Colors.white },
          ]}
        >
          No tienes un programa activo
        </Text>
        <Text
          style={[
            Typography.body,
            { textAlign: "center", color: Colors.textMuted, marginTop: 8 },
          ]}
        >
          Contacta a tu coach para que asigne tu planificación.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 120}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={Typography.h3}>Mi Entrenamiento</Text>
          <Text style={[Typography.bodySmall, { color: Colors.primary }]}>
            {activeProgram.name}
          </Text>
        </View>

        {/* Selector de Sesión */}
        {!selectedSessionId ? (
          <View>
            <Text style={[Typography.h5, { marginBottom: Spacing.md }]}>
              Selecciona tu sesión de hoy:
            </Text>
            {activeProgram.mesocycles?.[0]?.microcycles?.[0]?.workout_sessions?.map(
              (session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionSelectCard}
                  onPress={() => setSelectedSessionId(session.id)}
                >
                  <View>
                    <Text style={styles.sessionSelectTitle}>
                      {session.name}
                    </Text>
                    <Text style={Typography.caption}>
                      {(session.day_of_week &&
                        DAY_OF_WEEK_LABELS[session.day_of_week]) ||
                        "Día flexible"}{" "}
                      • {session.session_exercises?.length || 0} ejercicios
                    </Text>
                  </View>
                  <Play size={20} color={Colors.primary} />
                </TouchableOpacity>
              ),
            )}
          </View>
        ) : loadingSession ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <>
            <View style={styles.sessionHeaderRow}>
              <Text style={Typography.h4}>{sessionDetails?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedSessionId(null)}>
                <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                  Cambiar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista de Ejercicios */}
            <View style={{ gap: Spacing.md }}>
              {sessionDetails?.session_exercises?.map((se) => (
                <View key={se.id} style={styles.exerciseExpandableCard}>
                  <View style={styles.exerciseHeader}>
                    <TouchableOpacity
                      style={styles.exerciseHeaderMain}
                      onPress={() => toggleExercise(se.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.exerciseIcon}>
                        <Dumbbell size={20} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseTitle}>
                          {se.exercise?.name}
                        </Text>
                        <Text style={Typography.caption}>
                          Objetivo: {se.target_sets} x {se.target_reps} @RPE{" "}
                          {se.target_rpe}
                        </Text>
                        {!!se.rest_time_seconds && (
                          <View style={styles.restRow}>
                            <Clock size={11} color={Colors.textMuted} />
                            <Text style={styles.restText}>
                              Descanso: {se.rest_time_seconds}s
                            </Text>
                          </View>
                        )}
                      </View>
                      {expandedExerciseId === se.id ? (
                        <ChevronUp size={20} color={Colors.textMuted} />
                      ) : (
                        <ChevronDown size={20} color={Colors.textMuted} />
                      )}
                    </TouchableOpacity>

                    {!!se.exercise?.image_url && (
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                          setPreviewImageUrl(se.exercise!.image_url)
                        }
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Eye size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {expandedExerciseId === se.id && (
                    <View style={styles.setsContainer}>
                      <View style={styles.setsHeader}>
                        <Text style={[styles.setHeaderText, { width: 40 }]}>
                          SET
                        </Text>
                        <Text style={[styles.setHeaderText, { flex: 1 }]}>
                          PESO (KG)
                        </Text>
                        <Text style={[styles.setHeaderText, { flex: 1 }]}>
                          REPS
                        </Text>
                        <View style={{ width: 40 }} />
                      </View>

                      {exerciseSets[se.id]?.map((set, idx) => (
                        <View key={idx} style={styles.setRow}>
                          <Text style={styles.setNumber}>{set.set_number}</Text>
                          <TextInput
                            style={styles.setInput}
                            placeholder="0"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="numeric"
                            value={set.weight_kg}
                            onChangeText={(v) =>
                              updateSetData(se.id, idx, "weight_kg", v)
                            }
                          />
                          <TextInput
                            style={styles.setInput}
                            placeholder="0"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="numeric"
                            value={set.reps_performed}
                            onChangeText={(v) =>
                              updateSetData(se.id, idx, "reps_performed", v)
                            }
                          />
                          <TouchableOpacity
                            onPress={() =>
                              updateSetData(
                                se.id,
                                idx,
                                "completed",
                                !set.completed,
                              )
                            }
                            style={[
                              styles.checkButton,
                              set.completed && styles.checkButtonActive,
                            ]}
                          >
                            <CheckCircle
                              size={20}
                              color={
                                set.completed ? Colors.white : Colors.border
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      ))}

                      <Text style={styles.notesLabel}>
                        Comentario sobre este ejercicio
                      </Text>
                      <TextInput
                        style={styles.notesInput}
                        placeholder="¿Cómo te sentiste, alguna molestia, ajuste para la próxima?"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        value={exerciseNotes[se.id] || ""}
                        onChangeText={(v) =>
                          setExerciseNotes((prev) => ({ ...prev, [se.id]: v }))
                        }
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Finish button */}
            <TouchableOpacity
              style={styles.finishButton}
              activeOpacity={0.8}
              onPress={handleFinishWorkout}
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
                    Registrar Entrenamiento
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity
            style={styles.imagePreviewClose}
            onPress={() => setPreviewImageUrl(null)}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.imagePreview}
              contentFit="contain"
              cachePolicy="disk"
              transition={150}
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: 200,
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewClose: {
    position: "absolute",
    top: Spacing.xl,
    right: Spacing.lg,
    zIndex: 1,
    padding: Spacing.sm,
  },
  imagePreview: {
    width: "100%",
    height: "70%",
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  sessionSelectCard: {
    backgroundColor: Colors.bgCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  sessionSelectTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  exerciseExpandableCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: Spacing.md,
  },
  exerciseHeaderMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  exerciseTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  restRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  restText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  setsContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  setsHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  setHeaderText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  setNumber: {
    width: 40,
    textAlign: "center",
    color: Colors.white,
    fontWeight: "700",
  },
  setInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    color: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: 8,
    textAlign: "center",
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkButtonActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  notesLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: Colors.bg,
    color: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 60,
    textAlignVertical: "top",
  },
  finishButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
