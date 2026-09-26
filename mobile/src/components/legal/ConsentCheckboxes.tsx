import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { Colors, Spacing, Typography } from "../../theme";
import type { LegalDocId } from "../../legal/documents";

interface Props {
  acceptTerms: boolean;
  onChangeTerms: (value: boolean) => void;
  /** Solo los clientes autorizan el tratamiento de datos de salud. */
  showHealthData: boolean;
  acceptHealthData: boolean;
  onChangeHealthData: (value: boolean) => void;
  onOpenDocument: (doc: LegalDocId) => void;
}

/**
 * Casillas de consentimiento (sin premarcar) compartidas por el registro y la
 * pantalla de re-aceptación de términos.
 */
export function ConsentCheckboxes({
  acceptTerms,
  onChangeTerms,
  showHealthData,
  acceptHealthData,
  onChangeHealthData,
  onOpenDocument,
}: Props) {
  return (
    <View style={styles.group}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => onChangeTerms(!acceptTerms)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptTerms }}
        accessibilityLabel="Acepto los Términos y Condiciones y la Política de Privacidad"
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, acceptTerms && styles.checkboxOn]}>
          {acceptTerms && <Check size={14} color={Colors.white} />}
        </View>
        <Text style={[Typography.bodySmall, styles.text]}>
          Acepto los{" "}
          <Text
            style={styles.link}
            accessibilityRole="link"
            onPress={() => onOpenDocument("terms")}
          >
            Términos y Condiciones
          </Text>{" "}
          y la{" "}
          <Text
            style={styles.link}
            accessibilityRole="link"
            onPress={() => onOpenDocument("privacy")}
          >
            Política de Privacidad
          </Text>
          .
        </Text>
      </TouchableOpacity>

      {showHealthData && (
        <TouchableOpacity
          style={styles.row}
          onPress={() => onChangeHealthData(!acceptHealthData)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptHealthData }}
          accessibilityLabel="Autorizo el tratamiento de mis datos de salud por mi coach"
          activeOpacity={0.7}
        >
          <View
            style={[styles.checkbox, acceptHealthData && styles.checkboxOn]}
          >
            {acceptHealthData && <Check size={14} color={Colors.white} />}
          </View>
          <Text style={[Typography.bodySmall, styles.text]}>
            Autorizo que mis datos de salud (lesiones, patologías, medicamentos
            y mediciones) sean tratados por mi coach para planificar mi
            entrenamiento. Puedo retirar este permiso eliminando mi cuenta.
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.md, marginTop: Spacing.sm },
  row: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  text: { flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  link: { color: Colors.primaryLight, textDecorationLine: "underline" },
});
