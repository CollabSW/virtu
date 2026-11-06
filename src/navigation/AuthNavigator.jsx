import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../config/theme';

const Stack = createNativeStackNavigator();

// Placeholder: se reemplaza cuando exista la pantalla de inicio de sesión.
function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
    </View>
  );
}

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    color: colors.text,
  },
});
