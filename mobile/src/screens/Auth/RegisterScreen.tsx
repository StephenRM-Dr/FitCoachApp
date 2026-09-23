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
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState<"coach" | "client">("client");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [coachCode, setCoachCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth, setError, error, clearError } = useAuthStore();

  const passwordStrength = (() => {
    if (password.length === 0)
      return { level: 0, label: "", color: Colors.textMuted };
    if (password.length < 6)
      return { level: 1, label: "Débil", color: Colors.danger };
    if (password.length < 10)
      return { level: 2, label: "Media", color: Colors.warning };
    return { level: 3, label: "Fuerte", color: Colors.success };
  })();

  const handleRegister = async () => {
    clearError();
    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      setError("Por favor completa todos los campos.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (role === "coach" && !coachCode.trim()) {
      setError("Ingresa tu código de invitación de coach.");
      return;
    }
    if (!gender) {
      setError("Selecciona tu género.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
        gender: gender as "male" | "female",
        ...(role === "coach" ? { coach_code: coachCode.trim() } : {}),
      });
      setAuth(
        { ...data.user, role: data.user.role || role },
        data.access_token,
      );
    } catch (err: any) {
      const message =
        err.response?.data?.errors?.coach_code?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        "Error al registrar. Intenta de nuevo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    icon: React.ReactNode,
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options: {
      placeholder?: string;
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address";
      autoCapitalize?: "none" | "sentences" | "words";
    } = {},
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={Typography.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon}
        <TextInput
          style={styles.input}
          placeholder={options.placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (error) clearError();
          }}
          secureTextEntry={options.secureTextEntry && !showPassword}
          keyboardType={options.keyboardType || "default"}
          autoCapitalize={options.autoCapitalize || "sentences"}
        />
        {options.secureTextEntry && (
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
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={Typography.h2}>Crea tu cuenta</Text>
          <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
            Únete a FitCoach Pro y comienza tu transformación.
          </Text>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Role selector */}
        <View style={styles.roleSection}>
          <Text style={Typography.label}>¿Cómo usarás FitCoach?</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "client" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("client")}
              activeOpacity={0.7}
            >
              <User
                size={20}
                color={role === "client" ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleText,
                  role === "client" && styles.roleTextActive,
                ]}
              >
                Asesorado
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "coach" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("coach")}
              activeOpacity={0.7}
            >
              <ShieldCheck
                size={20}
                color={role === "coach" ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleText,
                  role === "coach" && styles.roleTextActive,
                ]}
              >
                Coach
              </Text>
            </TouchableOpacity>
          </View>
          {role === "coach" &&
            renderInput(
              <ShieldCheck size={20} color={Colors.textMuted} />,
              "Código de invitación de Coach",
              coachCode,
              setCoachCode,
              {
                placeholder: "Código proporcionado por FitCoach",
                autoCapitalize: "none",
              },
            )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {renderInput(
            <User size={20} color={Colors.textMuted} />,
            "Nombre Completo",
            name,
            setName,
            { placeholder: "Juan Pérez", autoCapitalize: "words" },
          )}

          {renderInput(
            <Mail size={20} color={Colors.textMuted} />,
            "Email",
            email,
            setEmail,
            {
              placeholder: "tu@email.com",
              keyboardType: "email-address",
              autoCapitalize: "none",
            },
          )}

          <View style={styles.fieldGroup}>
            <Text style={Typography.label}>Género</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  gender === "female" && styles.roleButtonActive,
                ]}
                onPress={() => setGender("female")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleText,
                    gender === "female" && styles.roleTextActive,
                  ]}
                >
                  Femenino
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  gender === "male" && styles.roleButtonActive,
                ]}
                onPress={() => setGender("male")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roleText,
                    gender === "male" && styles.roleTextActive,
                  ]}
                >
                  Masculino
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderInput(
            <Lock size={20} color={Colors.textMuted} />,
            "Contraseña",
            password,
            setPassword,
            {
              placeholder: "Mínimo 8 caracteres",
              secureTextEntry: true,
              autoCapitalize: "none",
            },
          )}

          {/* Password strength */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBarBg}>
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${(passwordStrength.level / 3) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[Typography.caption, { color: passwordStrength.color }]}
              >
                {passwordStrength.label}
              </Text>
            </View>
          )}

          {renderInput(
            <Lock size={20} color={Colors.textMuted} />,
            "Confirmar Contraseña",
            passwordConfirmation,
            setPasswordConfirmation,
            {
              placeholder: "••••••••",
              secureTextEntry: true,
              autoCapitalize: "none",
            },
          )}

          {/* Register button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
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
                  Registrarme
                </Text>
                <ArrowRight size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={Typography.bodySmall}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[Typography.link, { fontSize: 14 }]}>
              Inicia Sesión
            </Text>
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
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["2xl"],
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: Spacing.md,
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
  roleSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  roleRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  roleTextActive: {
    color: Colors.white,
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
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
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
    marginTop: Spacing.xl,
    marginBottom: Spacing.base,
  },
});
