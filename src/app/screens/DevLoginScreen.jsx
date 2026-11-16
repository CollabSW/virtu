import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../../config/theme';
import Button from '../../shared/components/Button';
import { useAuth } from '../../shared/context/AuthContext';
import { authService } from '../../shared/services/authService';

// Se conserva la ruta y exportación que utiliza actualmente src/app/App.jsx.
export default function DevLoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState({});
  const enviando = useRef(false);
  const passwordInput = useRef(null);

  const entrar = async () => {
    if (enviando.current) return;

    const usuario = username.trim();
    const validacion = {};
    if (!usuario) validacion.username = 'Ingresa tu usuario.';
    if (!password.trim()) validacion.password = 'Ingresa tu contraseña.';
    setErrores(validacion);
    setError(null);
    if (Object.keys(validacion).length) return;

    enviando.current = true;
    setCargando(true);
    try {
      await authService.login(usuario, password);
      // Puente temporal hacia C1-07: el contexto actual recibe credenciales y
      // repite la autenticación con su mock. No admite todavía usuario/token.
      // Cuando C1-07 delegue en authService, unificar la autenticación allí.
      await login(usuario, password);
      setPassword('');
    } catch (e) {
      setError(
        typeof e?.message === 'string' && e.message.trim()
          ? e.message
          : 'No se pudo iniciar sesión. Intenta nuevamente.',
      );
    } finally {
      enviando.current = false;
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={styles.title} accessibilityRole="header">
              Iniciar sesión
            </Text>
            <Text style={styles.description}>Ingresa con tu cuenta de Virtu.</Text>

            <View style={styles.field}>
              <Text style={styles.label} nativeID="username-label">
                Usuario
              </Text>
              <TextInput
                style={[styles.input, errores.username && styles.invalidInput]}
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setErrores((actual) => ({ ...actual, username: undefined }));
                  setError(null);
                }}
                accessibilityLabel="Usuario"
                accessibilityLabelledBy="username-label"
                placeholder="Tu usuario"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                editable={!cargando}
                returnKeyType="next"
                onSubmitEditing={() => passwordInput.current?.focus()}
              />
              {errores.username && (
                <Text style={styles.error} accessibilityLiveRegion="polite">
                  {errores.username}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label} nativeID="password-label">
                Contraseña
              </Text>
              <View style={[styles.passwordRow, errores.password && styles.invalidInput]}>
                <TextInput
                  ref={passwordInput}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrores((actual) => ({ ...actual, password: undefined }));
                    setError(null);
                  }}
                  accessibilityLabel="Contraseña"
                  accessibilityLabelledBy="password-label"
                  placeholder="Tu contraseña"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!mostrarPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  textContentType="password"
                  editable={!cargando}
                  returnKeyType="go"
                  onSubmitEditing={entrar}
                />
                <Pressable
                  onPress={() => setMostrarPassword((actual) => !actual)}
                  disabled={cargando}
                  accessibilityRole="button"
                  accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  accessibilityState={{ disabled: cargando, selected: mostrarPassword }}
                  style={styles.visibilityButton}
                >
                  <Text style={styles.visibilityText}>
                    {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </Pressable>
              </View>
              {errores.password && (
                <Text style={styles.error} accessibilityLiveRegion="polite">
                  {errores.password}
                </Text>
              )}
            </View>

            {error && (
              <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
            <Button
              title="Ingresar"
              onPress={entrar}
              loading={cargando}
              disabled={cargando}
              accessibilityLabel={cargando ? 'Ingresando' : 'Ingresar'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  form: { width: '100%', maxWidth: 440, gap: spacing.lg },
  title: {
    fontSize: typography.title,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  description: { fontSize: typography.body, color: colors.textSecondary },
  field: { gap: spacing.sm },
  label: {
    fontSize: typography.body,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  input: {
    minHeight: 48,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  visibilityButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    flexShrink: 1,
  },
  visibilityText: {
    fontSize: typography.body,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  invalidInput: { borderColor: colors.error },
  error: { fontSize: typography.body, color: colors.error },
});
