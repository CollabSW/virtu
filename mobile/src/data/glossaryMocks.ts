// src/data/glossaryMocks.ts
import { GlossaryItem } from '@/types/glossary';

export const glossaryMocks: GlossaryItem[] = [
  {
    id: 'cal-001',
    subject: 'calculo',
    term: 'Límite',
    definition: 'Valor al que se aproxima una función.',
    theme: 'Límites y continuidad',
    title: 'Definición formal de límite',
    renderType: 'formula',
  },
  {
    id: 'his-001',
    subject: 'historia',
    term: 'Independencia',
    definition: 'Proceso de liberación política de una nación.',
    fact: 'Se firmó el acta de independencia.',
    date: '1825-08-06',
    character: 'Simón Bolívar',
    timeline: ['1809', '1825', '1826'],
  },
  {
    id: 'fis-001',
    subject: 'fisica',
    term: 'Gravedad',
    definition: 'Fuerza de atracción mutua entre cuerpos.',
    concept: 'Ley de gravitación universal',
    videoUrl: 'https://www.youtube.com/watch?v=ejemplo123',
  },
  {
    id: 'ing-001',
    subject: 'ingles',
    term: 'Innovation',
    definition: 'The action or process of innovating.',
    vocabulary: 'Noun',
    audioUrl: 'https://example.com/audio/innovation.mp3',
    example: 'The company is known for its innovation in technology.',
  },
  {
    id: 'bio-001',
    subject: 'biologia',
    term: 'Mitocondria',
    definition: 'Organelo encargado de la respiración celular.',
    flashcard: {
      front: '¿Cuál es la función principal de la mitocondria?',
      back: 'Producir energía (ATP) para la célula.',
    },
  },
  {
    id: 'qui-001',
    subject: 'quimica',
    term: 'Oxígeno',
    definition: 'Elemento químico gaseoso esencial para la vida.',
    elementProperties: {
      symbol: 'O',
      atomicNumber: 8,
      category: 'No metal',
    },
  },
];