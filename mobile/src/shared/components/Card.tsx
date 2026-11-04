import { StyleSheet } from 'react-native';
import type { ViewProps } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export function Card({ style, ...props }: ViewProps) {
  return <ThemedView {...props} type="backgroundElement" style={[styles.card, style]} />;
}

const styles = StyleSheet.create({ card: { padding: 20, borderRadius: 20, gap: 12 } });
