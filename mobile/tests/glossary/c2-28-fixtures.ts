import type { GlossaryEntry } from '@/shared/features/glossary/glossaryService';

export const c2GlossaryExamples = [
  { id: 'cal-001', subject: 'calculo', title: 'Límite', definition: 'Valor al que se aproxima una función.', topic: 'Límites y continuidad', rendering: 'Definición formal de límite (fórmula)' },
  { id: 'his-001', subject: 'historia', title: 'Independencia', definition: 'Proceso de liberación política de una nación.', fact: 'Se firmó el acta de independencia.', date: '1825-08-06', character: 'Simón Bolívar', timeline: '1809 → 1825 → 1826' },
  { id: 'fis-001', subject: 'fisica', title: 'Gravedad', definition: 'Fuerza de atracción mutua entre cuerpos.', concept: 'Ley de gravitación universal', videoUrl: 'https://example.test/gravedad' },
  { id: 'ing-001', subject: 'ingles', title: 'Innovation', definition: 'The action or process of innovating.', vocabulary: 'Noun', audioUrl: 'https://example.test/audio/innovation.mp3', example: 'The company is known for its innovation in technology.' },
  { id: 'ing-002', subject: 'ingles', title: 'Cloud', definition: 'A visible mass of condensed water vapor.', vocabulary: 'Noun', example: 'The sky is full of clouds today.' },
  { id: 'bio-001', subject: 'biologia', title: 'Mitocondria', definition: 'Organelo encargado de la respiración celular.', front: '¿Cuál es la función principal de la mitocondria?', back: 'Producir energía (ATP) para la célula.' },
  { id: 'qui-001', subject: 'quimica', title: 'Oxígeno', definition: 'Elemento químico gaseoso esencial para la vida.', symbol: 'O', atomicNumber: 8, properties: ['No metal'] },
] as const satisfies readonly GlossaryEntry[];
