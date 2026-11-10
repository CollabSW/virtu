import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../config/theme';

const Stack = createNativeStackNavigator();

// Placeholder: se reemplaza cuando existan las pantallas reales.
function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtu</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Inicio" component={PlaceholderScreen} />
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
