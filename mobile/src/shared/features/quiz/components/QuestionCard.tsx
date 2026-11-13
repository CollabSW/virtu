import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import type { Question } from '../screens/QuizScreen';

type Props = {
  question: Question;
  selectedOptionId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onConfirm: () => void;
};

export function QuestionCard({ question, selectedOptionId, disabled, onSelect, onConfirm }: Props) {
  const theme = useTheme();
  return (
    <Card style={styles.card}>
      <ThemedText type="subtitle" style={styles.question}>{question.text}</ThemedText>
      <View accessibilityRole="radiogroup" accessibilityLabel="Opciones de respuesta" style={styles.options}>
        {question.options.map((option, index) => {
          const selected = option.id === selectedOptionId;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={option.text}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onSelect(option.id)}
              style={[
                styles.option,
                {
                  borderColor: selected ? theme.success : theme.textSecondary,
                  backgroundColor: selected ? theme.backgroundSelected : theme.background,
                },
              ]}
            >
              <ThemedText style={styles.optionIndex}>
                {String.fromCharCode(65 + index)}
              </ThemedText>
              <ThemedText style={styles.optionText}>{option.text}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      <Button
        title="Comprobar respuesta"
        accessibilityLabel="Comprobar respuesta"
        disabled={disabled || !selectedOptionId}
        onPress={onConfirm}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 22, borderRadius: 24, gap: 24 },
  question: { fontSize: 28, lineHeight: 36 },
  options: { gap: 12 },
  option: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndex: {
    fontWeight: '700',
    minWidth: 28,
    minHeight: 28,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 0,
  },
  optionText: { flex: 1 },
  button: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 16 },
});
