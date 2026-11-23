import { Pressable, StyleSheet } from 'react-native';
import type { PressableProps, StyleProp, TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  accessibilityLabel?: string;
  textStyle?: StyleProp<TextStyle>;
  icon?: ReactNode;
};

export function Button({ title, accessibilityLabel, disabled, style, textStyle, icon, ...props }: Props) {
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
        !!icon && { flexDirection: 'row', gap: 8 },
        { backgroundColor: theme.text, opacity: disabled ? 0.4 : state.pressed ? 0.75 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <ThemedText style={[{ color: theme.background, fontWeight: '700' }, textStyle]}>{title}</ThemedText>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 16 },
});
