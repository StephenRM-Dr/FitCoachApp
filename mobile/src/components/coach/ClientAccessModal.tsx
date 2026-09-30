import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Eye, EyeOff } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { coachService } from "../../services/coachService";
import { User } from "../../store/authStore";
import { BUSINESS } from "../../config/business";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

type Props =
  | { mode: "create"; onClose: () => void; onCreated: (client: User) => void }
  | { mode: "reset"; client: User; onClose: () => void };

/**
 * El coach da de alta a su asesorado o le asigna una nueva contraseña
 * temporal. No hay envío por correo: al terminar se ofrece compartir los
 * datos de acceso (WhatsApp, etc.). La contraseña es temporal: el asesorado
 * la cambia al primer ingreso.
 */
export function ClientAccessModal(props: Props) {
  const isCreate = props.mode === "create";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(isCreate ? "" : props.client.email);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offerShare = (clientName: string, clientEmail: string) => {
    const message =
      `Hola ${clientName}, este es tu acceso a ${BUSINESS.appName}:\n` +
      `Correo: ${clientEmail}\nContraseña temporal: ${password}\n` +
      `Al entrar te pedirá crear tu propia contraseña.`;
    Alert.alert(
      isCreate ? "Asesorado creado" : "Contraseña actualizada",
      `Comparte estos datos con ${clientName}. La contraseña no se volverá a mostrar.\n\nCorreo: ${clientEmail}\nContraseña temporal: ${password}`,
      [
        { text: "Cerrar", style: "cancel", onPress: props.onClose },
        {
          text: "Compartir",
          onPress: async () => {
            await Share.share({ message }).catch(() => {});
            props.onClose();
          },
        },
      ],
      // En Android tocar fuera cerraría el aviso sin cerrar el formulario.
      { cancelable: false },
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (props.mode === "create") {
        return coachService.createClient({
          name: name.trim(),
          email: email.trim(),
          gender: gender as "male" | "female",
          password,
        });
      }
      await coachService.resetClientPassword(props.client.id, password);
      return props.client;
    },
    onSuccess: (client) => {
      if (props.mode === "create") props.onCreated(client);
      offerShare(client.name, client.email);
    },
    onError: (err: any) => {
      const errors = err.response?.data?.errors;
      setError(
        errors?.email?.[0] ||
          errors?.password?.[0] ||
          errors?.gender?.[0] ||
          err.response?.data?.message ||
          "No se pudo guardar. Intenta de nuevo.",
      );
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (isCreate && (!name.trim() || !email.trim() || !gender)) {
      setError("Completa nombre, correo y sexo.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={props.onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={Typography.h5}>
              {isCreate
                ? "Nuevo Asesorado"
                : `Nueva contraseña de ${props.client.name}`}
            </Text>
            <TouchableOpacity
              onPress={props.onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <X size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[Typography.caption, { marginBottom: Spacing.md }]}>
            {isCreate
              ? "La contraseña es temporal: al entrar por primera vez tu asesorado deberá cambiarla y aceptar los términos."
              : "Se cerrarán sus sesiones abiertas y deberá cambiarla al volver a entrar."}
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          {isCreate && (
            <>
              <Text style={Typography.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ana Pérez"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />

              <Text style={Typography.label}>Correo</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ana@email.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={Typography.label}>Sexo</Text>
              <View style={styles.pillRow}>
                {(
                  [
                    ["female", "Mujer"],
                    ["male", "Hombre"],
                  ] as const
                ).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.pill, gender === value && styles.pillActive]}
                    onPress={() => setGender(value)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        gender === value && styles.pillTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={Typography.label}>Contraseña temporal</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eye}
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

          <TouchableOpacity
            style={[styles.submit, mutation.isPending && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={[Typography.buttonText, { color: Colors.white }]}>
                {isCreate ? "Crear asesorado" : "Guardar contraseña"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
    gap: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  error: {
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  pillRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  pillTextActive: {
    color: Colors.white,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  eye: {
    padding: Spacing.sm,
  },
  submit: {
    backgroundColor: Colors.success,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
});
