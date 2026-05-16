import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export const ForcePasswordChangeScreen = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuth, token } = useAuthStore();

  const handleUpdatePassword = async () => {
    if (!password.trim() || !passwordConfirmation.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Usamos el token existente que ya se seteó en LoginScreen
      const res = await authService.updatePassword({
        password,
        password_confirmation: passwordConfirmation,
      });

      Alert.alert("Éxito", res.message);

      // Actualizamos el usuario en el store con el nuevo estado force_password_change: false
      if (token && res.user) {
        setAuth(res.user, token);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Error al actualizar la contraseña.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={Typography.h2}>Actualizar Contraseña</Text>
          <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
            Por seguridad, debes crear una nueva contraseña antes de continuar.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={Typography.label}>Nueva Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textMuted} />
                ) : (
                  <Eye size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={Typography.label}>Confirmar Contraseña</Text>
            <View style={styles.inputWrapper}>
              <CheckCircle size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={[Typography.buttonText, { color: Colors.white }]}>
                Guardar Contraseña
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
    justifyContent: "center",
  },
  headerSection: { marginBottom: Spacing.xl },
  form: { gap: Spacing.base },
  fieldGroup: { gap: Spacing.sm },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.7 },
});
