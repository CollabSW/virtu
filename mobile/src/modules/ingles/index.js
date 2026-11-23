import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../config/theme';

export function InglesHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inglés</Text>
    </View>
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
