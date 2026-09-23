import React from "react";
import { View, Text, ScrollView, StyleSheet, Switch } from "react-native";
import { Moon } from "lucide-react-native";
import { usePreferencesStore } from "../../store/preferencesStore";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export function AppearanceScreen() {
  const { darkMode, toggleDarkMode } = usePreferencesStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Moon size={20} color={Colors.purple} />
          </View>
          <View style={styles.rowContent}>
            <Text style={Typography.body}>Tema Oscuro</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Próximamente</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      <Text style={[Typography.caption, { marginTop: Spacing.md }]}>
        FitCoach Pro solo tiene tema oscuro por ahora. Tu preferencia queda
        guardada y se aplicará automáticamente en cuanto agreguemos el modo
        claro.
      </Text>
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
  rowContent: { flex: 1, gap: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(139,92,246,0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: Colors.purple,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
