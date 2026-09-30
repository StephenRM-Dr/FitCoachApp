/**
 * FitCoach Pro - Color Palette
 * Centralized color system for the entire app.
 * Dark theme by default, inspired by the Figma design system.
 */
export const Colors = {
  // Primary brand
  primary: "#3b82f6",
  primaryLight: "#60a5fa",
  primaryDark: "#2563eb",

  // Semantic colors
  success: "#10b981",
  successLight: "#34d399",
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  danger: "#ef4444",
  dangerLight: "#f87171",
  info: "#06b6d4",
  infoLight: "#22d3ee",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  orange: "#f97316",

  // Dark theme backgrounds
  bg: "#0f172a",
  bgCard: "#1e293b",
  bgInput: "#1e293b",
  bgElevated: "#334155",

  // Text colors
  textPrimary: "#f8fafc",
  textSecondary: "#d8e0effd",
  textMuted: "#94a3b8", // AA (4.5:1) sobre bg y bgCard; antes #64748b (3.07:1 sobre bgCard)
  textInverse: "#0f172a",

  // Borders
  border: "#334155",
  borderLight: "#475569",
  borderFocus: "#3b82f6",

  // Misc
  white: "#ffffff",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",
  transparent: "transparent",
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * Color de cada grupo muscular amplio del catálogo (mismos grupos que
 * ExerciseTaxonomy::GROUPS en el backend). Se usa en badges y filtros.
 */
export const MuscleGroupColors: Record<string, string> = {
  Pecho: Colors.primary,
  Espalda: Colors.purple,
  Hombros: Colors.orange,
  Brazos: Colors.info,
  Piernas: Colors.success,
  Glúteos: "#ec4899",
  Core: Colors.warning,
  Movilidad: "#14b8a6",
};

export const muscleGroupColor = (group: string | null | undefined) =>
  (group && MuscleGroupColors[group]) || Colors.textMuted;
