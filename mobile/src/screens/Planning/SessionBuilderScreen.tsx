import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Trash2, Save, Search, X, ImagePlus } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "../../services/catalogService";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import {
  Exercise,
  DayOfWeek,
  DAYS_OF_WEEK,
  DAY_OF_WEEK_LABELS,
  WeightUnit,
} from "../../types";

const WEIGHT_SLOTS = 3;

// Los pesos se editan como texto (3 casillas fijas); se convierten a número al guardar.
const toWeightInputs = (weights: number[] | null | undefined): string[] =>
  Array.from({ length: WEIGHT_SLOTS }, (_, i) =>
    weights?.[i] != null ? String(weights[i]) : "",
  );

export function SessionBuilderScreen({ route, navigation }: any) {
  const {
    microcycleId,
    dayOfWeek: presetDayOfWeek,
    sessionId,
  }: {
    microcycleId?: number;
    dayOfWeek?: DayOfWeek;
    sessionId?: number;
  } = route.params;
  const isEditMode = !!sessionId;
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [sessionName, setSessionName] = useState("Nueva Sesión");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | null>(
    presetDayOfWeek ?? null,
  );
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMuscle, setNewExerciseMuscle] = useState("");
  const [uploadingExerciseId, setUploadingExerciseId] = useState<number | null>(
    null,
  );

  const { data: exercises = [], isLoading: loadingExercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => catalogService.getExercises(),
  });

  // Modo edición: precarga la sesión ya guardada para poder añadir/quitar
  // ejercicios. La forma local (selectedExercises) reutiliza el mismo shape
  // que produce addExercise, así el resto del componente no distingue entre
  // crear y editar.
  const { data: existingSession, isLoading: loadingSession } = useQuery({
    queryKey: ["session-preview", sessionId],
    queryFn: () => coachService.getSessionPreview(sessionId as number),
    enabled: isEditMode,
  });

  // Precarga los campos del formulario apenas llega la sesión existente,
  // ajustando el estado durante el render (evita el useEffect extra) —
  // solo se dispara una vez, cuando loadedSessionId todavía no coincide.
  const [loadedSessionId, setLoadedSessionId] = useState<number | null>(null);
  if (existingSession && loadedSessionId !== existingSession.id) {
    setLoadedSessionId(existingSession.id);
    setSessionName(existingSession.name);
    setDayOfWeek(existingSession.day_of_week ?? null);
    setSelectedExercises(
      (existingSession.session_exercises ?? []).map((se) => ({
        ...se.exercise,
        exercise_id: se.exercise_id,
        target_sets: se.target_sets ?? 0,
        target_reps: se.target_reps ?? 0,
        target_weights: toWeightInputs(se.target_weights),
        weight_unit: se.weight_unit ?? "kg",
        target_rpe: se.target_rpe ?? 0,
        rest_time_seconds: se.rest_time_seconds ?? 0,
      })),
    );
  }

  const createSessionMutation = useMutation({
    mutationFn: (data: any) =>
      coachService.createSession(microcycleId as number, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-programs"] });
      // PlanningScreen arma la semana desde estas consultas: sin refrescarlas
      // el día seguía viéndose vacío, el coach volvía a tocarlo y se creaba
      // otra sesión el mismo día (duplicadas) en vez de abrir la existente.
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
      queryClient.invalidateQueries({ queryKey: ["microcycle-week"] });
      Alert.alert("Éxito", "Sesión creada correctamente");
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error(
        "Create Session Error:",
        error.response?.data || error.message,
      );
      Alert.alert(
        "Error",
        error.response?.data?.errors?.day_of_week?.[0] ||
          "No se pudo crear la sesión. Revisa los datos e intenta de nuevo.",
      );
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data: any) =>
      coachService.updateSession(sessionId as number, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-programs"] });
      queryClient.invalidateQueries({
        queryKey: ["session-preview", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
      queryClient.invalidateQueries({ queryKey: ["microcycle-week"] });
      Alert.alert("Éxito", "Sesión actualizada correctamente");
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error(
        "Update Session Error:",
        error.response?.data || error.message,
      );
      Alert.alert(
        "Error",
        error.response?.data?.errors?.day_of_week?.[0] ||
          "No se pudo actualizar la sesión. Revisa los datos e intenta de nuevo.",
      );
    },
  });

  const saveMutation = isEditMode
    ? updateSessionMutation
    : createSessionMutation;

  const uploadMediaMutation = useMutation({
    mutationFn: ({
      exerciseId,
      asset,
    }: {
      exerciseId: number;
      asset: { uri: string; name: string; type: string };
    }) => coachService.uploadExerciseMedia(exerciseId, asset),
    onSuccess: (updatedExercise) => {
      // El catálogo es compartido entre coaches: refresca la lista completa...
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      // ...pero los ejercicios ya añadidos a esta sesión son una copia local
      // (selectedExercises) hecha al momento de agregarlos: la invalidación
      // de arriba no la toca, hay que actualizarla a mano o la tarjeta se
      // queda con la miniatura vieja (o sin ninguna).
      setSelectedExercises((current) =>
        current.map((ex) =>
          ex.exercise_id === updatedExercise.id
            ? { ...ex, image_url: updatedExercise.image_url }
            : ex,
        ),
      );
    },
    onError: () => {
      Alert.alert("Error", "No se pudo subir la imagen. Intenta de nuevo.");
    },
    onSettled: () => setUploadingExerciseId(null),
  });

  const createExerciseMutation = useMutation({
    mutationFn: () =>
      coachService.createExercise({
        name: newExerciseName.trim(),
        muscle_group: newExerciseMuscle.trim(),
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setNewExerciseName("");
      setNewExerciseMuscle("");
      setIsCreatingExercise(false);
      addExercise(created);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "No se pudo crear el ejercicio. Intenta de nuevo.",
      );
    },
  });

  const handleCreateExercise = () => {
    if (!newExerciseName.trim() || !newExerciseMuscle.trim()) {
      Alert.alert("Error", "Indica el nombre y el grupo muscular");
      return;
    }
    createExerciseMutation.mutate();
  };

  const pickAndUploadMedia = async (exerciseId: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus fotos para subir la imagen del ejercicio.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const picked = result.assets[0];
    const mimeType = picked.mimeType || "image/jpeg";
    const extension = mimeType.split("/")[1] || "jpg";

    setUploadingExerciseId(exerciseId);
    uploadMediaMutation.mutate({
      exerciseId,
      asset: {
        uri: picked.uri,
        name: picked.fileName || `ejercicio-${exerciseId}.${extension}`,
        type: mimeType,
      },
    });
  };

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addExercise = (ex: Exercise) => {
    setSelectedExercises((current) => [
      ...current,
      {
        ...ex,
        exercise_id: ex.id,
        target_sets: 3,
        target_reps: 10,
        target_weights: toWeightInputs(null),
        weight_unit: "kg" as WeightUnit,
        target_rpe: 8,
        rest_time_seconds: 90,
      },
    ]);
    setIsExerciseModalVisible(false);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExerciseData = (index: number, field: string, value: any) => {
    setSelectedExercises((current) =>
      current.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  };

  const updateWeight = (index: number, slot: number, value: string) => {
    const weights = [...selectedExercises[index].target_weights];
    weights[slot] = value.replace(",", ".");
    updateExerciseData(index, "target_weights", weights);
  };

  const handleSave = () => {
    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Añade al menos un ejercicio");
      return;
    }
    saveMutation.mutate({
      name: sessionName,
      day_of_week: dayOfWeek,
      exercises: selectedExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        target_sets: parseInt(String(ex.target_sets)) || 0,
        target_reps: parseInt(String(ex.target_reps)) || 0,
        target_weights: (ex.target_weights as string[])
          .map((w) => parseFloat(w))
          .filter((w) => !isNaN(w) && w >= 0),
        weight_unit: ex.weight_unit,
        target_rpe: parseInt(String(ex.target_rpe)) || 0,
        rest_time_seconds: parseInt(String(ex.rest_time_seconds)) || 0,
      })),
    });
  };

  if (isEditMode && loadingSession) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100 + insets.bottom },
        ]}
      >
        <View style={styles.section}>
          <Text style={Typography.label}>Nombre de la Sesión</Text>
          <TextInput
            style={styles.input}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="Ej. Empuje A"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={Typography.label}>Día de la semana (Opcional)</Text>
          <View style={styles.dayChipsRow}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  dayOfWeek === day && styles.dayChipActive,
                ]}
                onPress={() =>
                  setDayOfWeek((current) => (current === day ? null : day))
                }
              >
                <Text
                  style={[
                    styles.dayChipText,
                    dayOfWeek === day && styles.dayChipTextActive,
                  ]}
                >
                  {DAY_OF_WEEK_LABELS[day].slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={Typography.h5}>Ejercicios</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsExerciseModalVisible(true)}
          >
            <Plus size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        {selectedExercises.map((ex, index) => (
          <View key={index} style={styles.exerciseCard}>
            <View style={styles.cardHeader}>
              {ex.image_url ? (
                <Image
                  source={{ uri: ex.image_url }}
                  style={styles.exerciseThumbnailSmall}
                />
              ) : (
                <TouchableOpacity
                  style={styles.exerciseThumbnailPlaceholderSmall}
                  onPress={() => pickAndUploadMedia(ex.exercise_id)}
                  disabled={uploadingExerciseId === ex.exercise_id}
                  accessibilityRole="button"
                  accessibilityLabel={`Subir imagen de referencia para ${ex.name}`}
                >
                  {uploadingExerciseId === ex.exercise_id ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <ImagePlus size={16} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              )}
              <Text
                style={[Typography.body, { fontWeight: "700", flex: 1 }]}
                numberOfLines={1}
              >
                {ex.name}
              </Text>
              <TouchableOpacity onPress={() => removeExercise(index)}>
                <Trash2 size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>

            <View style={[styles.paramsRow, { marginBottom: Spacing.md }]}>
              <View style={styles.paramGroup}>
                <Text style={styles.paramLabel}>Series</Text>
                <TextInput
                  style={styles.paramInput}
                  keyboardType="numeric"
                  value={String(ex.target_sets)}
                  onChangeText={(v) =>
                    updateExerciseData(index, "target_sets", v)
                  }
                />
              </View>
              <View style={styles.paramGroup}>
                <Text style={styles.paramLabel}>Reps</Text>
                <TextInput
                  style={styles.paramInput}
                  keyboardType="numeric"
                  value={String(ex.target_reps)}
                  onChangeText={(v) =>
                    updateExerciseData(index, "target_reps", v)
                  }
                />
              </View>
            </View>

            <View style={styles.weightsHeader}>
              <Text style={styles.paramLabel}>Peso aprox.</Text>
              <View style={styles.unitToggle}>
                {(["kg", "lb"] as WeightUnit[]).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitOption,
                      ex.weight_unit === unit && styles.unitOptionActive,
                    ]}
                    onPress={() =>
                      updateExerciseData(index, "weight_unit", unit)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Usar ${unit === "kg" ? "kilogramos" : "libras"}`}
                  >
                    <Text
                      style={[
                        styles.unitOptionText,
                        ex.weight_unit === unit && styles.unitOptionTextActive,
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.paramsRow, { marginBottom: Spacing.md }]}>
              {(ex.target_weights as string[]).map((w, slot) => (
                <View key={slot} style={styles.paramGroup}>
                  <TextInput
                    style={styles.paramInput}
                    keyboardType="decimal-pad"
                    value={w}
                    placeholder={`Peso ${slot + 1}`}
                    placeholderTextColor={Colors.textMuted}
                    onChangeText={(v) => updateWeight(index, slot, v)}
                  />
                </View>
              ))}
            </View>

            <View style={styles.paramsRow}>
              <View style={styles.paramGroup}>
                <Text style={styles.paramLabel}>RPE</Text>
                <TextInput
                  style={styles.paramInput}
                  keyboardType="numeric"
                  value={String(ex.target_rpe)}
                  onChangeText={(v) =>
                    updateExerciseData(index, "target_rpe", v)
                  }
                />
              </View>
              <View style={styles.paramGroup}>
                <Text style={styles.paramLabel}>Descanso (s)</Text>
                <TextInput
                  style={styles.paramInput}
                  keyboardType="numeric"
                  value={String(ex.rest_time_seconds)}
                  onChangeText={(v) =>
                    updateExerciseData(index, "rest_time_seconds", v)
                  }
                />
              </View>
            </View>
          </View>
        ))}

        {selectedExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ color: Colors.textMuted }}>
              No hay ejercicios añadidos.
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, { bottom: Spacing.lg + insets.bottom }]}
        onPress={handleSave}
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Save size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>
              {isEditMode ? "Guardar Cambios" : "Guardar Sesión Completa"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Modal Ejercicios */}
      <Modal visible={isExerciseModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={Typography.h4}>Catálogo</Text>
                <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                  Selecciona un ejercicio para añadirlo
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsExerciseModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o grupo..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isCreatingExercise ? (
              <View style={styles.createForm}>
                <TextInput
                  style={styles.input}
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  placeholder="Nombre (ej. Hip Thrust)"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={100}
                />
                <TextInput
                  style={styles.input}
                  value={newExerciseMuscle}
                  onChangeText={setNewExerciseMuscle}
                  placeholder="Grupo muscular (ej. Glúteos)"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={50}
                />
                <View style={styles.createFormActions}>
                  <TouchableOpacity
                    style={[styles.createFormButton, styles.createFormCancel]}
                    onPress={() => setIsCreatingExercise(false)}
                  >
                    <Text style={styles.createFormCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createFormButton}
                    onPress={handleCreateExercise}
                    disabled={createExerciseMutation.isPending}
                  >
                    {createExerciseMutation.isPending ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.addButtonText}>Crear y añadir</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.newExerciseButton}
                onPress={() => {
                  setNewExerciseName(searchQuery);
                  setIsCreatingExercise(true);
                }}
              >
                <Plus size={18} color={Colors.primary} />
                <Text style={styles.newExerciseButtonText}>
                  Crear ejercicio nuevo
                </Text>
              </TouchableOpacity>
            )}

            {loadingExercises ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[Typography.caption, { marginTop: 10 }]}>
                  Cargando biblioteca...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.exerciseList}
                showsVerticalScrollIndicator={false}
              >
                {filteredExercises.map((ex) => (
                  <View key={ex.id} style={styles.exerciseItem}>
                    {ex.image_url ? (
                      <Image
                        source={{ uri: ex.image_url }}
                        style={styles.exerciseThumbnail}
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.exerciseThumbnailPlaceholder}
                        onPress={() => pickAndUploadMedia(ex.id)}
                        disabled={uploadingExerciseId === ex.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Subir imagen de referencia para ${ex.name}`}
                      >
                        {uploadingExerciseId === ex.id ? (
                          <ActivityIndicator
                            size="small"
                            color={Colors.primary}
                          />
                        ) : (
                          <ImagePlus size={18} color={Colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.exerciseMainInfo}
                      onPress={() => addExercise(ex)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.exerciseNameText}>{ex.name}</Text>
                      <View
                        style={[
                          styles.muscleBadge,
                          {
                            backgroundColor:
                              getMuscleColor(ex.muscle_group) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.muscleBadgeText,
                            { color: getMuscleColor(ex.muscle_group) },
                          ]}
                        >
                          {ex.muscle_group}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {ex.image_url && (
                      <TouchableOpacity
                        onPress={() => pickAndUploadMedia(ex.id)}
                        disabled={uploadingExerciseId === ex.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Reemplazar imagen de referencia de ${ex.name}`}
                        style={{ marginRight: Spacing.sm }}
                      >
                        {uploadingExerciseId === ex.id ? (
                          <ActivityIndicator
                            size="small"
                            color={Colors.primary}
                          />
                        ) : (
                          <ImagePlus size={16} color={Colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.addIconContainer}
                      onPress={() => addExercise(ex)}
                    >
                      <Plus size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}

                {filteredExercises.length === 0 && (
                  <View style={styles.modalEmptyState}>
                    <Text style={{ color: Colors.textMuted }}>
                      No se encontraron resultados para &quot;{searchQuery}
                      &quot;
                    </Text>
                  </View>
                )}
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.base, paddingBottom: 100 },
  section: { marginBottom: Spacing.md },
  input: {
    backgroundColor: Colors.bgCard,
    color: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: 8,
  },
  addButtonText: { color: Colors.white, fontWeight: "700" },
  dayChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dayChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipText: {
    color: Colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  dayChipTextActive: {
    color: Colors.white,
  },
  exerciseCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  paramsRow: { flexDirection: "row", gap: Spacing.md },
  weightsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  unitToggle: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  unitOption: { paddingHorizontal: Spacing.md, paddingVertical: 4 },
  unitOptionActive: { backgroundColor: Colors.primary },
  unitOptionText: { color: Colors.textMuted, fontWeight: "700", fontSize: 12 },
  unitOptionTextActive: { color: Colors.white },
  newExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  newExerciseButtonText: { color: Colors.primary, fontWeight: "700" },
  createForm: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  createFormActions: { flexDirection: "row", gap: Spacing.sm },
  createFormButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  createFormCancel: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createFormCancelText: { color: Colors.textSecondary, fontWeight: "700" },
  paramGroup: { flex: 1 },
  paramLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: "700",
  },
  paramInput: {
    backgroundColor: Colors.bg,
    color: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: 8,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.success,
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 4,
  },
  saveButtonText: { color: Colors.white, fontWeight: "800", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40, 40, 40, 0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: "90%",
    paddingTop: Spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  exerciseList: {
    paddingHorizontal: Spacing.lg,
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseMainInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseThumbnailSmall: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  exerciseThumbnailPlaceholderSmall: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  exerciseThumbnail: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  exerciseThumbnailPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  muscleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  muscleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalEmptyState: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyState: { padding: Spacing.xl, alignItems: "center" },
});

const getMuscleColor = (group: string) => {
  const g = group.toLowerCase();
  if (g.includes("pecho")) return Colors.primary;
  if (g.includes("espalda")) return Colors.purple;
  if (g.includes("pierna") || g.includes("isquios") || g.includes("cuadriceps"))
    return Colors.success;
  if (g.includes("hombro")) return Colors.orange;
  if (g.includes("brazo") || g.includes("biceps") || g.includes("triceps"))
    return Colors.info;
  return Colors.textMuted;
};
