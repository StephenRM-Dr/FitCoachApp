import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  Switch,
} from "react-native";
import { User, Activity, Plus, X, Apple } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coachService } from "../../services/coachService";
import {
  anamnesisService,
  ActivityLevel,
} from "../../services/anamnesisService";
import { progressService } from "../../services/progressService";
import { nutritionService } from "../../services/nutritionService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligero", label: "Ligero" },
  { value: "activo", label: "Activo" },
  { value: "muy_activo", label: "Muy Activo" },
];

export function DiagnosisScreen() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [occupation, setOccupation] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [mainObjective, setMainObjective] = useState("");
  const [nutritionEnabled, setNutritionEnabled] = useState(false);
  const [macroProtein, setMacroProtein] = useState("30");
  const [macroCarbs, setMacroCarbs] = useState("45");
  const [macroFat, setMacroFat] = useState("25");
  const queryClient = useQueryClient();

  // 1. My assigned clients
  const { data: myClients = [], isLoading } = useQuery({
    queryKey: ["my-clients"],
    queryFn: () => coachService.getMyClients(),
  });

  // 2. Available clients (not assigned to anyone)
  const { data: availableClients = [], isLoading: isLoadingAvailable } =
    useQuery({
      queryKey: ["available-clients"],
      queryFn: () => coachService.getAvailableClients(),
      enabled: isAssignModalVisible, // Only fetch when modal opens
    });

  // 3. Mutation to assign client
  const assignClientMutation = useMutation({
    mutationFn: (clientId: number) => coachService.assignClient(clientId),
    onSuccess: () => {
      Alert.alert("Éxito", "Alumno asignado correctamente.");
      setIsAssignModalVisible(false);
      // Refresh both lists
      queryClient.invalidateQueries({ queryKey: ["my-clients"] });
      queryClient.invalidateQueries({ queryKey: ["available-clients"] });
    },
    onError: () => {
      Alert.alert("Error", "No se pudo asignar el alumno.");
    },
  });

  // 4. Datos de diagnóstico ya guardados del alumno seleccionado
  const { data: anamnesisData } = useQuery({
    queryKey: ["anamnesis", selectedClientId],
    queryFn: () => anamnesisService.getMyAnamnesis(selectedClientId!),
    enabled: !!selectedClientId,
  });

  const { data: latestAnthro } = useQuery({
    queryKey: ["anthropometrics-latest", selectedClientId],
    queryFn: () => progressService.getLatestAnthropometric(selectedClientId!),
    enabled: !!selectedClientId,
  });

  // 5. Configuración de Nutrición del alumno seleccionado
  const { data: nutritionSettingsData } = useQuery({
    queryKey: ["nutrition-settings", selectedClientId],
    queryFn: () => nutritionService.getNutritionSettings(selectedClientId!),
    enabled: !!selectedClientId,
  });

  // Limpiar el formulario al cambiar de alumno, y precargar cuando llegan los datos
  useEffect(() => {
    setAge("");
    setWeight("");
    setOccupation("");
    setActivityLevel("");
    setMainObjective("");
    setNutritionEnabled(false);
    setMacroProtein("30");
    setMacroCarbs("45");
    setMacroFat("25");
  }, [selectedClientId]);

  useEffect(() => {
    if (anamnesisData?.profile) {
      const p = anamnesisData.profile;
      setAge(p.age != null ? String(p.age) : "");
      setOccupation(p.occupation || "");
      setActivityLevel(p.activity_level || "");
      setMainObjective(p.main_objective || "");
    }
  }, [anamnesisData]);

  useEffect(() => {
    if (nutritionSettingsData) {
      setNutritionEnabled(nutritionSettingsData.nutrition_enabled);
      setMacroProtein(String(nutritionSettingsData.macro_protein_pct));
      setMacroCarbs(String(nutritionSettingsData.macro_carbs_pct));
      setMacroFat(String(nutritionSettingsData.macro_fat_pct));
    }
  }, [nutritionSettingsData]);

  useEffect(() => {
    if (latestAnthro?.weight != null) {
      setWeight(String(latestAnthro.weight));
    }
  }, [latestAnthro]);

  // 5. Guardar diagnóstico (perfil + antropometría en paralelo)
  const saveAnamnesisMutation = useMutation({
    mutationFn: () =>
      anamnesisService.saveAnamnesis(
        {
          age: age ? parseInt(age, 10) : null,
          occupation: occupation.trim() || null,
          activity_level: activityLevel || null,
          main_objective: mainObjective.trim() || null,
        },
        selectedClientId!,
      ),
  });

  const saveAnthropometricMutation = useMutation({
    mutationFn: () =>
      progressService.saveAnthropometric(
        { weight: weight ? parseFloat(weight) : null },
        selectedClientId!,
      ),
  });

  const macroSum =
    (parseInt(macroProtein, 10) || 0) +
    (parseInt(macroCarbs, 10) || 0) +
    (parseInt(macroFat, 10) || 0);

  const saveNutritionSettingsMutation = useMutation({
    mutationFn: () =>
      nutritionService.updateNutritionSettings(selectedClientId!, {
        nutrition_enabled: nutritionEnabled,
        macro_protein_pct: parseInt(macroProtein, 10) || 0,
        macro_carbs_pct: parseInt(macroCarbs, 10) || 0,
        macro_fat_pct: parseInt(macroFat, 10) || 0,
      }),
    onSuccess: () => {
      Alert.alert("Éxito", "Configuración de Nutrición guardada.");
      queryClient.invalidateQueries({
        queryKey: ["nutrition-settings", selectedClientId],
      });
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.errors?.macro_protein_pct?.[0] ||
        "No se pudo guardar la configuración de Nutrición.";
      Alert.alert("Error", message);
    },
  });

  const handleSaveNutritionSettings = () => {
    if (!selectedClientId) return;
    if (macroSum !== 100) {
      Alert.alert(
        "Aviso",
        `Los porcentajes deben sumar 100% (actual: ${macroSum}%).`,
      );
      return;
    }
    saveNutritionSettingsMutation.mutate();
  };

  const isSaving =
    saveAnamnesisMutation.isPending || saveAnthropometricMutation.isPending;

  const handleSaveDiagnosis = async () => {
    if (!selectedClientId) {
      Alert.alert("Aviso", "Selecciona un alumno primero.");
      return;
    }
    try {
      await Promise.all([
        saveAnamnesisMutation.mutateAsync(),
        weight ? saveAnthropometricMutation.mutateAsync() : Promise.resolve(),
      ]);
      Alert.alert("Éxito", "Diagnóstico guardado correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["anamnesis", selectedClientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["anthropometrics-latest", selectedClientId],
      });
    } catch {
      Alert.alert("Error", "No se pudo guardar el diagnóstico.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Diagnóstico Inicial</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Evaluación integral del asesorado
        </Text>
      </View>

      {/* Client Selector */}
      <View style={styles.card}>
        <View style={styles.clientSelectorHeader}>
          <Text style={Typography.label}>Seleccionar Alumno</Text>
          <TouchableOpacity
            style={styles.addClientBtn}
            onPress={() => setIsAssignModalVisible(true)}
          >
            <Plus size={14} color={Colors.white} />
            <Text style={styles.addClientBtnText}>Asignar Nuevo</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
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

      {/* Datos del Atleta */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(59,130,246,0.15)" },
            ]}
          >
            <User color={Colors.primary} size={18} />
          </View>
          <Text style={Typography.h5}>Datos del Atleta</Text>
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.label}>Edad</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>
          <View style={{ width: Spacing.md }} />
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="75"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Ocupación</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Oficinista"
            placeholderTextColor={Colors.textMuted}
            value={occupation}
            onChangeText={setOccupation}
          />
        </View>
      </View>

      {/* Nivel de Actividad y Objetivo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(16,185,129,0.15)" },
            ]}
          >
            <Activity color={Colors.success} size={18} />
          </View>
          <Text style={Typography.h5}>Actividad y Objetivo</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Nivel de Actividad</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.clientRow}
          >
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.clientPill,
                  activityLevel === level.value && styles.clientPillActive,
                ]}
                onPress={() => setActivityLevel(level.value)}
              >
                <Text
                  style={[
                    styles.clientPillText,
                    activityLevel === level.value &&
                      styles.clientPillTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Objetivo Principal</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Pérdida de grasa, ganancia muscular..."
            placeholderTextColor={Colors.textMuted}
            value={mainObjective}
            onChangeText={setMainObjective}
          />
        </View>
      </View>

      {/* Configuración de Nutrición */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(139,92,246,0.15)" },
            ]}
          >
            <Apple color={Colors.purple} size={18} />
          </View>
          <Text style={Typography.h5}>Nutrición</Text>
        </View>

        <View style={[styles.fieldRow, { alignItems: "center" }]}>
          <Text style={[Typography.body, { flex: 1 }]}>
            Habilitar sección de Nutrición para este alumno
          </Text>
          <Switch
            value={nutritionEnabled}
            onValueChange={setNutritionEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <Text
          style={[
            Typography.label,
            { marginTop: Spacing.md, marginBottom: Spacing.sm },
          ]}
        >
          Porcentaje de macronutrientes
        </Text>
        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.caption}>Proteína %</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={macroProtein}
              onChangeText={setMacroProtein}
            />
          </View>
          <View style={{ width: Spacing.sm }} />
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.caption}>Carbos %</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={macroCarbs}
              onChangeText={setMacroCarbs}
            />
          </View>
          <View style={{ width: Spacing.sm }} />
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.caption}>Grasas %</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={macroFat}
              onChangeText={setMacroFat}
            />
          </View>
        </View>
        <Text
          style={[
            Typography.caption,
            {
              marginTop: Spacing.sm,
              color: macroSum === 100 ? Colors.success : Colors.danger,
              fontWeight: "600",
            },
          ]}
        >
          Suma: {macroSum}% {macroSum === 100 ? "✓" : "(debe ser 100%)"}
        </Text>

        <TouchableOpacity
          style={[
            styles.outlineSaveButton,
            saveNutritionSettingsMutation.isPending && { opacity: 0.7 },
          ]}
          onPress={handleSaveNutritionSettings}
          disabled={
            saveNutritionSettingsMutation.isPending || !selectedClientId
          }
        >
          {saveNutritionSettingsMutation.isPending ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.outlineSaveButtonText}>
              Guardar Configuración de Nutrición
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
        activeOpacity={0.8}
        onPress={handleSaveDiagnosis}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={[Typography.buttonText, { color: Colors.white }]}>
            Guardar Diagnóstico
          </Text>
        )}
      </TouchableOpacity>
      {/* Assign Client Modal */}
      <Modal
        visible={isAssignModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={Typography.h5}>Asignar Nuevo Alumno</Text>
              <TouchableOpacity onPress={() => setIsAssignModalVisible(false)}>
                <X size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {isLoadingAvailable ? (
              <ActivityIndicator
                color={Colors.primary}
                style={{ marginVertical: Spacing.xl }}
              />
            ) : availableClients.length === 0 ? (
              <Text
                style={[
                  Typography.body,
                  {
                    color: Colors.textMuted,
                    textAlign: "center",
                    marginVertical: Spacing.xl,
                  },
                ]}
              >
                No hay alumnos disponibles para asignar en este momento.
              </Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {availableClients.map((client) => (
                  <View key={client.id} style={styles.availableClientRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.body, { fontWeight: "600" }]}>
                        {client.name}
                      </Text>
                      <Text style={Typography.caption}>{client.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.assignBtn}
                      onPress={() => assignClientMutation.mutate(client.id)}
                      disabled={assignClientMutation.isPending}
                    >
                      <Text style={styles.assignBtnText}>Asignar</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  clientSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  addClientBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addClientBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldGroup: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  fieldRow: {
    flexDirection: "row",
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  outlineSaveButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  outlineSaveButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalList: {
    marginBottom: Spacing.xl,
  },
  availableClientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  assignBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  assignBtnText: {
    color: Colors.success,
    fontWeight: "600",
    fontSize: 14,
  },
});
