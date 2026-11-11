// Temporal para probar roles; se reemplaza por la LoginScreen de Hassan (C1-05)
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../config/theme';
import { useAuth } from '../../shared/context/AuthContext';

const CREDENCIALES = {
  estudiante: { username: 'alumno1', password: 'Estudiante123!' },
  docente: { username: 'profesor1', password: 'Docente123!' },
};

export default function DevLoginScreen() {
  const { login } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const entrar = async ({ username, password }) => {
    setError(null);
    setCargando(true);
    try {
      await login(username, password);
    } catch (e) {
      setError(e.message);
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtu (login de prueba)</Text>

      <Pressable
        style={styles.button}
        disabled={cargando}
        onPress={() => entrar(CREDENCIALES.estudiante)}
      >
        <Text style={styles.buttonText}>Entrar como estudiante</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        disabled={cargando}
        onPress={() => entrar(CREDENCIALES.docente)}
      >
        <Text style={styles.buttonText}>Entrar como docente</Text>
      </Pressable>

      {cargando && <ActivityIndicator color={colors.primary} />}
      {error && <Text style={styles.body}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.body,
    color: colors.background,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
  },
});
