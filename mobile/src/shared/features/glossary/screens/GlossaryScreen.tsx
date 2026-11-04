import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { SearchBar } from '@/shared/components/SearchBar';
import { filterGlossaryEntries, getGlossaryEntries } from '../glossaryService';
import type { GlossaryEntry, GlossarySubject } from '../glossaryService';

type Props = { entries: readonly GlossaryEntry[]; subject?: GlossarySubject; title?: string };
const fieldLabels: Record<string, string> = {
  definition: 'Definición', topic: 'Tema', rendering: 'Representación', date: 'Fecha',
  character: 'Personaje', timeline: 'Línea de tiempo', concept: 'Concepto', videoUrl: 'Video',
  vocabulary: 'Vocabulario', audioUrl: 'Audio', example: 'Ejemplo', front: 'Anverso',
  back: 'Reverso', symbol: 'Símbolo', atomicNumber: 'Número atómico', properties: 'Propiedades',
};
const subjectLabels: Record<GlossarySubject, string> = {
  historia: 'Historia', biologia: 'Biología', quimica: 'Química', ingles: 'Inglés',
  calculo: 'Cálculo', fisica: 'Física',
};

export function GlossaryScreen({ entries, subject, title = 'Glosario' }: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scoped = useMemo(() => getGlossaryEntries(entries, subject), [entries, subject]);
  const filtered = useMemo(() => filterGlossaryEntries(scoped, query), [scoped, query]);
  const selected = filtered.find((entry) => entry.id === selectedId);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title={title} />
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          accessibilityLabel="Buscar en el glosario"
          placeholder="Buscar términos"
        />
        {selected ? (
          <Card style={styles.detail}>
            <Pressable accessibilityRole="button" accessibilityLabel="Volver a la lista" onPress={() => setSelectedId(null)}>
              <ThemedText>Volver a la lista</ThemedText>
            </Pressable>
            <ThemedText type="subtitle">{selected.title}</ThemedText>
            <ThemedText type="smallBold">{subjectLabels[selected.subject]}</ThemedText>
            {Object.entries(selected)
              .filter(([key, value]) => key in fieldLabels && value !== undefined)
              .map(([key, value]) => (
                <ThemedText key={key}>
                  {`${fieldLabels[key]}: ${Array.isArray(value) ? value.join(', ') : value}`}
                </ThemedText>
              ))}
          </Card>
        ) : filtered.length ? (
          filtered.map((entry) => (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityLabel={`${entry.title}, ${subjectLabels[entry.subject]}`}
              onPress={() => setSelectedId(entry.id)}
              style={styles.rowPressable}
            >
              <Card style={styles.row}>
                <ThemedText type="smallBold">{entry.title}</ThemedText>
                <ThemedText themeColor="textSecondary">{subjectLabels[entry.subject]}</ThemedText>
              </Card>
            </Pressable>
          ))
        ) : (
          <ThemedText accessibilityRole="summary" accessibilityLiveRegion="polite">
            No hay resultados
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 24, gap: 14 },
  rowPressable: { borderRadius: 14 },
  row: { padding: 16, gap: 4 },
  detail: { padding: 18, borderRadius: 18, gap: 12 },
});
