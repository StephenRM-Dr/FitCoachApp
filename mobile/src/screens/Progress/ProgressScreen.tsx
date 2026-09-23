import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Minus,
  Activity,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { progressService } from "../../services/progressService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const { width } = Dimensions.get("window");

// Mock data - in production this would come from the API
const WEIGHT_DATA = [
  { week: "S1", value: 82.5 },
  { week: "S2", value: 81.8 },
  { week: "S3", value: 81.2 },
  { week: "S4", value: 80.5 },
  { week: "S5", value: 80.1 },
  { week: "S6", value: 79.4 },
  { week: "S7", value: 79.0 },
  { week: "S8", value: 78.8 },
];

const BODY_MEASUREMENTS = [
  { name: "Pecho", value: "102 cm", trend: "up" },
  { name: "Cintura", value: "82 cm", trend: "down" },
  { name: "Brazo", value: "37 cm", trend: "up" },
  { name: "Muslo", value: "58 cm", trend: "up" },
];

export function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<"weight" | "body">("weight");

  const { data: measurements = [], isLoading } = useQuery({
    queryKey: ["anthropometrics"],
    queryFn: () => progressService.getAnthropometrics(),
  });

  // Derived weight data
  const weightData = [...measurements]
    .reverse()
    .filter((m) => m.weight)
    .map((m, idx) => ({
      week: `S${idx + 1}`,
      value: parseFloat(m.weight),
      date: m.recorded_at,
    }));

  const maxWeight = weightData.length
    ? Math.max(...weightData.map((d) => d.value))
    : 0;
  const minWeight = weightData.length
    ? Math.min(...weightData.map((d) => d.value))
    : 0;
  const weightRange = maxWeight - minWeight || 1;
  const chartHeight = 140;

  const totalWeightLoss =
    weightData.length > 1
      ? weightData[0].value - weightData[weightData.length - 1].value
      : 0;

  const latestMeasure = measurements[0] || {};
  const previousMeasure = measurements[1] || {};

  const getTrend = (
    current?: number | string | null,
    previous?: number | string | null,
  ): "up" | "down" | "flat" => {
    if (current == null || previous == null) return "flat";
    const c = Number(current);
    const p = Number(previous);
    if (Number.isNaN(c) || Number.isNaN(p) || c === p) return "flat";
    return c > p ? "up" : "down";
  };

  const bodyMeasurements = [
    {
      name: "Cintura",
      value: latestMeasure.waist_cm ? `${latestMeasure.waist_cm} cm` : "--",
      trend: getTrend(latestMeasure.waist_cm, previousMeasure.waist_cm),
    },
    {
      name: "Cadera",
      value: latestMeasure.hip_cm ? `${latestMeasure.hip_cm} cm` : "--",
      trend: getTrend(latestMeasure.hip_cm, previousMeasure.hip_cm),
    },
    {
      name: "FCR (Reposo)",
      value: latestMeasure.fcr_lpm ? `${latestMeasure.fcr_lpm} lpm` : "--",
      trend: getTrend(latestMeasure.fcr_lpm, previousMeasure.fcr_lpm),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Mi Progreso</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Seguimiento de tu evolución física
        </Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.success }]}>
          <Text style={styles.summaryValue}>
            -{totalWeightLoss.toFixed(1)} kg
          </Text>
          <Text style={Typography.caption}>Peso perdido</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.purple }]}>
          <Text style={styles.summaryValue}>{weightData.length}</Text>
          <Text style={Typography.caption}>Semanas registradas</Text>
        </View>
      </View>

      {/* Tab selector */}
      <View style={styles.tabRow}>
        {(
          [
            { key: "weight", label: "Peso" },
            { key: "body", label: "Medidas" },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weight Tab */}
      {activeTab === "weight" && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingDown size={20} color={Colors.success} />
            <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>
              Evolución de Peso
            </Text>
          </View>

          {weightData.length > 0 ? (
            <>
              {/* Simple bar chart */}
              <View style={styles.chartContainer}>
                {weightData.map((point, index) => {
                  const barHeight =
                    ((point.value - minWeight + 0.5) / (weightRange + 1)) *
                    chartHeight;
                  const isLast = index === weightData.length - 1;
                  return (
                    <View key={index} style={styles.chartBarCol}>
                      <Text
                        style={[
                          Typography.caption,
                          { fontSize: 10, marginBottom: 4 },
                        ]}
                      >
                        {point.value}
                      </Text>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: barHeight,
                            backgroundColor: isLast
                              ? Colors.success
                              : Colors.primary,
                            opacity: isLast
                              ? 1
                              : 0.5 + (index / weightData.length) * 0.5,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          Typography.caption,
                          { marginTop: 4, fontSize: 10 },
                        ]}
                      >
                        {point.week}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={Typography.caption}>Inicio</Text>
                  <Text
                    style={[Typography.h5, { color: Colors.textSecondary }]}
                  >
                    {weightData[0]?.value} kg
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={Typography.caption}>Actual</Text>
                  <Text style={[Typography.h5, { color: Colors.success }]}>
                    {weightData[weightData.length - 1]?.value} kg
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={Typography.caption}>Cambio</Text>
                  <Text style={[Typography.h5, { color: Colors.success }]}>
                    {totalWeightLoss > 0 ? "-" : "+"}
                    {Math.abs(totalWeightLoss).toFixed(1)} kg
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={{ padding: Spacing.xl, alignItems: "center" }}>
              <Activity color={Colors.textMuted} size={32} />
              <Text
                style={[
                  Typography.body,
                  { color: Colors.textMuted, marginTop: Spacing.sm },
                ]}
              >
                No hay registros de peso aún
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Body Measurements Tab */}
      {activeTab === "body" && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Target size={20} color={Colors.info} />
            <Text style={[Typography.h5, { marginLeft: Spacing.sm }]}>
              Medidas Corporales
            </Text>
          </View>

          {bodyMeasurements.map((m, index) => (
            <View
              key={index}
              style={[
                styles.measureRow,
                index < bodyMeasurements.length - 1 && styles.prRowBorder,
              ]}
            >
              <Text style={[Typography.body, { flex: 1 }]}>{m.name}</Text>
              <Text style={[Typography.h5, { marginRight: Spacing.md }]}>
                {m.value}
              </Text>
              {m.trend === "up" ? (
                <TrendingUp size={18} color={Colors.success} />
              ) : m.trend === "down" ? (
                <TrendingDown size={18} color={Colors.info} />
              ) : (
                <Minus size={18} color={Colors.textMuted} />
              )}
            </View>
          ))}
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
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    marginBottom: Spacing.base,
    paddingTop: Spacing.base,
  },
  chartBarCol: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  prRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  measureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
