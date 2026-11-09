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
// Importamos el nuevo componente
import { GlossaryItemDetail } from '@/shared/features/glossary/components/GlossaryItemDetail';

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

          {/* Indicador visual para el usuario (HU C2-24) */}
          <ThemedText type="linkPrimary" style={styles.toggleText}>
            {isExpanded ? 'Ocultar detalles' : 'Ver definición completa'}
          </ThemedText>
          
          {/* Renderizamos el componente modularizado */}
          {isExpanded && <GlossaryItemDetail item={item} />}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>🔍</ThemedText>
              <ThemedText type="subtitle" style={styles.emptyTitle}>Sin resultados</ThemedText>
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
  listContent: { gap: Spacing.three, paddingBottom: Spacing.six, flexGrow: 1 },
  card: { padding: Spacing.three, borderRadius: Spacing.two, gap: Spacing.two },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectBadge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: Spacing.one },
  toggleText: { marginTop: Spacing.one, fontSize: 13 },
  
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four, marginTop: Spacing.six,
  },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.three },
  emptyTitle: { fontSize: 24, marginBottom: Spacing.two, textAlign: 'center' },
  emptyText: { textAlign: 'center', marginBottom: Spacing.four, lineHeight: 22 },
  clearButton: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Spacing.two }
});