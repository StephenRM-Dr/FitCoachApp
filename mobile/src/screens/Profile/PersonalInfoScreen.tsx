import React, { useEffect, useState } from "react";
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
import { User, Mail, Briefcase, Target } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { profileService } from "../../services/profileService";
import { ActivityLevel } from "../../services/anamnesisService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligero", label: "Ligero" },
  { value: "activo", label: "Activo" },
  { value: "muy_activo", label: "Muy Activo" },
];

export function PersonalInfoScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { user, token, setAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [mainObjective, setMainObjective] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAge(profile.age != null ? String(profile.age) : "");
      setOccupation(profile.occupation || "");
      setActivityLevel(profile.activity_level || "");
      setMainObjective(profile.main_objective || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      profileService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        age: age ? parseInt(age, 10) : null,
        occupation: occupation.trim() || null,
        activity_level: activityLevel || null,
        main_objective: mainObjective.trim() || null,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["anamnesis"] });
      if (user && token) {
        setAuth({ ...user, name: data.name, email: data.email }, token);
      }
      Alert.alert("Éxito", "Información actualizada correctamente.");
      navigation.goBack();
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        "No se pudo actualizar la información.";
      Alert.alert("Error", message);
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Nombre Completo</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.label}>Edad</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholderTextColor={Colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ width: Spacing.md }} />
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={Typography.label}>Ocupación</Text>
            <View style={styles.inputWrapper}>
              <Briefcase size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholderTextColor={Colors.textMuted}
                value={occupation}
                onChangeText={setOccupation}
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Nivel de Actividad</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillRow}
          >
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.pill,
                  activityLevel === level.value && styles.pillActive,
                ]}
                onPress={() => setActivityLevel(level.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    activityLevel === level.value && styles.pillTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={Typography.label}>Objetivo Principal</Text>
          <View style={styles.inputWrapper}>
            <Target size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.textMuted}
              value={mainObjective}
              onChangeText={setMainObjective}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            updateMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[Typography.buttonText, { color: Colors.white }]}>
              Guardar Cambios
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: "center", alignItems: "center" },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.base,
  },
  fieldGroup: { gap: Spacing.sm },
  fieldRow: { flexDirection: "row" },
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
  pillRow: { flexDirection: "row" },
  pill: {
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: { color: Colors.textSecondary, fontWeight: "600" },
  pillTextActive: { color: Colors.white },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonDisabled: { opacity: 0.7 },
});
