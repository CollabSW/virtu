import type { GlossaryEntry } from '../../src/shared/features/glossary/glossaryService';

export const glossaryExamples: readonly GlossaryEntry[] = [
  { id: 'calculo-1', subject: 'calculo', title: 'Función cuadrática', topic: 'Funciones', definition: 'Polinomio de segundo grado.', rendering: 'f(x) = ax² + bx + c' },
  { id: 'historia-1', subject: 'historia', title: 'Simón Bolívar', date: '1783–1830', character: 'Líder independentista', timeline: 'Independencias hispanoamericanas' },
  { id: 'fisica-1', subject: 'fisica', title: 'Inercia', concept: 'Un cuerpo conserva su estado de movimiento si no actúa una fuerza neta.', videoUrl: 'https://example.test/inercia' },
  { id: 'ingles-1', subject: 'ingles', title: 'Resilient', vocabulary: 'resilient', audioUrl: 'https://example.test/resilient', example: 'She is resilient.' },
  { id: 'biologia-1', subject: 'biologia', title: 'Célula', front: '¿Cuál es la unidad básica de la vida?', back: 'La célula.' },
  { id: 'quimica-1', subject: 'quimica', title: 'Carbono', symbol: 'C', atomicNumber: 6, properties: ['No metal', 'Presente en moléculas orgánicas'] },
];
