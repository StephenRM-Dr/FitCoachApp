import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  Calculator,
  TrendingUp,
  Droplet,
  Moon,
  CheckCircle,
  Circle,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNutritionStore } from "../../store/nutritionStore";
import { nutritionService } from "../../services/nutritionService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const { width } = Dimensions.get("window");
const halfCardWidth = (width - Spacing.base * 2 - Spacing.md) / 2;

export const NutritionScreen = () => {
  const {
    weight,
    height,
    age,
    macros,
    weeklyAdherence,
    getIMC,
    getTMB,
    getTDEE,
  } = useNutritionStore();

  const queryClient = useQueryClient();

  // Load today's log from backend
  const { data: todayLog, isLoading } = useQuery({
    queryKey: ["nutrition-today"],
    queryFn: () => nutritionService.getTodayLog(),
  });

  // Mutation to save/update today's log
  const mutation = useMutation({
    mutationFn: (data: any) =>
      nutritionService.saveLog({
        ...data,
        recorded_at: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-today"] });
    },
  });

  const toggleWater = () => {
    const currentLiters = todayLog?.water_liters || 0;
    mutation.mutate({ water_liters: currentLiters > 0 ? 0 : 2 });
  };

  const toggleSleep = () => {
    const currentSleep = todayLog?.sleep_hours || 0;
    mutation.mutate({ sleep_hours: currentSleep > 0 ? 0 : 8 });
  };

  const toggleSession = () => {
    const isCompleted = todayLog?.session_completed || false;
    mutation.mutate({ session_completed: !isCompleted });
  };

  const dailyHabits = [
    {
      id: "water",
      name: "2L de agua hoy",
      completed: (todayLog?.water_liters || 0) >= 2,
      action: toggleWater,
    },
    {
      id: "sleep",
      name: "Dormir 8 horas",
      completed: (todayLog?.sleep_hours || 0) >= 8,
      action: toggleSleep,
    },
    {
      id: "session",
      name: "Sesión de entrenamiento",
      completed: todayLog?.session_completed || false,
      action: toggleSession,
    },
  ];

  const imc = getIMC();
  const tmb = getTMB();
  const tdee = getTDEE();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h3}>Nutrición y Adherencia</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          Seguimiento de hábitos y requerimientos
        </Text>
      </View>

      {/* Requirement cards row */}
      <View style={styles.reqRow}>
        <View style={[styles.reqCard, { width: halfCardWidth }]}>
          <View
            style={[
              styles.reqIconBox,
              { backgroundColor: "rgba(59,130,246,0.15)" },
            ]}
          >
            <Calculator color={Colors.primary} size={20} />
          </View>
          <Text style={Typography.overline}>IMC</Text>
          <Text style={styles.reqValue}>{imc}</Text>
          <Text
            style={[
              Typography.caption,
              { color: Colors.success, fontWeight: "600" },
            ]}
          >
            Peso Normal
          </Text>
        </View>

        <View style={[styles.reqCard, { width: halfCardWidth }]}>
          <View
            style={[
              styles.reqIconBox,
              { backgroundColor: "rgba(139,92,246,0.15)" },
            ]}
          >
            <TrendingUp color={Colors.purple} size={20} />
          </View>
          <Text style={Typography.overline}>TMB</Text>
          <Text style={styles.reqValue}>{tmb}</Text>
          <Text style={Typography.caption}>Cal/día basal</Text>
        </View>
      </View>

      {/* TDEE card */}
      <View style={styles.card}>
        <View style={styles.tdeeRow}>
          <View
            style={[
              styles.reqIconBox,
              { backgroundColor: "rgba(16,185,129,0.15)" },
            ]}
          >
            <TrendingUp color={Colors.success} size={20} />
          </View>
          <View style={{ marginLeft: Spacing.md }}>
            <Text style={Typography.overline}>TDEE (GASTO TOTAL)</Text>
            <Text style={[Typography.h3, { marginTop: 2 }]}>{tdee} kcal</Text>
          </View>
        </View>
      </View>

      {/* Macros Section */}
      <View style={styles.card}>
        <Text style={[Typography.h5, { marginBottom: Spacing.md }]}>
          Macronutrientes
        </Text>
        {macros.map((macro, index) => {
          const grams =
            macro.name === "Proteínas"
              ? Math.round((tdee * 0.3) / 4)
              : macro.name === "Carbohidratos"
                ? Math.round((tdee * 0.45) / 4)
                : Math.round((tdee * 0.25) / 9);

          return (
            <View
              key={index}
              style={[
                styles.macroRow,
                index < macros.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                },
              ]}
            >
              <View style={styles.macroLeft}>
                <View
                  style={[styles.macroDot, { backgroundColor: macro.color }]}
                />
                <Text style={[Typography.body, { fontSize: 14 }]}>
                  {macro.name} ({macro.value}%)
                </Text>
              </View>
              <Text
                style={[Typography.body, { fontWeight: "700", fontSize: 14 }]}
              >
                {grams}g
              </Text>
            </View>
          );
        })}
      </View>

      {/* Weekly Adherence */}
      <View style={styles.card}>
        <Text style={[Typography.h5, { marginBottom: Spacing.md }]}>
          Adherencia Semanal
        </Text>
        <View style={styles.adherenceRow}>
          {weeklyAdherence.map((day, idx) => (
            <View key={idx} style={styles.adherenceCol}>
              <Text
                style={[
                  Typography.caption,
                  { fontSize: 10, marginBottom: Spacing.sm },
                ]}
              >
                {day.dia}
              </Text>
              <View
                style={[
                  styles.adherenceDot,
                  {
                    backgroundColor: day.sesion
                      ? "rgba(16,185,129,0.2)"
                      : "rgba(239,68,68,0.1)",
                  },
                ]}
              >
                <TrendingUp
                  size={10}
                  color={day.sesion ? Colors.success : Colors.danger}
                />
              </View>
              <View
                style={[
                  styles.adherenceDot,
                  {
                    backgroundColor: day.agua
                      ? "rgba(59,130,246,0.2)"
                      : Colors.bg,
                  },
                ]}
              >
                <Droplet
                  size={10}
                  color={day.agua ? Colors.primary : Colors.textMuted}
                />
              </View>
              <View
                style={[
                  styles.adherenceDot,
                  {
                    backgroundColor: day.sueno
                      ? "rgba(139,92,246,0.2)"
                      : Colors.bg,
                  },
                ]}
              >
                <Moon
                  size={10}
                  color={day.sueno ? Colors.purple : Colors.textMuted}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Daily Habits */}
      <View style={styles.card}>
        <Text style={[Typography.h5, { marginBottom: Spacing.md }]}>
          Hábitos de Hoy
        </Text>
        {dailyHabits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={habit.action}
            style={[
              styles.habitRow,
              habit.completed && { backgroundColor: Colors.bg },
            ]}
            activeOpacity={0.7}
          >
            {habit.completed ? (
              <CheckCircle size={20} color={Colors.success} />
            ) : (
              <Circle size={20} color={Colors.textMuted} />
            )}
            <Text
              style={[
                Typography.body,
                { flex: 1, marginLeft: Spacing.md, fontSize: 14 },
                habit.completed && {
                  color: Colors.textMuted,
                  textDecorationLine: "line-through",
                },
              ]}
            >
              {habit.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  reqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  reqCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  reqIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reqValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  tdeeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  macroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  adherenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  adherenceCol: {
    alignItems: "center",
    gap: 4,
  },
  adherenceDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
});
