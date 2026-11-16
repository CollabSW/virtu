import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../../config/theme';

/** Botón reutilizable. Ej.: <Button title="Continuar" onPress={continuar} /> */
export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}) {
  const isDisabled = disabled || loading;
  const isSecondary = variant === 'secondary';
  const textColor = isDisabled
    ? colors.disabledText
    : isSecondary
      ? colors.primary
      : colors.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondary : styles.primary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && (isSecondary ? styles.secondaryPressed : styles.primaryPressed),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} accessibilityLabel="Cargando" />
      ) : (
        <Text style={[styles.label, { color: textColor }, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: { backgroundColor: colors.disabledBackground, borderColor: colors.disabledBackground },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  secondaryPressed: { backgroundColor: colors.surface },
  label: {
    fontSize: typography.button,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
});
