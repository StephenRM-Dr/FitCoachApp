import { StyleSheet, Platform } from 'react-native';
import { Colors } from './colors';

/**
 * FitCoach Pro - Typography System
 * Centralized text styles for the entire app.
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
    fontFamily,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    fontFamily,
    lineHeight: 20,
  },

  // Labels & captions
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    fontFamily,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Links & buttons
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily,
  },
});
