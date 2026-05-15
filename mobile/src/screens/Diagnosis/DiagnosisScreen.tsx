import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import { User, Ruler, Activity, ChevronDown, Plus, X } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachService } from '../../services/coachService';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

export function DiagnosisScreen() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // 1. My assigned clients
  const { data: myClients = [], isLoading } = useQuery({
    queryKey: ['my-clients'],
    queryFn: () => coachService.getMyClients(),
  });

  // 2. Available clients (not assigned to anyone)
  const { data: availableClients = [], isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['available-clients'],
    queryFn: () => coachService.getAvailableClients(),
    enabled: isAssignModalVisible, // Only fetch when modal opens
  });

  // 3. Mutation to assign client
  const assignClientMutation = useMutation({
    mutationFn: (clientId: number) => coachService.assignClient(clientId),
    onSuccess: () => {
      Alert.alert('Éxito', 'Alumno asignado correctamente.');
      setIsAssignModalVisible(false);
      // Refresh both lists
      queryClient.invalidateQueries({ queryKey: ['my-clients'] });
      queryClient.invalidateQueries({ queryKey: ['available-clients'] });
    },
    onError: () => {
      Alert.alert('Error', 'No se pudo asignar el alumno.');
    }
  });

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientRow}>
            {myClients.map(client => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientPill,
                  selectedClientId === client.id && styles.clientPillActive
                ]}
                onPress={() => setSelectedClientId(client.id)}
              >
                <Text style={[
                  styles.clientPillText,
                  selectedClientId === client.id && styles.clientPillTextActive
                ]}>{client.name}</Text>
              </TouchableOpacity>
            ))}
            {myClients.length === 0 && (
              <Text style={[Typography.body, { color: Colors.textMuted }]}>No tienes alumnos asignados.</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Datos del Atleta */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
            <User color={Colors.primary} size={18} />
          </View>
          <Text style={Typography.h5}>Datos del Atleta</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Juan Pérez"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.label}>Edad</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
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
            />
          </View>
        </View>
      </View>

      {/* Tests de Rendimiento */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
            <Activity color={Colors.success} size={18} />
          </View>
          <Text style={Typography.h5}>Tests de Rendimiento</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>1RM Sentadilla (Estimado)</Text>
          <TextInput
            style={styles.input}
            placeholder="100 kg"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>VAM (Velocidad Aeróbica Máxima)</Text>
          <TextInput
            style={styles.input}
            placeholder="14 km/h"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
        <Text style={[Typography.buttonText, { color: Colors.white }]}>Guardar Diagnóstico</Text>
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
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
            ) : availableClients.length === 0 ? (
              <Text style={[Typography.body, { color: Colors.textMuted, textAlign: 'center', marginVertical: Spacing.xl }]}>
                No hay alumnos disponibles para asignar en este momento.
              </Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {availableClients.map(client => (
                  <View key={client.id} style={styles.availableClientRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[Typography.body, { fontWeight: '600' }]}>{client.name}</Text>
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
    paddingBottom: Spacing['3xl'],
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  clientSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addClientBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldGroup: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
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
  saveButton: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clientRow: {
    flexDirection: 'row',
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
    fontWeight: '600',
  },
  clientPillTextActive: {
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalList: {
    marginBottom: Spacing.xl,
  },
  availableClientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  assignBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  assignBtnText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 14,
  },
});
