import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/shared/components/Button';

type Props = {
  visible: boolean;
  isCorrect: boolean;
  explanation: string;
  correctOptionText?: string;
  onContinue: () => void;
};
type Session = { token: symbol | null; active: boolean; used: boolean };

export function FeedbackModal({ visible, isCorrect, explanation, correctOptionText, onContinue }: Props) {
  const theme = useTheme();
  const heading = useRef<Text>(null);
  const priorVisibility = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const token = useMemo(() => (visible ? Symbol('feedback-session') : null), [visible]);
  const session = useRef<Session | null>(null);
  const continueCallback = useRef(onContinue);

  useLayoutEffect(() => {
    continueCallback.current = onContinue;
  }, [onContinue]);

  useLayoutEffect(() => {
    if (!visible) return undefined;
    const currentSession: Session = { token, active: true, used: false };
    session.current = currentSession;
    return () => {
      currentSession.active = false;
    };
  }, [token, visible]);

  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    if (visible && !priorVisibility.current) {
      opener.current = document.activeElement as HTMLElement | null;
    }
    if (!visible && priorVisibility.current && opener.current?.isConnected) {
      opener.current.focus();
    }
    priorVisibility.current = visible;
  }, [visible]);

  const errorColor = theme.background === '#000000' ? '#ff9086' : '#a52d25';
  const headingColor = isCorrect ? theme.success : errorColor;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      accessibilityViewIsModal
      onShow={() => {
        if (Platform.OS === 'web') {
          const element = heading.current as unknown as HTMLElement | null;
          if (element) {
            element.tabIndex = -1;
            element.focus();
          }
        } else {
          const node = heading.current && findNodeHandle(heading.current);
          if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
        }
      }}
    >
      <View style={styles.backdrop}>
        <ThemedView style={styles.card}>
          <Text
            ref={heading}
            accessible
            accessibilityRole="header"
            style={[styles.heading, { color: headingColor }]}
          >
            {isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}
          </Text>
          <ScrollView style={styles.explanationScroll} contentContainerStyle={styles.explanation}>
            {!isCorrect && correctOptionText && (
              <ThemedText>{`Respuesta correcta: ${correctOptionText}`}</ThemedText>
            )}
            <ThemedText>{explanation}</ThemedText>
          </ScrollView>
          <Button
            title="Continuar"
            accessibilityLabel="Continuar"
            onPress={() => {
              const activeSession = session.current;
              if (
                !visible || !activeSession || activeSession.token !== token ||
                !activeSession.active || activeSession.used
              ) return;
              activeSession.used = true;
              continueCallback.current();
            }}
            style={styles.button}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.58)' },
  card: {
    maxHeight: '85%',
    borderRadius: 24,
    padding: 24,
    gap: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#888',
  },
  explanationScroll: { flexShrink: 1 },
  explanation: { paddingVertical: 4, gap: 8 },
  heading: { fontSize: 32, lineHeight: 44, fontWeight: '600' },
  button: { minHeight: 52 },
});
