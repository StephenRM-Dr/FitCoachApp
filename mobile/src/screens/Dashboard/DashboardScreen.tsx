import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity, Target, TrendingUp, Calendar, Dumbbell, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const UPCOMING_SESSIONS = [
  { day: 'Hoy', name: 'Fuerza A - Tren Superior', time: '17:00' },
  { day: 'Mañana', name: 'Resistencia Z2 - Cardio', time: '08:00' },
  { day: 'Jueves', name: 'Fuerza B - Tren Inferior', time: '17:00' },
];

export function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.header}>
        <Text style={Typography.h2}>¡Hola, {user?.name?.split(' ')[0] || 'Atleta'}!</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          {user?.role === 'coach'
            ? 'Resumen de la planificación estratégica actual.'
            : 'Tu resumen de entrenamiento personalizado.'}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Activity color={Colors.primary} size={24} style={{ marginBottom: Spacing.sm }} />
          <Text style={Typography.caption}>Macrociclo</Text>
          <Text style={[Typography.h5, { color: Colors.primary }]}>Preparatorio</Text>
        </View>
        <View style={styles.summaryCard}>
          <Target color={Colors.success} size={24} style={{ marginBottom: Spacing.sm }} />
          <Text style={Typography.caption}>Mesociclo</Text>
          <Text style={[Typography.h5, { color: Colors.success }]}>Fuerza Base</Text>
        </View>
      </View>

      {/* Training Load */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp color={Colors.info} size={20} />
          <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>Carga de Entrenamiento</Text>
        </View>
        <View style={styles.statsBox}>
          <View style={styles.statRow}>
            <Text style={Typography.bodySmall}>Intensidad Media</Text>
            <Text style={[Typography.body, { fontWeight: '700' }]}>75% 1RM</Text>
          </View>
          <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
            <Text style={Typography.bodySmall}>Volumen Semanal</Text>
            <Text style={[Typography.body, { fontWeight: '700' }]}>120 series</Text>
          </View>
          <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
            <Text style={Typography.bodySmall}>RPE Promedio</Text>
            <Text style={[Typography.body, { fontWeight: '700', color: Colors.warning }]}>7.5</Text>
          </View>
        </View>
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Calendar color={Colors.purple} size={20} />
          <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>Próximas Sesiones</Text>
        </View>
        {UPCOMING_SESSIONS.map((session, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sessionRow,
              index < UPCOMING_SESSIONS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.sessionIcon}>
              <Dumbbell size={18} color={Colors.primary} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={[Typography.body, { fontWeight: '600', fontSize: 14 }]}>
                {session.name}
              </Text>
              <Text style={Typography.caption}>
                {session.day} · {session.time}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
        <Text style={[Typography.buttonText, { color: Colors.white }]}>
          Ver Microciclo Actual
        </Text>
      </TouchableOpacity>
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
  summaryRow: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsBox: {
    backgroundColor: Colors.bg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
