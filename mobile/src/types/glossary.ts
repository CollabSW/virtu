// src/types/glossary.ts

export type SubjectType = 
  | 'calculo' 
  | 'historia' 
  | 'fisica' 
  | 'ingles' 
  | 'biologia' 
  | 'quimica';

// Interfaz base común para todas las materias
export interface BaseGlossaryItem {
  id: string;
  term: string;
  definition: string;
  subject: SubjectType;
}

// 1. Cálculo: temática, título, definición y renderización
export interface CalculoGlossaryItem extends BaseGlossaryItem {
  subject: 'calculo';
  theme: string;
  title: string;
  renderType: 'formula' | 'text' | 'graph';
}

// 2. Historia: dato, fecha, personaje/línea temporal
export interface HistoriaGlossaryItem extends BaseGlossaryItem {
  subject: 'historia';
  fact: string;
  date: string;
  character: string;
  timeline: string[];
}

// 3. Física: concepto y link de video
export interface FisicaGlossaryItem extends BaseGlossaryItem {
  subject: 'fisica';
  concept: string;
  videoUrl: string;
}

// 4. Inglés: vocabulario y audio/ejemplo
export interface InglesGlossaryItem extends BaseGlossaryItem {
  subject: 'ingles';
  vocabulary: string;
  audioUrl?: string; // Opcional por si algún término no tiene audio
  example: string;
}

// 5. Biología: flashcard
export interface BiologiaGlossaryItem extends BaseGlossaryItem {
  subject: 'biologia';
  flashcard: {
    front: string;
    back: string;
  };
}

// 6. Química: propiedades de elemento
export interface QuimicaGlossaryItem extends BaseGlossaryItem {
  subject: 'quimica';
  elementProperties: {
    symbol: string;
    atomicNumber: number;
    category: string;
  };
}

// El tipo general (Unión) que consumirá GlossaryService.js / GlossaryScreen.tsx
export type GlossaryItem = 
  | CalculoGlossaryItem 
  | HistoriaGlossaryItem 
  | FisicaGlossaryItem 
  | InglesGlossaryItem 
  | BiologiaGlossaryItem 
  | QuimicaGlossaryItem;