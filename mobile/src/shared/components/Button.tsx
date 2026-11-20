import { Pressable, StyleSheet } from 'react-native';
import type { PressableProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  accessibilityLabel?: string;
};

export function Button({ title, accessibilityLabel, disabled, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ ...props.accessibilityState, disabled: disabled ?? undefined }}
      disabled={disabled}
      style={(state) => [
        styles.button,
        { backgroundColor: theme.text, opacity: disabled ? 0.4 : state.pressed ? 0.75 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <ThemedText style={{ color: theme.background, fontWeight: '700' }}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 16 },
});
