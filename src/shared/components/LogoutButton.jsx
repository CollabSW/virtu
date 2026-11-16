import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, typography } from '../../config/theme';
import { useAuth } from '../context/AuthContext';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Pressable onPress={logout} hitSlop={8} accessibilityRole="button">
      <Text style={styles.text}>Cerrar sesión</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: typography.body,
    color: colors.primary,
  },
});
