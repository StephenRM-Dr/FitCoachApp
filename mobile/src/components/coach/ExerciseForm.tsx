import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Plus, X } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { coachService } from "../../services/coachService";
import {
  Exercise,
  ExerciseTaxonomy,
  NewExercise,
  TaxonomyOption,
} from "../../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  muscleGroupColor,
} from "../../theme";

const MAX_PRIMARY = 4;
// Chips de 36 pt + 4 arriba/abajo ≈ 44 pt de zona táctil.
const CHIP_HIT_SLOP = { top: 4, bottom: 4 };
const MAX_SECONDARY = 6;

interface Props {
  taxonomy: ExerciseTaxonomy;
  initialName?: string;
  onCancel: () => void;
  onCreated: (exercise: Exercise) => void;
}

/**
 * Alta de un ejercicio con el formato del catálogo. Todo sale de listas
 * cerradas (taxonomía del backend) salvo contraindicaciones, cues y notas,
 * que son texto libre. El grupo muscular no se elige: lo calcula el backend
 * a partir del primer músculo primario.
 */
export function ExerciseForm({
  taxonomy,
  initialName = "",
  onCancel,
  onCreated,
}: Props) {
  const [name, setName] = useState(initialName);
  const [pattern, setPattern] = useState("");
  const [primary, setPrimary] = useState<string[]>([]);
  const [secondary, setSecondary] = useState<string[]>([]);
  const [equipment, setEquipment] = useState("");
  const [level, setLevel] = useState("");
  const [contraindications, setContraindications] = useState<string[]>([]);
  const [cues, setCues] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: NewExercise) => coachService.createExercise(data),
    onSuccess: onCreated,
    onError: (err: any) => {
      const errors = err.response?.data?.errors;
      setError(
        (errors && (Object.values(errors)[0] as string[])?.[0]) ||
          "No se pudo crear el ejercicio. Intenta de nuevo.",
      );
    },
  });

  // Un músculo es primario o secundario, nunca ambos.
  const togglePrimary = (key: string) => {
    setSecondary((s) => s.filter((m) => m !== key));
    setPrimary((p) =>
      p.includes(key)
        ? p.filter((m) => m !== key)
        : p.length < MAX_PRIMARY
          ? [...p, key]
          : p,
    );
  };
  const toggleSecondary = (key: string) => {
    if (primary.includes(key)) return;
    setSecondary((s) =>
      s.includes(key)
        ? s.filter((m) => m !== key)
        : s.length < MAX_SECONDARY
          ? [...s, key]
          : s,
    );
  };

  const mainGroup = primary.length
    ? pattern === "movilidad"
      ? "Movilidad"
      : taxonomy.muscles.find((m) => m.key === primary[0])?.group
    : null;

  const handleSubmit = () => {
    setError(null);
    const missing = [
      !name.trim() && "nombre",
      !pattern && "patrón",
      !primary.length && "al menos un músculo primario",
      !equipment && "equipamiento",
      !level && "nivel",
    ].filter(Boolean);
    if (missing.length) {
      setError(`Falta: ${missing.join(", ")}.`);
      return;
    }
    mutation.mutate({
      name: name.trim(),
      pattern,
      primary_muscles: primary,
      secondary_muscles: secondary,
      equipment,
      level,
      contraindications,
      technical_cues: cues,
      notes: notes.trim() || null,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      // iOS: desplaza el contenido para que el teclado no tape las notas.
      automaticallyAdjustKeyboardInsets
    >
      <FieldLabel text="Nombre" required />
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Remo con pecho apoyado"
        placeholderTextColor={Colors.textMuted}
        maxLength={100}
        accessibilityLabel="Nombre del ejercicio"
      />

      <FieldLabel text="Patrón de movimiento" required />
      <ChipGroup
        options={taxonomy.patterns}
        selected={[pattern]}
        onToggle={(key) => setPattern(key === pattern ? "" : key)}
        label="Patrón de movimiento"
      />

      <FieldLabel
        text={`Músculos primarios (máx. ${MAX_PRIMARY})`}
        required
        hint={
          mainGroup
            ? `Grupo en el catálogo: ${mainGroup} (según el primero elegido)`
            : "El primero que elijas define el grupo del ejercicio."
        }
      />
      <MuscleSelector
        taxonomy={taxonomy}
        selected={primary}
        disabled={[]}
        onToggle={togglePrimary}
        label="primario"
      />

      <FieldLabel text={`Músculos secundarios (máx. ${MAX_SECONDARY})`} />
      <MuscleSelector
        taxonomy={taxonomy}
        selected={secondary}
        disabled={primary}
        onToggle={toggleSecondary}
        label="secundario"
      />

      <FieldLabel text="Equipamiento" required />
      <ChipGroup
        options={taxonomy.equipment}
        selected={[equipment]}
        onToggle={(key) => setEquipment(key === equipment ? "" : key)}
        label="Equipamiento"
      />

      <FieldLabel text="Nivel" required />
      <ChipGroup
        options={taxonomy.levels}
        selected={[level]}
        onToggle={(key) => setLevel(key === level ? "" : key)}
        label="Nivel"
      />

      <FieldLabel
        text="Contraindicaciones"
        hint="Ej. flexión lumbar excesiva, no despegar pelvis del respaldo"
      />
      <TagInput
        values={contraindications}
        onChange={setContraindications}
        placeholder="Añadir contraindicación"
        maxLength={150}
      />

      <FieldLabel
        text="Cues técnicos"
        hint="Indicaciones que verá el asesorado al ejecutarlo"
      />
      <TagInput
        values={cues}
        onChange={setCues}
        placeholder="Añadir cue técnico"
        maxLength={200}
      />

      <FieldLabel text="Notas" />
      <TextInput
        style={[styles.input, styles.notes]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Contexto para ti (mesociclo, variantes, observaciones…)"
        placeholderTextColor={Colors.textMuted}
        multiline
        maxLength={1000}
        accessibilityLabel="Notas del ejercicio"
      />

      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={onCancel}
          accessibilityRole="button"
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, mutation.isPending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
          accessibilityRole="button"
        >
          {mutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Crear y añadir</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function FieldLabel({
  text,
  required,
  hint,
}: {
  text: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.fieldLabel}>
      <Text style={Typography.label}>
        {text}
        {required && <Text style={{ color: Colors.danger }}> *</Text>}
      </Text>
      {hint && <Text style={Typography.caption}>{hint}</Text>}
    </View>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
  label,
  color = Colors.primaryDark,
}: {
  options: TaxonomyOption[];
  selected: string[];
  onToggle: (key: string) => void;
  label: string;
  color?: string;
}) {
  return (
    <View
      style={styles.chipWrap}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.key);
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.chip,
              active && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onToggle(opt.key)}
            hitSlop={CHIP_HIT_SLOP}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextOnDark]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Músculos agrupados por grupo amplio, con el color de cada grupo. */
function MuscleSelector({
  taxonomy,
  selected,
  disabled,
  onToggle,
  label,
}: {
  taxonomy: ExerciseTaxonomy;
  selected: string[];
  disabled: string[];
  onToggle: (key: string) => void;
  label: string;
}) {
  return (
    <View style={{ gap: Spacing.sm }}>
      {taxonomy.groups
        .filter((g) => taxonomy.muscles.some((m) => m.group === g))
        .map((group) => (
          <View key={group}>
            <Text
              style={[styles.groupTitle, { color: muscleGroupColor(group) }]}
            >
              {group}
            </Text>
            <View style={styles.chipWrap}>
              {taxonomy.muscles
                .filter((m) => m.group === group)
                .map((m) => {
                  const active = selected.includes(m.key);
                  const isDisabled = disabled.includes(m.key);
                  const color = muscleGroupColor(group);
                  return (
                    <TouchableOpacity
                      key={m.key}
                      style={[
                        styles.chip,
                        active && {
                          backgroundColor: color,
                          borderColor: color,
                        },
                        isDisabled && styles.chipDisabled,
                      ]}
                      onPress={() => onToggle(m.key)}
                      disabled={isDisabled}
                      hitSlop={CHIP_HIT_SLOP}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${m.label}, músculo ${label}${isDisabled ? ", ya elegido como primario" : ""}`}
                      accessibilityState={{
                        checked: active,
                        disabled: isDisabled,
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        ))}
    </View>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
  maxLength,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  maxLength: number;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (value && !values.includes(value) && values.length < 10) {
      onChange([...values, value]);
    }
    setDraft("");
  };

  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={styles.tagRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          maxLength={maxLength}
          returnKeyType="done"
          accessibilityLabel={placeholder}
        />
        <TouchableOpacity
          style={styles.tagAdd}
          onPress={add}
          accessibilityRole="button"
          accessibilityLabel={placeholder}
        >
          <Plus size={18} color={Colors.primaryLight} />
        </TouchableOpacity>
      </View>
      {values.map((value) => (
        <View key={value} style={styles.tag}>
          <Text style={[Typography.bodySmall, { flex: 1 }]}>{value}</Text>
          <TouchableOpacity
            onPress={() => onChange(values.filter((v) => v !== value))}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${value}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.sm,
  },
  fieldLabel: { marginTop: Spacing.md, gap: 2 },
  input: {
    backgroundColor: Colors.bgCard,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notes: { minHeight: 80, textAlignVertical: "top" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  chipDisabled: { opacity: 0.35 },
  chipText: { color: Colors.textSecondary, fontWeight: "600", fontSize: 13 },
  // Opciones únicas: relleno primaryDark + blanco (5.2:1), como el resto de
  // píldoras de la app. Músculos: color claro del grupo + textInverse (≥6.5:1).
  chipTextOnDark: { color: Colors.white },
  chipTextActive: { color: Colors.textInverse },
  groupTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  tagRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  tagAdd: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  error: { color: Colors.danger, marginTop: Spacing.md },
  actions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryDark,
  },
  cancel: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: { color: Colors.textSecondary, fontWeight: "700" },
  submitText: { color: Colors.white, fontWeight: "700" },
});
