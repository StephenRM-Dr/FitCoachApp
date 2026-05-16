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
  Image,
  Alert,
  Modal,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { setAuth, setError, error, clearError } = useAuthStore();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword(email.trim());
      Alert.alert(
        "Éxito",
        res.message ||
          "Se ha enviado una nueva contraseña a tu correo electrónico.",
      );
      setModalVisible(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Error al intentar restablecer la contraseña.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearError();
    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login({ email: email.trim(), password });
      setAuth(
        { ...data.user, role: data.user.role || "client" },
        data.access_token,
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Credenciales incorrectas. Intenta de nuevo.";
      setError(message);
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
        {/* Logo & Branding */}
        <View style={styles.brandSection}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>FitCoach Pro</Text>
          <Text style={styles.tagline}>Tu transformación comienza aquí</Text>
        </View>

        {/* Welcome text */}
        <View style={styles.headerSection}>
          <Text style={Typography.h2}>Bienvenido</Text>
          <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
            Inicia sesión para continuar con tu entrenamiento.
          </Text>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={Typography.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={Typography.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textMuted} />
                ) : (
                  <Eye size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password link */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => setModalVisible(true)}
          >
            <Text style={Typography.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* 2. EL MODAL (Elige uno o mezcla según tu gusto) */}

          {/* Opción A: Estilo FlatList (Recomendado, más limpio) */}

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Encabezado del modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
                  <Text style={styles.modalSubtitle}>
                    Ingresa tu correo electrónico para enviarte un enlace de
                    restablecimiento.
                  </Text>
                </View>

                {/* Campo de correo */}
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Botones de acción */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.resetButton]}
                    onPress={handleResetPassword}
                  >
                    <Text style={styles.modalButtonText}>Restablecer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Text
                  style={[
                    Typography.buttonText,
                    { color: Colors.white, marginRight: Spacing.sm },
                  ]}
                >
                  Iniciar Sesión
                </Text>
                <ArrowRight size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={Typography.bodySmall}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={[Typography.link, { fontSize: 14 }]}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["2xl"],
  },
  brandSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  headerSection: {
    marginBottom: Spacing.xl,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  errorText: {
    color: Colors.dangerLight,
    fontSize: 13,
    fontWeight: "500",
  },
  form: {
    gap: Spacing.base,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
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
  forgotPassword: {
    alignSelf: "flex-end",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.bg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  resetButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
