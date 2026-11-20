import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/context/AuthContext';
import UnitsScreen from '@/modules/calculo/screens/UnitsScreen';

export default function AuthNavigator() {
  const { user, restoring, restoreError, restore, logout } = useAuth();
  const theme = useTheme();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await logout();
    } catch {
      setError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <ThemedText type="title">Cálculo</ThemedText>
        {restoring ? <ActivityIndicator accessibilityLabel="Verificando sesión" /> : restoreError ? (
          <>
            <ThemedText accessibilityRole="alert">{restoreError}</ThemedText>
            <Button title="Reintentar" onPress={restore} />
          </>
        ) : user ? (
          <>
            <ThemedText>{user.nombreCompleto}</ThemedText>
            {user.rol === 'ESTUDIANTE' ? <UnitsScreen /> : <ThemedText type="subtitle">Inicio docente</ThemedText>}
            {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
            <Button title="Cerrar sesión" disabled={busy} onPress={signOut} />
          </>
        ) : <LoginForm />}
      </ScrollView>
    </SafeAreaView>
  );
}

function LoginForm() {
  const { login, notice } = useAuth();
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const disabled = busy || !username.trim() || !password;

  async function submit() {
    if (disabled) return;
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
    } catch (failure) {
      setError(failure instanceof Error && 'status' in failure && failure.status === 401
        ? 'Usuario o contraseña incorrectos.'
        : failure instanceof Error ? failure.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];
  return (
    <>
      <ThemedText type="subtitle">Iniciar sesión</ThemedText>
      {!!notice && <ThemedText accessibilityRole="alert">{notice}</ThemedText>}
      <ThemedText>Usuario</ThemedText>
      <TextInput accessibilityLabel="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none"
        autoCorrect={false} autoComplete="username" editable={!busy} style={inputStyle} />
      <ThemedText>Contraseña</ThemedText>
      <TextInput accessibilityLabel="Contraseña" value={password} onChangeText={setPassword}
        secureTextEntry autoComplete="current-password" editable={!busy} style={inputStyle} onSubmitEditing={submit} />
      {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <Button title={busy ? 'Iniciando sesión…' : 'Entrar'} disabled={disabled} onPress={submit} />
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 20, paddingBottom: 110, gap: 16 },
  input: { minHeight: 48, fontSize: 16, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 },
});
