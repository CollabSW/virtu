
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import MathFormula from '@/shared/components/MathFormula';
import { SearchBar } from '@/shared/components/SearchBar';
import { filterGlossaryEntries } from '../glossaryService';
import type {
  GlossaryEntry,
  GlossarySubject,
} from '../glossaryService';

type Props = {
  entries: readonly GlossaryEntry[];
  subject?: GlossarySubject;
  title?: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
};

const SUBJECT_LABELS: Record<GlossarySubject, string> = {
  calculo: 'Cálculo',
  biologia: 'Biología',
  historia: 'Historia',
  fisica: 'Física',
  ingles: 'Inglés',
  quimica: 'Química',
};

function subjectLabel(subject: GlossarySubject): string {
  return SUBJECT_LABELS[subject] ?? subject;
}

export function GlossaryScreen({
  entries,
  subject,
  title = 'Glosario',
  query: externalQuery,
  onQueryChange,
  loading = false,
  error = '',
  onRetry,
}: Props) {
  const [localQuery, setLocalQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = externalQuery ?? localQuery;
  const setQuery = onQueryChange ?? setLocalQuery;

  const filtered = useMemo(
    () => filterGlossaryEntries(entries, query, subject),
    [entries, query, subject]
  );

  const selected = filtered.find(
    (entry) => entry.id === selectedId
  );

  const changeQuery = (value: string) => {
    setSelectedId(null);
    setQuery(value);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Header
          title={title}
          subtitle="Explora conceptos, definiciones y fórmulas"
        />

        <SearchBar
          value={query}
          onChangeText={changeQuery}
          onClear={() => changeQuery('')}
          accessibilityLabel="Buscar en el glosario"
          placeholder="Buscar por término o definición"
        />

        {loading ? (
          <View style={styles.message}>
            <ActivityIndicator
              size="large"
              color="#2458E8"
            />
            <ThemedText>
              Cargando términos...
            </ThemedText>
          </View>
        ) : error ? (
          <Card style={styles.message}>
            <ThemedText accessibilityRole="alert">
              No se pudo cargar el glosario: {error}
            </ThemedText>

            {onRetry && (
              <Pressable
                style={styles.primaryButton}
                accessibilityRole="button"
                onPress={onRetry}
              >
                <ThemedText style={styles.buttonText}>
                  Reintentar
                </ThemedText>
              </Pressable>
            )}
          </Card>
        ) : selected ? (
          <Card style={styles.detail}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver a la lista"
              onPress={() => setSelectedId(null)}
            >
              <ThemedText style={styles.link}>
                ← Volver al glosario
              </ThemedText>
            </Pressable>

            <ThemedText type="subtitle">
              {selected.title}
            </ThemedText>

            {selected.topic ? (
              <ThemedText style={styles.topic}>
                {selected.topic}
              </ThemedText>
            ) : null}

            {selected.topic ? (
              <ThemedText>
                Tema: {selected.topic}
              </ThemedText>
            ) : null}

            {selected.definition ? (
              <ThemedText selectable>
                Definición: {selected.definition}
              </ThemedText>
            ) : null}

            {selected.rendering ? (
              <View style={styles.section}>
                <MathFormula
                  expression={selected.rendering}
                />
              </View>
            ) : null}

            {selected.fact ? (
              <ThemedText>
                Dato: {selected.fact}
              </ThemedText>
            ) : null}

            {selected.date ? (
              <ThemedText>
                Fecha: {selected.date}
              </ThemedText>
            ) : null}

            {selected.character ? (
              <ThemedText>
                Personaje: {selected.character}
              </ThemedText>
            ) : null}

            {selected.timeline ? (
              <ThemedText>
                Línea de tiempo: {selected.timeline}
              </ThemedText>
            ) : null}

            {selected.concept ? (
              <ThemedText>
                Concepto: {selected.concept}
              </ThemedText>
            ) : null}

            {selected.videoUrl ? (
              <ThemedText>
                Video: {selected.videoUrl}
              </ThemedText>
            ) : null}

            {selected.vocabulary ? (
              <ThemedText>
                Vocabulario: {selected.vocabulary}
              </ThemedText>
            ) : null}

            {selected.audioUrl ? (
              <ThemedText>
                Audio: {selected.audioUrl}
              </ThemedText>
            ) : null}

            {selected.example ? (
              <ThemedText>
                Ejemplo: {selected.example}
              </ThemedText>
            ) : null}

            {selected.front ? (
              <ThemedText>
                Anverso: {selected.front}
              </ThemedText>
            ) : null}

            {selected.back ? (
              <ThemedText>
                Reverso: {selected.back}
              </ThemedText>
            ) : null}

            {selected.symbol ? (
              <ThemedText>
                Símbolo: {selected.symbol}
              </ThemedText>
            ) : null}

            {selected.atomicNumber !== undefined ? (
              <ThemedText>
                Número atómico: {selected.atomicNumber}
              </ThemedText>
            ) : null}

            {selected.properties ? (
              <ThemedText>
                Propiedades: {
                  Array.isArray(selected.properties)
                    ? selected.properties.join(', ')
                    : selected.properties
                }
              </ThemedText>
            ) : null}
          </Card>
        ) : filtered.length > 0 ? (
          <>
            <ThemedText
              themeColor="textSecondary"
              accessibilityLiveRegion="polite"
            >
              {filtered.length} término(s) encontrado(s)
            </ThemedText>

            {filtered.map((entry) => (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityLabel={
                  `${entry.title}, ${subjectLabel(entry.subject)}`
                }
                onPress={() => setSelectedId(entry.id)}
              >
                <Card style={styles.row}>
                  <ThemedText type="smallBold">
                    {entry.title}
                  </ThemedText>

                  {entry.topic ? (
                    <ThemedText
                      themeColor="textSecondary"
                    >
                      {entry.topic}
                    </ThemedText>
                  ) : null}

                  <ThemedText style={styles.link}>
                    Ver definición →
                  </ThemedText>
                </Card>
              </Pressable>
            ))}
          </>
        ) : (
          <Card style={styles.message}>
            <ThemedText
              accessibilityRole="summary"
              accessibilityLiveRegion="polite"
            >
              No hay resultados
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 50,
    gap: 14,
  },
  row: {
    padding: 18,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DFE5F2',
  },
  detail: {
    padding: 20,
    borderRadius: 16,
    gap: 18,
    borderWidth: 1,
    borderColor: '#DFE5F2',
  },
  section: {
    gap: 8,
  },
  topic: {
    fontSize: 14,
    color: '#2458E8',
    fontWeight: '600',
  },
  link: {
    fontSize: 14,
    color: '#2458E8',
    fontWeight: '700',
  },
  message: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    borderRadius: 12,
  },
  primaryButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#2458E8',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
