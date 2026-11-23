import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  accessibilityLabel?: string;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  onClear,
  accessibilityLabel = 'Buscar',
  placeholder = 'Buscar',
}: Props) {
  const theme = useTheme();
  const hasValue = value.length > 0;
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Limpiar búsqueda"
        accessibilityState={{ disabled: !hasValue }}
        disabled={!hasValue}
        onPress={onClear}
        style={styles.clear}
      >
        <ThemedText>Limpiar búsqueda</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#888', borderRadius: 12, paddingHorizontal: 14 },
  clear: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
});
