import { useLayoutEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import type { FeedbackModalProps } from './types';

export function FeedbackModal({ visible, isCorrect, explanation, onContinue }: FeedbackModalProps) {
  const theme = useTheme();
  const heading = useRef<Text>(null);
  const priorVisibility = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const sessionToken = useMemo(() => ({ visible }), [visible]);
  const sessionRef = useRef<{ token: typeof sessionToken; active: boolean; used: boolean } | null>(null);
  const continueCallback = useRef(onContinue);
  useLayoutEffect(() => { continueCallback.current = onContinue; }, [onContinue]);
  useLayoutEffect(() => {
    if (!visible) return;
    const session = { token: sessionToken, active: true, used: false };
    sessionRef.current = session;
    return () => { session.active = false; };
  }, [sessionToken, visible]);
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    if (visible && !priorVisibility.current) opener.current = document.activeElement as HTMLElement | null;
    if (!visible && priorVisibility.current && opener.current?.isConnected) opener.current.focus();
    priorVisibility.current = visible;
  }, [visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}} accessibilityViewIsModal onShow={() => {
      if (Platform.OS === 'web') {
        const element = heading.current as unknown as HTMLElement | null;
        if (element) { element.tabIndex = -1; element.focus(); }
      } else {
        const node = heading.current && findNodeHandle(heading.current);
        if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
      }
    }}>
      <View style={styles.backdrop}>
        <ThemedView style={styles.card}>
          <Text ref={heading} accessible accessibilityRole="header" style={[styles.heading, { color: isCorrect ? (theme.background === '#000000' ? '#78d8a5' : '#176b48') : (theme.background === '#000000' ? '#ff9086' : '#a52d25') }]}>
            {isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta'}
          </Text>
          <ScrollView style={styles.explanationScroll} contentContainerStyle={styles.explanation}>
            <ThemedText>{explanation}</ThemedText>
          </ScrollView>
          <Pressable accessibilityRole="button" accessibilityLabel="Continuar" onPress={() => {
            const session = sessionRef.current;
            if (!visible || !session || session.token !== sessionToken || !session.active || session.used) return;
            session.used = true;
            continueCallback.current();
          }} style={({ pressed }) => [styles.button, { backgroundColor: theme.text }, pressed && styles.pressed]}>
            <ThemedText style={{ color: theme.background, fontWeight: '700' }}>Continuar</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.58)' },
  card: { maxHeight: '85%', borderRadius: 24, padding: 24, gap: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: '#888' },
  explanationScroll: { flexShrink: 1 },
  explanation: { paddingVertical: 4 },
  heading: { fontSize: 32, lineHeight: 44, fontWeight: '600' },
  button: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  pressed: { opacity: 0.75 },
});
