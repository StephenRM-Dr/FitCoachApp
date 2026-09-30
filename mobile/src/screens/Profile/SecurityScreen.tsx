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
import { Lock, Eye, EyeOff, CheckCircle, Trash2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export function SecurityScreen() {
  const navigation = useNavigation<any>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const confirmDeleteAccount = () => {
    if (!deletePassword.trim()) {
      Alert.alert("Error", "Ingresa tu contraseña para confirmar.");
      return;
    }
    Alert.alert(
      "Eliminar cuenta",
      "Se borrarán tu cuenta y todos tus datos (perfil, datos de salud, mediciones, entrenamientos). Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar definitivamente",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await authService.deleteAccount(deletePassword);
              await logout();
            } catch (err: any) {
              const message =
                err.response?.data?.errors?.password?.[0] ||
                err.response?.data?.message ||
                "No se pudo eliminar la cuenta. Intenta de nuevo.";
              Alert.alert("Error", message);
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleUpdatePassword = async () => {
    if (
      !currentPassword.trim() ||
      !password.trim() ||
      !passwordConfirmation.trim()
    ) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden.");
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      Alert.alert("Éxito", res.message, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message =
        err.response?.data?.errors?.current_password?.[0] ||
        err.response?.data?.message ||
        "Error al actualizar la contraseña.";
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[Typography.bodySmall, { marginBottom: Spacing.lg }]}>
          Ingresa tu contraseña actual y elige una nueva.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Contraseña Actual</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showPassword}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="Nueva contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors.textMuted} />
              ) : (
                <Eye size={20} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Confirmar Nueva Contraseña</Text>
          <View style={styles.inputWrapper}>
            <CheckCircle size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="Confirmar nueva contraseña"
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
              Actualizar Contraseña
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={[Typography.h5, { color: Colors.danger }]}>
            Eliminar cuenta
          </Text>
          <Text style={Typography.bodySmall}>
            Borra de forma permanente tu cuenta y todos tus datos. Ingresa tu
            contraseña para confirmar.
          </Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel="Contraseña para confirmar la eliminación de la cuenta"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={confirmDeleteAccount}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Eliminar mi cuenta y todos mis datos"
          >
            {deleting ? (
              <ActivityIndicator color={Colors.danger} size="small" />
            ) : (
              <>
                <Trash2 size={18} color={Colors.danger} />
                <Text style={[Typography.buttonText, { color: Colors.danger }]}>
                  Eliminar mi cuenta
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.base,
  },
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
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonDisabled: { opacity: 0.7 },
  dangerZone: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
});
