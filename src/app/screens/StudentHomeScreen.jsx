// Placeholder: el contenido real lo implementa Gadiel en C1-08
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../config/theme';
import { useAuth } from '../../shared/context/AuthContext';

export default function StudentHomeScreen() {
  const { usuario } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Estudiante</Text>
      <Text style={styles.body}>{usuario?.nombreCompleto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
  },
});
