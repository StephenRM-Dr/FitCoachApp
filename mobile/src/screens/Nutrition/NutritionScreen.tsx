import React, { useEffect } from "react";
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
  Lock,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNutritionStore } from "../../store/nutritionStore";
import { useAuthStore } from "../../store/authStore";
import {
  nutritionService,
  NutritionLog,
} from "../../services/nutritionService";
import { progressService } from "../../services/progressService";
import { anamnesisService } from "../../services/anamnesisService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const MACRO_COLORS = {
  protein: "#3b82f6",
  carbs: "#10b981",
  fat: "#f59e0b",
};

const { width } = Dimensions.get("window");
const halfCardWidth = (width - Spacing.base * 2 - Spacing.md) / 2;

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getImcLabel(imc: number): string {
  if (imc < 18.5) return "Bajo Peso";
  if (imc < 25) return "Peso Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

function buildWeeklyAdherence(logs: NutritionLog[]) {
  const logsByDate = new Map(logs.map((l) => [l.recorded_at, l]));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const log = logsByDate.get(key);
    days.push({
      dia: DAY_LABELS[d.getDay()],
      sesion: log?.session_completed || false,
      agua: (log?.water_liters || 0) >= 2,
      sueno: (log?.sleep_hours || 0) >= 8,
    });
  }
  return days;
}

export const NutritionScreen = () => {
  const { getIMC, getTMB, getTDEE, hydrate } = useNutritionStore();
  const authUser = useAuthStore((state) => state.user);

  const queryClient = useQueryClient();

  // El coach habilita esta sección por alumno; si no está habilitada, no se
  // muestra nada del contenido más allá de este check.
  const { data: nutritionSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ["nutrition-settings"],
    queryFn: () => nutritionService.getNutritionSettings(),
  });

  // Load today's log from backend
  const { data: todayLog, isLoading } = useQuery({
    queryKey: ["nutrition-today"],
    queryFn: () => nutritionService.getTodayLog(),
    enabled: !!nutritionSettings?.nutrition_enabled,
  });

  const nutritionEnabled = !!nutritionSettings?.nutrition_enabled;

  const { data: nutritionLogs = [] } = useQuery({
    queryKey: ["nutrition-logs"],
    queryFn: () => nutritionService.getNutritionLogs(),
    enabled: nutritionEnabled,
  });

  const { data: latestAnthro } = useQuery({
    queryKey: ["anthropometrics-latest"],
    queryFn: () => progressService.getLatestAnthropometric(),
    enabled: nutritionEnabled,
  });

  const { data: anamnesisData } = useQuery({
    queryKey: ["anamnesis"],
    queryFn: () => anamnesisService.getMyAnamnesis(),
    enabled: nutritionEnabled,
  });

  useEffect(() => {
    if (latestAnthro || anamnesisData?.profile || authUser?.gender) {
      hydrate({
        weight: latestAnthro?.weight,
        height: latestAnthro?.height,
        age: anamnesisData?.profile?.age,
        activityLevel: anamnesisData?.profile?.activity_level,
        gender: authUser?.gender,
      });
    }
  }, [latestAnthro, anamnesisData, authUser, hydrate]);

  const weeklyAdherence = buildWeeklyAdherence(nutritionLogs);

  // Guarda hoy: actualiza la UI al toque (optimista) en vez de esperar el
  // POST + el refetch para recién ahí pintar el check — eso es lo que hacía
  // sentir lento el toggle de hábitos.
  const mutation = useMutation({
    mutationFn: (data: Partial<NutritionLog>) =>
      nutritionService.saveLog({
        ...data,
        recorded_at: new Date().toISOString().split("T")[0],
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["nutrition-today"] });
      const previous = queryClient.getQueryData<NutritionLog | null>([
        "nutrition-today",
      ]);
      queryClient.setQueryData(["nutrition-today"], (old: any) => ({
        ...(old || {}),
        ...data,
      }));
      return { previous };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(["nutrition-today"], context?.previous);
    },
    onSettled: () => {
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

  const macroBreakdown = nutritionSettings
    ? [
        {
          name: "Proteínas",
          value: nutritionSettings.macro_protein_pct,
          color: MACRO_COLORS.protein,
          grams: Math.round(
            (tdee * (nutritionSettings.macro_protein_pct / 100)) / 4,
          ),
        },
        {
          name: "Carbohidratos",
          value: nutritionSettings.macro_carbs_pct,
          color: MACRO_COLORS.carbs,
          grams: Math.round(
            (tdee * (nutritionSettings.macro_carbs_pct / 100)) / 4,
          ),
        },
        {
          name: "Grasas",
          value: nutritionSettings.macro_fat_pct,
          color: MACRO_COLORS.fat,
          grams: Math.round(
            (tdee * (nutritionSettings.macro_fat_pct / 100)) / 9,
          ),
        },
      ]
    : [];

  if (loadingSettings) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.textMuted }}>Cargando...</Text>
      </View>
    );
  }

  if (!nutritionEnabled) {
    return (
      <View style={[styles.container, styles.center, { padding: Spacing.xl }]}>
        <Lock size={48} color={Colors.textMuted} />
        <Text
          style={[
            Typography.h4,
            { textAlign: "center", marginTop: Spacing.lg, color: Colors.white },
          ]}
        >
          Nutrición aún no habilitada
        </Text>
        <Text
          style={[
            Typography.body,
            { textAlign: "center", color: Colors.textMuted, marginTop: 8 },
          ]}
        >
          Tu coach todavía no habilitó esta sección para vos. Contactalo si
          creés que deberías tener acceso.
        </Text>
      </View>
    );
  }

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
            {getImcLabel(parseFloat(imc))}
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
        {macroBreakdown.map((macro, index) => (
          <View
            key={macro.name}
            style={[
              styles.macroRow,
              index < macroBreakdown.length - 1 && {
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
              {macro.grams}g
            </Text>
          </View>
        ))}
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
  center: {
    justifyContent: "center",
    alignItems: "center",
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
