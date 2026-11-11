import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../config/theme';
import { ROLES } from '../config/roles';
import { useAuth } from '../shared/context/AuthContext';
import StudentNavigator from './StudentNavigator';
import TeacherNavigator from './TeacherNavigator';

// Elige el stack según el rol. Cada rol tiene su propio stack separado,
// así que un estudiante no puede navegar a pantallas docentes ni al revés.
export default function RoleNavigator() {
  const { rol } = useAuth();

  if (rol === ROLES.ESTUDIANTE) {
    return <StudentNavigator />;
  }
  if (rol === ROLES.DOCENTE) {
    return <TeacherNavigator />;
  }
  return <UnknownRole />;
}

function UnknownRole() {
  const { logout } = useAuth();

  useEffect(() => {
    // El Alert sigue visible aunque logout() devuelva la app al login.
    Alert.alert('Rol no reconocido', 'Tu cuenta no tiene un rol válido. Contacta a tu docente.');
    logout();
  }, [logout]);

  return (
    <View style={styles.container}>
      <Text style={styles.body}>Rol no reconocido</Text>
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
  body: {
    fontSize: typography.body,
    color: colors.text,
  },
});
