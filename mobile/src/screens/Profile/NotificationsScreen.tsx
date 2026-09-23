import React from "react";
import { View, Text, ScrollView, StyleSheet, Switch } from "react-native";
import { Dumbbell, Apple, MessageCircle } from "lucide-react-native";
import { usePreferencesStore } from "../../store/preferencesStore";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const OPTIONS: {
  key: "workoutReminders" | "nutritionReminders" | "coachMessages";
  icon: React.ReactNode;
  label: string;
  subtitle: string;
}[] = [
  {
    key: "workoutReminders",
    icon: <Dumbbell size={20} color={Colors.primary} />,
    label: "Recordatorios de entrenamiento",
    subtitle: "Avisos de tu sesión programada",
  },
  {
    key: "nutritionReminders",
    icon: <Apple size={20} color={Colors.success} />,
    label: "Recordatorios de nutrición",
    subtitle: "Registro diario de hábitos",
  },
  {
    key: "coachMessages",
    icon: <MessageCircle size={20} color={Colors.purple} />,
    label: "Mensajes de tu coach",
    subtitle: "Novedades de tu plan",
  },
];

export function NotificationsScreen() {
  const { notifications, toggleNotification } = usePreferencesStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[Typography.bodySmall, { marginBottom: Spacing.lg }]}>
        Estas preferencias se guardan en este dispositivo. Los avisos push
        todavía no están activos en la app — cuando lo estén, respetarán lo que
        elijas aquí.
      </Text>

      <View style={styles.card}>
        {OPTIONS.map((option, index) => (
          <View
            key={option.key}
            style={[
              styles.row,
              index < OPTIONS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              },
            ]}
          >
            <View style={styles.iconBox}>{option.icon}</View>
            <View style={styles.rowContent}>
              <Text style={Typography.body}>{option.label}</Text>
              <Text style={Typography.caption}>{option.subtitle}</Text>
            </View>
            <Switch
              value={notifications[option.key]}
              onValueChange={() => toggleNotification(option.key)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.base, paddingBottom: Spacing["3xl"] },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  rowContent: { flex: 1, gap: 2 },
});
