import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { GlossaryItem } from '@/types/glossary';
import { glossaryMocks } from '@/data/glossaryMocks'; 

export default function GlossaryScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const theme = useTheme(); 

  const renderItemDetails = (item: GlossaryItem) => {
    return (
      <View style={[styles.detailsContainer, { borderTopColor: theme.backgroundSelected }]}>
        {item.subject === 'calculo' && (
          <>
            <ThemedText type="small">Temática: {item.theme}</ThemedText>
            <ThemedText type="small">Título: {item.title}</ThemedText>
            <ThemedText type="code">Render: {item.renderType}</ThemedText>
          </>
        )}
        {item.subject === 'historia' && (
          <>
            <ThemedText type="small">Personaje: {item.character}</ThemedText>
            <ThemedText type="small">Fecha: {item.date}</ThemedText>
            <ThemedText type="small">Línea temporal: {item.timeline.join(' → ')}</ThemedText>
          </>
        )}
        {item.subject === 'fisica' && (
          <>
            <ThemedText type="small">Concepto: {item.concept}</ThemedText>
            <ThemedText type="linkPrimary">Ver Video: {item.videoUrl}</ThemedText>
          </>
        )}
        {item.subject === 'ingles' && (
          <>
            <ThemedText type="smallBold">Vocabulario: {item.vocabulary}</ThemedText>
            <ThemedText type="small">Ejemplo: "{item.example}"</ThemedText>
            {item.audioUrl && <ThemedText type="small">🔊 Audio disponible</ThemedText>}
          </>
        )}
        {item.subject === 'biologia' && (
          <>
            <ThemedText type="smallBold">Flashcard (Frente): {item.flashcard.front}</ThemedText>
            <ThemedText type="small">Respuesta: {item.flashcard.back}</ThemedText>
          </>
        )}
        {item.subject === 'quimica' && (
          <>
            <ThemedText type="small">Símbolo: {item.elementProperties.symbol}</ThemedText>
            <ThemedText type="small">Número Atómico: {item.elementProperties.atomicNumber}</ThemedText>
            <ThemedText type="small">Categoría: {item.elementProperties.category}</ThemedText>
          </>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: GlossaryItem }) => {
    const isExpanded = expandedId === item.id;

    return (
      <Pressable onPress={() => setExpandedId(isExpanded ? null : item.id)}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText type="default" style={{ fontWeight: 'bold' }}>{item.term}</ThemedText>
            <View style={[styles.subjectBadge, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="code" themeColor="textSecondary">
                {item.subject.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {item.definition}
          </ThemedText>
          
          {isExpanded && renderItemDetails(item)}
        </ThemedView>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>Glosario</ThemedText>
        
        <FlatList
          data={glossaryMocks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: Spacing.four }}>
              No hay términos disponibles.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four },
  title: { marginVertical: Spacing.four, textAlign: 'center', fontSize: 32 },
  listContent: { gap: Spacing.three, paddingBottom: Spacing.six },
  card: { padding: Spacing.three, borderRadius: Spacing.two, gap: Spacing.two },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectBadge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: Spacing.one },
  detailsContainer: { marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, gap: Spacing.one },
});