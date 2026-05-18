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
} from "react-native";
import { Plus, Trash2, Save, Search, X } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "../../services/catalogService";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import { Exercise } from "../../types";

export function SessionBuilderScreen({ route, navigation }: any) {
  const { microcycleId } = route.params;
  const queryClient = useQueryClient();

  const [sessionName, setSessionName] = useState("Nueva Sesión");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: exercises = [], isLoading: loadingExercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => catalogService.getExercises(),
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => coachService.createSession(microcycleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-programs"] });
      Alert.alert("Éxito", "Sesión creada correctamente");
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error("Create Session Error:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudo crear la sesión. Revisa los datos e intenta de nuevo.");
    },
  });

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addExercise = (ex: Exercise) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        ...ex,
        exercise_id: ex.id,
        target_sets: 3,
        target_reps: 10,
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
    const updated = [...selectedExercises];
    updated[index][field] = value;
    setSelectedExercises(updated);
  };

  const handleSave = () => {
    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Añade al menos un ejercicio");
      return;
    }
    createSessionMutation.mutate({
      name: sessionName,
      day_of_week: dayOfWeek,
      exercises: selectedExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        target_sets: parseInt(String(ex.target_sets)) || 0,
        target_reps: parseInt(String(ex.target_reps)) || 0,
        target_rpe: parseInt(String(ex.target_rpe)) || 0,
        rest_time_seconds: parseInt(String(ex.rest_time_seconds)) || 0,
      })),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
          <Text style={Typography.label}>Día (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={dayOfWeek}
            onChangeText={setDayOfWeek}
            placeholder="Ej. Lunes"
            placeholderTextColor={Colors.textMuted}
          />
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
              <Text style={[Typography.body, { fontWeight: "700", flex: 1 }]}>
                {ex.name}
              </Text>
              <TouchableOpacity onPress={() => removeExercise(index)}>
                <Trash2 size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.paramsRow}>
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
        style={styles.saveButton}
        onPress={handleSave}
        disabled={createSessionMutation.isPending}
      >
        {createSessionMutation.isPending ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Save size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Guardar Sesión Completa</Text>
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
                  <TouchableOpacity
                    key={ex.id}
                    style={styles.exerciseItem}
                    onPress={() => addExercise(ex)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.exerciseMainInfo}>
                      <Text style={styles.exerciseNameText}>{ex.name}</Text>
                      <View
                        style={[
                          styles.muscleBadge,
                          { backgroundColor: getMuscleColor(ex.muscle_group) + "20" },
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
                    </View>
                    <View style={styles.addIconContainer}>
                      <Plus size={20} color={Colors.primary} />
                    </View>
                  </TouchableOpacity>
                ))}

                {filteredExercises.length === 0 && (
                  <View style={styles.modalEmptyState}>
                    <Text style={{ color: Colors.textMuted }}>
                      No se encontraron resultados para "{searchQuery}"
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
  exerciseCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: "row", marginBottom: Spacing.md },
  paramsRow: { flexDirection: "row", gap: Spacing.md },
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
