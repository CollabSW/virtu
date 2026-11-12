import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../config/theme';

/** Contenedor reutilizable. Ej.: <Card><Text>Contenido</Text></Card> */
export default function Card({ children, style, accessibilityLabel }) {
  return (
    <View style={[styles.card, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
});
