import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Lightbulb, TriangleAlert } from "lucide-react-native";
import { Exercise } from "../../types";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

// Algunas contraindicaciones del catálogo son claves ("flexion_lumbar_excesiva").
const humanize = (text: string) => {
  const readable = text.replace(/_/g, " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
};

/**
 * Cues técnicos y precauciones del ejercicio, tal como los cargó el coach en
 * el catálogo. Son opcionales: si el ejercicio no tiene ninguno, no se
 * muestra nada.
 */
export function ExerciseGuidance({
  exercise,
  style,
}: {
  exercise: Pick<Exercise, "technical_cues" | "contraindications"> | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  const cues = exercise?.technical_cues ?? [];
  const cautions = exercise?.contraindications ?? [];
  if (!cues.length && !cautions.length) return null;

  return (
    <View style={[styles.container, style]}>
      {cues.length > 0 && (
        <View
          style={styles.block}
          accessible
          accessibilityLabel={`Técnica: ${cues.join(". ")}`}
        >
          <View style={styles.titleRow}>
            <Lightbulb size={14} color={Colors.primary} />
            <Text style={[styles.title, { color: Colors.primary }]}>
              Técnica
            </Text>
          </View>
          {cues.map((cue) => (
            <Text key={cue} style={styles.item}>
              • {cue}
            </Text>
          ))}
        </View>
      )}

      {cautions.length > 0 && (
        <View
          style={[styles.block, styles.cautionBlock]}
          accessible
          accessibilityLabel={`Precauciones: ${cautions.map(humanize).join(". ")}`}
        >
          <View style={styles.titleRow}>
            <TriangleAlert size={14} color={Colors.warning} />
            <Text style={[styles.title, { color: Colors.warning }]}>
              Precauciones
            </Text>
          </View>
          {cautions.map((caution) => (
            <Text key={caution} style={styles.item}>
              • {humanize(caution)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm, marginBottom: Spacing.md },
  block: {
    backgroundColor: Colors.bg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: Spacing.sm,
    gap: 2,
  },
  cautionBlock: { borderLeftColor: Colors.warning },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  title: {
    ...Typography.caption,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  item: { ...Typography.bodySmall, color: Colors.textSecondary },
});
