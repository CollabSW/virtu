// src/shared/features/glossary/screens/GlossaryScreen.tsx
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { GlossaryItem } from '@/types/glossary';
import { glossaryMocks } from '@/data/glossaryMocks'; 
import { SearchBar } from '@/shared/components/SearchBar'; 

export default function GlossaryScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); 
  const theme = useTheme(); 

  const getSearchableText = (item: GlossaryItem): string => {
    let text = `${item.term} ${item.definition}`;
    switch (item.subject) {
      case 'calculo': text += ` ${item.theme} ${item.title} ${item.renderType}`; break;
      case 'historia': text += ` ${item.fact} ${item.date} ${item.character} ${item.timeline.join(' ')}`; break;
      case 'fisica': text += ` ${item.concept} ${item.videoUrl || ''}`; break;
      case 'ingles': text += ` ${item.vocabulary} ${item.example} ${item.audioUrl || ''}`; break;
      case 'biologia': text += ` ${item.flashcard.front} ${item.flashcard.back}`; break;
      case 'quimica': text += ` ${item.elementProperties.symbol} ${item.elementProperties.category} ${item.elementProperties.atomicNumber}`; break;
    }
    return text.toLowerCase();
  };

  const filteredData = glossaryMocks.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true; 
    return getSearchableText(item).includes(query);
  });

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
        
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por cualquier campo..."
        />

        <FlatList
          data={filteredData} 
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // AQUÍ EMPIEZA LA MEJORA DE LA HU C2-19
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>🔍</ThemedText>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                Sin resultados
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                No encontramos ningún término que coincida con "{searchQuery}". Intenta con otra palabra.
              </ThemedText>
              
              <Pressable 
                onPress={() => setSearchQuery('')}
                style={[styles.clearButton, { backgroundColor: theme.backgroundSelected }]}
              >
                <ThemedText type="smallBold">Limpiar búsqueda</ThemedText>
              </Pressable>
            </View>
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
  listContent: { gap: Spacing.three, paddingBottom: Spacing.six, flexGrow: 1 }, // flexGrow ayuda a centrar el EmptyComponent
  card: { padding: Spacing.three, borderRadius: Spacing.two, gap: Spacing.two },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectBadge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: Spacing.one },
  detailsContainer: { marginTop: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, gap: Spacing.one },
  
  // Estilos para el Estado Vacío (HU C2-19)
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.six,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: 24,
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 22,
  },
  clearButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  }
});