import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Calendar, ChevronRight, Plus, Dumbbell } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import { Program } from "../../types";

export function PlanningScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Modals visibility
  const [isProgramModalVisible, setIsProgramModalVisible] = useState(false);
  const [isMesocycleModalVisible, setIsMesocycleModalVisible] = useState(false);

  // Selected entities for creation
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null,
  );

  // Form states
  const [newProgramName, setNewProgramName] = useState("");
  const [newMesocycleName, setNewMesocycleName] = useState("");
  const [startWeek, setStartWeek] = useState("1");
  const [endWeek, setEndWeek] = useState("4");

  const [expandedMesoId, setExpandedMesoId] = useState<number | null>(null);

  const { data: myClients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["my-clients"],
    queryFn: () => coachService.getMyClients(),
  });

  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ["client-programs", selectedClientId],
    queryFn: () =>
      selectedClientId
        ? coachService.getClientPrograms(selectedClientId)
        : Promise.resolve([]),
    enabled: !!selectedClientId,
  });

  const createProgramMutation = useMutation({
    mutationFn: (name: string) =>
      coachService.createProgram({
        client_id: selectedClientId!,
        name,
        start_date: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client-programs", selectedClientId],
      });
      setIsProgramModalVisible(false);
      setNewProgramName("");
      Alert.alert("Éxito", "Programa creado correctamente.");
    },
    onError: () => Alert.alert("Error", "No se pudo crear el programa."),
  });

  const createMesocycleMutation = useMutation({
    mutationFn: (data: {
      name: string;
      start_week: number;
      end_week: number;
    }) => coachService.createMesocycle(selectedProgramId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client-programs", selectedClientId],
      });
      setIsMesocycleModalVisible(false);
      setNewMesocycleName("");
      setStartWeek("1");
      setEndWeek("4");
      Alert.alert("Éxito", "Mesociclo creado correctamente.");
    },
    onError: () => Alert.alert("Error", "No se pudo crear el mesociclo."),
  });

  const createMicrocycleMutation = useMutation({
    mutationFn: (mesocycleId: number) =>
      coachService.createMicrocycle(mesocycleId, { week_number: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client-programs", selectedClientId],
      });
      Alert.alert("Éxito", "Microciclo creado correctamente.");
    },
    onError: () => Alert.alert("Error", "No se pudo crear el microciclo."),
  });

  const handleCreateProgram = () => {
    if (!newProgramName) return;
    createProgramMutation.mutate(newProgramName);
  };

  const handleCreateMesocycle = () => {
    if (!newMesocycleName) return;
    createMesocycleMutation.mutate({
      name: newMesocycleName,
      start_week: parseInt(startWeek),
      end_week: parseInt(endWeek),
    });
  };

  const handleAddSession = (microcycleId: number) => {
    // @ts-ignore
    navigation.navigate("SessionBuilder", { microcycleId });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Periodización Estratégica</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Gestión de macrociclos y mesociclos
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

      {/* Program Content */}
      {selectedClientId ? (
        loadingPrograms ? (
          <ActivityIndicator color={Colors.primary} />
        ) : programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              style={[
                Typography.body,
                { color: Colors.textMuted, marginBottom: Spacing.md },
              ]}
            >
              Este alumno no tiene programas activos.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setIsProgramModalVisible(true)}
            >
              <Plus color={Colors.white} size={20} style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>
                Crear Programa Macrociclo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          programs.map((program) => (
            <View key={program.id} style={{ marginBottom: Spacing.xl }}>
              <View style={[styles.cardRow, { marginBottom: Spacing.md }]}>
                <Text style={[Typography.h4, { color: Colors.primary }]}>
                  {program.name}
                </Text>
                <View style={[styles.badge, styles.badgeSuccess]}>
                  <Text style={styles.badgeText}>{program.status}</Text>
                </View>
              </View>

              <Text style={[Typography.label, { marginBottom: Spacing.sm }]}>
                Mesociclos
              </Text>
              {program.mesocycles && program.mesocycles.length > 0 ? (
                program.mesocycles.map((meso) => (
                  <View key={meso.id} style={{ marginBottom: Spacing.md }}>
                    <TouchableOpacity
                      style={[
                        styles.card,
                        expandedMesoId === meso.id && styles.cardActive,
                      ]}
                      onPress={() =>
                        setExpandedMesoId(
                          expandedMesoId === meso.id ? null : meso.id,
                        )
                      }
                    >
                      <View style={styles.cardRow}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[Typography.body, { fontWeight: "700" }]}
                          >
                            {meso.name}
                          </Text>
                          <Text style={Typography.caption}>
                            Semanas {meso.start_week}-{meso.end_week}
                          </Text>
                        </View>
                        <ChevronRight
                          color={Colors.textMuted}
                          size={18}
                          style={{
                            transform: [
                              {
                                rotate:
                                  expandedMesoId === meso.id ? "90deg" : "0deg",
                              },
                            ],
                          }}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Expandable Microcycles & Sessions */}
                    {expandedMesoId === meso.id && (
                      <View style={styles.expandedContent}>
                        {meso.microcycles && meso.microcycles.length > 0 ? (
                          meso.microcycles.map((micro) => (
                            <View key={micro.id} style={styles.microCard}>
                              <View style={styles.cardRow}>
                                <Text
                                  style={[
                                    Typography.label,
                                    { color: Colors.primary },
                                  ]}
                                >
                                  Microciclo {micro.week_number}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => handleAddSession(micro.id)}
                                >
                                  <Plus size={16} color={Colors.primary} />
                                </TouchableOpacity>
                              </View>

                              {micro.workout_sessions &&
                              micro.workout_sessions.length > 0 ? (
                                micro.workout_sessions.map((session) => (
                                    <View key={session.id} style={{ flex: 1 }}>
                                      <View style={styles.sessionItem}>
                                        <Calendar
                                          size={14}
                                          color={Colors.textMuted}
                                        />
                                        <Text style={styles.sessionItemText}>
                                          {session.name} (
                                          {session.day_of_week || "N/A"})
                                        </Text>
                                      </View>
                                      {/* Lista de Ejercicios */}
                                      <View style={styles.exerciseMiniList}>
                                        {session.session_exercises?.map(
                                          (se: any) => (
                                            <View
                                              key={se.id}
                                              style={styles.exerciseMiniRow}
                                            >
                                              <Dumbbell
                                                size={10}
                                                color={Colors.textMuted}
                                              />
                                              <Text
                                                style={styles.exerciseMiniText}
                                              >
                                                {se.exercise?.name} (
                                                {se.target_sets}x
                                                {se.target_reps} @RPE
                                                {se.target_rpe})
                                              </Text>
                                            </View>
                                          ),
                                        )}
                                      </View>
                                    </View>
                                ))
                              ) : (
                                <Text style={Typography.caption}>
                                  Sin sesiones creadas.
                                </Text>
                              )}
                            </View>
                          ))
                        ) : (
                          <View
                            style={{
                              alignItems: "center",
                              padding: Spacing.md,
                            }}
                          >
                            <TouchableOpacity
                              style={styles.outlineButton}
                              onPress={() =>
                                createMicrocycleMutation.mutate(meso.id)
                              }
                            >
                              <Text style={styles.outlineButtonText}>
                                + Crear Primer Microciclo
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text
                  style={[Typography.bodySmall, { color: Colors.textMuted }]}
                >
                  Sin mesociclos definidos.
                </Text>
              )}

              {/* Botón rápido para MVP */}
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => {
                  setSelectedProgramId(program.id);
                  setIsMesocycleModalVisible(true);
                }}
              >
                <Text style={styles.outlineButtonText}>+ Añadir Mesociclo</Text>
              </TouchableOpacity>
            </View>
          ))
        )
      ) : (
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
          Selecciona un alumno para ver o crear su planificación.
        </Text>
      )}

      {/* Modal Crear Programa */}
      <Modal visible={isProgramModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[Typography.h4, { marginBottom: Spacing.md }]}>
              Nuevo Macrociclo
            </Text>

            <Text style={[Typography.label, { marginBottom: Spacing.xs }]}>
              Nombre del Programa
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Preparación Fuerza Base"
              placeholderTextColor={Colors.textMuted}
              value={newProgramName}
              onChangeText={setNewProgramName}
            />

            <View style={[styles.cardRow, { marginTop: Spacing.lg }]}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: Colors.bgElevated,
                    flex: 1,
                    marginRight: Spacing.sm,
                  },
                ]}
                onPress={() => setIsProgramModalVisible(false)}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: Colors.textSecondary },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={handleCreateProgram}
                disabled={createProgramMutation.isPending}
              >
                {createProgramMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal Crear Mesociclo */}
      <Modal
        visible={isMesocycleModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[Typography.h4, { marginBottom: Spacing.md }]}>
              Nuevo Mesociclo
            </Text>

            <Text style={[Typography.label, { marginBottom: Spacing.xs }]}>
              Nombre
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Hipertrofia I"
              placeholderTextColor={Colors.textMuted}
              value={newMesocycleName}
              onChangeText={setNewMesocycleName}
            />

            <View
              style={{
                flexDirection: "row",
                marginTop: Spacing.md,
                gap: Spacing.md,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[Typography.label, { marginBottom: Spacing.xs }]}>
                  Semana Inicio
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={startWeek}
                  onChangeText={setStartWeek}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.label, { marginBottom: Spacing.xs }]}>
                  Semana Fin
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={endWeek}
                  onChangeText={setEndWeek}
                />
              </View>
            </View>

            <View style={[styles.cardRow, { marginTop: Spacing.lg }]}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: Colors.bgElevated,
                    flex: 1,
                    marginRight: Spacing.sm,
                  },
                ]}
                onPress={() => setIsMesocycleModalVisible(false)}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: Colors.textSecondary },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={handleCreateMesocycle}
                disabled={createMesocycleMutation.isPending}
              >
                {createMesocycleMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
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
  infoCard: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoText: {
    color: Colors.info,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.transparent,
  },
  cardActive: {
    borderLeftColor: Colors.primary,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgePrimary: {
    backgroundColor: Colors.primary,
  },
  badgeSuccess: {
    backgroundColor: Colors.success,
  },
  badgeDefault: {
    backgroundColor: Colors.bgElevated,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  listCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
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
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  outlineButton: {
    marginTop: Spacing.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.bg,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  expandedContent: {
    paddingLeft: Spacing.md,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  microCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingLeft: 4,
  },
  sessionItemText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  exerciseMiniList: {
    marginTop: 4,
    paddingLeft: 22,
    gap: 2,
  },
  exerciseMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  exerciseMiniText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
