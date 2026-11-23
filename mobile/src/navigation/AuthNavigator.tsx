import { Fragment, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { useAuth } from '@/shared/context/AuthContext';
import { registerStudent } from '@/shared/services/authService';
import UnitsScreen from '@/modules/calculo/screens/UnitsScreen';
import CalculusGlossary from '@/modules/calculo/screens/CalculusGlossary';
import TeacherDashboard from '@/shared/features/teacher-dashboard/TeacherDashboard';
import { useMatiasDesign } from '@/modules/calculo/components/matiasDesign';

export default function AuthNavigator() {
  const { user, restoring, restoreError, restore, logout } = useAuth();
  const theme = useTheme();
  const design = useMatiasDesign();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');
  const loginVisible = !user && !restoring && !restoreError && !showRegistration;

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
    <SafeAreaView style={[styles.page, { backgroundColor: loginVisible ? design.background : theme.background }]} edges={['top', 'left', 'right']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, loginVisible && styles.loginContent]}>
        {loginVisible ? <View accessibilityLabel="Virtu Cálculo" style={[styles.loginBrand, { borderColor: design.border }]}>
          <View style={[styles.brandMark, { backgroundColor: design.button }]}><ThemedText style={styles.brandLetter}>V</ThemedText></View>
          <ThemedText style={{ color: design.text, fontFamily: design.bold, fontSize: 20 }}>Virtu</ThemedText>
          <ThemedText style={{ color: design.muted, fontFamily: design.regular, fontSize: 18 }}>· Cálculo</ThemedText>
        </View> : <ThemedText accessibilityRole="header" style={[styles.brand, { color: theme.success, borderColor: theme.backgroundSelected }]}>Virtu Cálculo</ThemedText>}
        {restoring ? <ActivityIndicator accessibilityLabel="Verificando sesión" /> : restoreError ? (
          <>
            <ThemedText accessibilityRole="alert">{restoreError}</ThemedText>
            <Button title="Reintentar" onPress={restore} />
          </>
        ) : user ? (
          <>
            {user.rol === 'ESTUDIANTE'
              ? <StudentHome name={user.nombreCompleto} />
              : <TeacherDashboard name={user.nombreCompleto} />}
            {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
            <Button title="Cerrar sesión" disabled={busy} onPress={signOut} />
          </>
        ) : showRegistration ? (
          <RegisterForm
            onCancel={() => setShowRegistration(false)}
            onRegistered={username => {
              setRegisteredUsername(username);
              setShowRegistration(false);
            }}
          />
        ) : (
          <LoginForm registeredUsername={registeredUsername} onRegister={() => {
            setRegisteredUsername('');
            setShowRegistration(true);
          }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentHome({ name }: { name: string }) {
  const [glossary, setGlossary] = useState(false);
  const [progress, setProgress] = useState(false);
  if (glossary) return <CalculusGlossary close={() => setGlossary(false)} />;
  if (progress) return <UnitsScreen progressOnly onClose={() => setProgress(false)} />;
  return (
    <>
      <Header title="Inicio de Cálculo" subtitle={`Hola, ${name}`} />
      <Button title="Glosario de Cálculo" onPress={() => setGlossary(true)} />
      <Button title="Mi progreso" onPress={() => setProgress(true)} />
      <UnitsScreen />
    </>
  );
}

function LoginForm({ registeredUsername, onRegister }: { registeredUsername: string; onRegister: () => void }) {
  const { login, notice } = useAuth();
  const design = useMatiasDesign();
  const [username, setUsername] = useState(registeredUsername);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const inputStyle = [styles.loginInput, { color: design.text, backgroundColor: design.surface,
    fontFamily: design.regular, borderColor: design.border }];
  return (
    <View style={styles.loginForm}>
      <View style={styles.welcome}>
        <ThemedText accessibilityRole="header" style={[styles.loginTitle, { color: design.text, fontFamily: design.bold }]}>Bienvenido a Virtu</ThemedText>
        <ThemedText style={{ color: design.muted, fontFamily: design.regular }}>Tu espacio para aprender.</ThemedText>
      </View>
      <Card style={[styles.loginCallout, { backgroundColor: design.button }]}>
        <View style={styles.calloutHeading}>
          <Image source={require('../../assets/figma/matias/learn.svg')} style={{ width: 18.333, height: 15 }} contentFit="contain" accessible={false} />
          <ThemedText style={{ color: design.onButton, fontFamily: design.semibold, fontSize: 18 }}>Aprende a tu ritmo</ThemedText>
        </View>
        <ThemedText style={{ color: design.onButton, fontFamily: design.regular, marginLeft: 26 }}>Estudia Cálculo y consulta tu progreso.</ThemedText>
      </Card>
      {!!registeredUsername && <ThemedText accessibilityLiveRegion="polite">Cuenta creada. Ya puedes iniciar sesión.</ThemedText>}
      {!!notice && <ThemedText accessibilityRole="alert">{notice}</ThemedText>}
      <View style={styles.loginField}>
        <ThemedText style={{ color: design.text, fontFamily: design.semibold }}>Usuario</ThemedText>
        <TextInput accessibilityLabel="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none"
          autoCorrect={false} autoComplete="username" editable={!busy} style={inputStyle}
          placeholder="Tu usuario" placeholderTextColor={design.muted} />
      </View>
      <View style={styles.loginField}>
        <ThemedText style={{ color: design.text, fontFamily: design.semibold }}>Contraseña</ThemedText>
        <View style={styles.passwordField}>
          <TextInput accessibilityLabel="Contraseña" value={password} onChangeText={setPassword}
            secureTextEntry={!showPassword} autoComplete="current-password" editable={!busy}
            style={[inputStyle, { paddingRight: 56 }]} onSubmitEditing={submit} />
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityState={{ checked: showPassword, disabled: busy }} disabled={busy}
            onPress={() => setShowPassword(value => !value)} style={({ pressed }) => [styles.passwordToggle, { opacity: pressed ? 0.6 : 1 }]}>
            <Image source={require('../../assets/figma/matias/eye.svg')} style={{ width: 18.333, height: 12.5 }} contentFit="contain" accessible={false} />
          </Pressable>
        </View>
      </View>
      {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <Button title={busy ? 'Iniciando sesión…' : 'Iniciar sesión'} disabled={disabled} onPress={submit}
        style={[styles.loginButton, { backgroundColor: design.button }]}
        textStyle={{ color: design.onButton, fontFamily: design.semibold }}
        icon={busy ? <ActivityIndicator color={design.onButton} /> : <Image source={require('../../assets/figma/matias/login-arrow.svg')} style={{ width: 12, height: 12 }} contentFit="contain" accessible={false} />} />
      <Button title="Crear cuenta" disabled={busy} onPress={onRegister}
        style={[styles.loginButton, { backgroundColor: design.subtle, marginTop: -8 }]}
        textStyle={{ color: design.text, fontFamily: design.semibold }} />
      <View style={styles.loginFooter}>
        <Image source={require('../../assets/figma/matias/book.svg')} style={{ width: 14.667, height: 10.667 }} contentFit="contain" accessible={false} />
        <ThemedText style={{ color: design.muted, fontFamily: design.regular, flexShrink: 1 }}>Plataforma Académica Virtu</ThemedText>
      </View>
    </View>
  );
}

function RegisterForm({ onCancel, onRegistered }: { onCancel: () => void; onRegistered: (username: string) => void }) {
  const theme = useTheme();
  const [form, setForm] = useState({ nombreCompleto: '', username: '', password: '', colegioId: '', cursoId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.textSecondary }];

  async function submit() {
    if (submitting.current) return;
    const { password } = form;
    const username = form.username.trim();
    const nombreCompleto = form.nombreCompleto.trim();
    const ids = [form.colegioId.trim(), form.cursoId.trim()];
    if (!username || !nombreCompleto || !password) {
      setError('Completa tu nombre, usuario y contraseña.');
      return;
    }
    if (ids.some(id => !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)))) {
      setError('Ingresa un ID de colegio y de curso válido.');
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      await registerStudent({ nombreCompleto, username, password, colegioId: Number(ids[0]), cursoId: Number(ids[1]) });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo crear la cuenta.');
      submitting.current = false;
      setBusy(false);
      return;
    }
    onRegistered(username);
  }

  const fields = [
    { key: 'nombreCompleto', label: 'Nombre completo', autoComplete: 'name' },
    { key: 'username', label: 'Usuario', autoComplete: 'username', autoCapitalize: 'none', autoCorrect: false },
    { key: 'password', label: 'Contraseña', autoComplete: 'new-password', secureTextEntry: true },
    { key: 'colegioId', label: 'ID de colegio', keyboardType: 'number-pad' },
    { key: 'cursoId', label: 'ID de curso', keyboardType: 'number-pad' },
  ] as const;

  return (
    <>
      <ThemedText type="subtitle">Crear cuenta de estudiante</ThemedText>
      <ThemedText>Pide a tu colegio los ID de colegio y curso.</ThemedText>
      {fields.map(({ key, label, ...props }) => (
        <Fragment key={key}>
          <ThemedText>{label}</ThemedText>
          <TextInput {...props} accessibilityLabel={label} style={inputStyle} editable={!busy}
            value={form[key]} onChangeText={value => setForm(current => ({ ...current, [key]: value }))} />
        </Fragment>
      ))}
      {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      <Button title={busy ? 'Creando cuenta…' : 'Registrarme'} disabled={busy} onPress={submit}
        style={{ backgroundColor: theme.success }} />
      <Button title="Volver a iniciar sesión" disabled={busy} onPress={onCancel} />
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 20, paddingBottom: 110, gap: 16, width: '100%', maxWidth: 620, alignSelf: 'center' },
  brand: { fontSize: 22, fontWeight: '700', paddingBottom: 12, borderBottomWidth: 1 },
  input: { minHeight: 48, fontSize: 16, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 },
  loginContent: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  loginBrand: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  brandMark: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  brandLetter: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  loginForm: { gap: 24, paddingTop: 24 },
  welcome: { gap: 4 },
  loginTitle: { fontSize: 28, lineHeight: 36, letterSpacing: -0.7 },
  loginCallout: { borderRadius: 8, padding: 20, gap: 4 },
  calloutHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  loginField: { gap: 4 },
  loginInput: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8 },
  passwordField: { position: 'relative' },
  passwordToggle: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  loginButton: { borderRadius: 8, minHeight: 48, paddingVertical: 12 },
  loginFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 20 },
});
