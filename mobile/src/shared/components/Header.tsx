import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type Props = { title: string; subtitle?: string };

export function Header({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: 6 } });
