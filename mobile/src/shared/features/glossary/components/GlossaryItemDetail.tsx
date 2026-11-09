// src/shared/features/glossary/components/GlossaryItemDetail.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { GlossaryItem } from '@/types/glossary';

interface Props {
  item: GlossaryItem;
}

export function GlossaryItemDetail({ item }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderTopColor: theme.backgroundSelected }]}>
      {/* Cálculo */}
      {item.subject === 'calculo' && (
        <>
          <ThemedText type="smallBold">Temática: <ThemedText type="small">{item.theme}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Título: <ThemedText type="small">{item.title}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Renderización: <ThemedText type="code">{item.renderType}</ThemedText></ThemedText>
        </>
      )}

      {/* Historia */}
      {item.subject === 'historia' && (
        <>
          <ThemedText type="smallBold">Personaje: <ThemedText type="small">{item.character}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Fecha: <ThemedText type="small">{item.date}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Dato: <ThemedText type="small">{item.fact}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Línea temporal: <ThemedText type="small">{item.timeline.join(' → ')}</ThemedText></ThemedText>
        </>
      )}

      {/* Física */}
      {item.subject === 'fisica' && (
        <>
          <ThemedText type="smallBold">Concepto: <ThemedText type="small">{item.concept}</ThemedText></ThemedText>
          <ThemedText type="linkPrimary">Ver Video: {item.videoUrl}</ThemedText>
        </>
      )}

      {/* Inglés */}
      {item.subject === 'ingles' && (
        <>
          <ThemedText type="smallBold">Vocabulario: <ThemedText type="small">{item.vocabulary}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Ejemplo: <ThemedText type="small">"{item.example}"</ThemedText></ThemedText>
          {item.audioUrl && <ThemedText type="small">🔊 Audio disponible</ThemedText>}
        </>
      )}

      {/* Biología */}
      {item.subject === 'biologia' && (
        <>
          <ThemedText type="smallBold">Flashcard (Frente):</ThemedText>
          <ThemedText type="small">{item.flashcard.front}</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>Respuesta (Reverso):</ThemedText>
          <ThemedText type="small">{item.flashcard.back}</ThemedText>
        </>
      )}

      {/* Química */}
      {item.subject === 'quimica' && (
        <>
          <ThemedText type="smallBold">Símbolo: <ThemedText type="small">{item.elementProperties.symbol}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Número Atómico: <ThemedText type="small">{item.elementProperties.atomicNumber}</ThemedText></ThemedText>
          <ThemedText type="smallBold">Categoría: <ThemedText type="small">{item.elementProperties.category}</ThemedText></ThemedText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
});