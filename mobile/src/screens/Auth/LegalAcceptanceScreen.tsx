import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { ConsentCheckboxes } from "../../components/legal/ConsentCheckboxes";
import { LEGAL_VERSION } from "../../config/business";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

/**
 * Se muestra cuando el usuario debe (re)aceptar los textos legales: cuentas
 * anteriores al registro de consentimiento o cambio de versión vigente.
 * Bloquea el resto de la app hasta aceptar (o cerrar sesión).
 */
export const LegalAcceptanceScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token, setAuth, logout } = useAuthStore();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptHealthData, setAcceptHealthData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClient = user?.role === "client";
  const canSubmit = acceptTerms && (!isClient || acceptHealthData);

  const handleAccept = async () => {
    if (!canSubmit || !token) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await authService.acceptLegal({
        accept_terms: acceptTerms,
        accept_health_data: acceptHealthData,
      });
      await setAuth(updated, token);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "No se pudo registrar tu aceptación. Intenta de nuevo.",
      );
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={Typography.h3} accessibilityRole="header">
        Actualizamos nuestras políticas
      </Text>
      <Text style={Typography.body}>
        Para seguir usando FitCoach Pro necesitamos que revises y aceptes los
        Términos y la Política de Privacidad (versión {LEGAL_VERSION}).
      </Text>

      <ConsentCheckboxes
        acceptTerms={acceptTerms}
        onChangeTerms={setAcceptTerms}
        showHealthData={isClient}
        acceptHealthData={acceptHealthData}
        onChangeHealthData={setAcceptHealthData}
        onOpenDocument={(doc) => navigation.navigate("Legal", { doc })}
      />

      {error && (
        <Text style={[Typography.bodySmall, { color: Colors.danger }]}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, (!canSubmit || loading) && styles.disabled]}
        onPress={handleAccept}
        disabled={!canSubmit || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit || loading }}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={[Typography.buttonText, { color: Colors.white }]}>
            Aceptar y continuar
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondary}
        onPress={() => logout()}
        accessibilityRole="button"
      >
        <Text style={[Typography.buttonText, { color: Colors.textSecondary }]}>
          No acepto, cerrar sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing["3xl"],
    gap: Spacing.base,
  },
  button: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  disabled: { opacity: 0.5 },
  secondary: { alignItems: "center", paddingVertical: Spacing.md },
});
