import { describe, expect, it } from '@jest/globals';
import { filterGlossaryEntries, getGlossaryEntries } from '../../src/shared/features/glossary/glossaryService';
import { glossaryExamples } from './fixtures';

describe('glossaryService', () => {
  it('provides one heterogeneous example for each supported subject', () => {
    expect(glossaryExamples).toHaveLength(6);
    expect(getGlossaryEntries(glossaryExamples).map(({ subject }) => subject).sort()).toEqual(
      ['biologia', 'calculo', 'fisica', 'historia', 'ingles', 'quimica'],
    );
  });

  it.each([
    ['title', 'cuadrática', 'calculo-1'],
    ['definition', 'segundo grado', 'calculo-1'],
    ['topic', 'funciones', 'calculo-1'],
    ['rendering', 'ax²', 'calculo-1'],
    ['date', '1783', 'historia-1'],
    ['character', 'independentista', 'historia-1'],
    ['timeline', 'hispanoamericanas', 'historia-1'],
    ['concept', 'movimiento', 'fisica-1'],
    ['videoUrl', 'example.test/inercia', 'fisica-1'],
    ['vocabulary', 'resilient', 'ingles-1'],
    ['audioUrl', 'example.test/resilient', 'ingles-1'],
    ['example', 'she is', 'ingles-1'],
    ['front', 'unidad básica', 'biologia-1'],
    ['back', 'la célula', 'biologia-1'],
    ['properties[]', 'moléculas orgánicas', 'quimica-1'],
  ])('searches textual field %s', (_field, query, expectedId) => {
    expect(filterGlossaryEntries(glossaryExamples, query).map(({ id }) => id)).toEqual([expectedId]);
  });

  it('searches the textual symbol field', () => {
    const entry = { id: 'symbol', subject: 'quimica', title: 'Elemento', symbol: '§' } as const;
    expect(filterGlossaryEntries([entry], '§').map(({ id }) => id)).toEqual(['symbol']);
  });

  it('finds vocabulary when neither the title nor other fields contain the query', () => {
    const entry = { id: 'word', subject: 'ingles', title: 'Etiqueta', vocabulary: 'distinct-vocabulary' } as const;
    expect(filterGlossaryEntries([entry], 'DISTINCT-VOCABULARY')).toEqual([entry]);
  });

  it('filters by subject before matching, case-insensitively', () => {
    expect(filterGlossaryEntries(glossaryExamples, 'NO METAL', 'quimica').map(({ id }) => id)).toEqual(['quimica-1']);
    expect(filterGlossaryEntries(glossaryExamples, 'NO METAL', 'historia')).toEqual([]);
    expect(getGlossaryEntries(glossaryExamples, 'historia').map(({ id }) => id)).toEqual(['historia-1']);
  });

  it('returns selected entries for empty queries and no entries for unmatched text', () => {
    expect(filterGlossaryEntries(glossaryExamples, '  ', 'quimica')).toEqual([glossaryExamples[5]]);
    expect(filterGlossaryEntries(glossaryExamples, 'inexistente')).toEqual([]);
  });

  it('handles empty entries and does not search numeric-only fields', () => {
    expect(getGlossaryEntries([])).toEqual([]);
    expect(filterGlossaryEntries([], '')).toEqual([]);
    expect(filterGlossaryEntries([], 'algo')).toEqual([]);
    const entries = [
      { id: 'empty', subject: 'quimica', title: '' },
      { id: 'number', subject: 'quimica', title: 'Carbono', atomicNumber: 6 },
    ] as const;
    expect(filterGlossaryEntries(entries, '')).toEqual(entries);
    expect(filterGlossaryEntries(entries, '6')).toEqual([]);
    expect(filterGlossaryEntries([{ ...entries[0], properties: [] }], 'anything')).toEqual([]);
  });

  it('rejects invalid entries and subject inputs', () => {
    expect(() => getGlossaryEntries(null as never)).toThrow(TypeError);
    expect(() => getGlossaryEntries(glossaryExamples, 'astronomia' as never)).toThrow(TypeError);
    expect(() => filterGlossaryEntries(null as never, 'algo')).toThrow(TypeError);
    expect(() => filterGlossaryEntries(glossaryExamples, 'algo', 'astronomia' as never)).toThrow(TypeError);
  });

  it('treats a non-string query as empty per the existing service contract', () => {
    expect(filterGlossaryEntries(glossaryExamples, null as never)).toBe(glossaryExamples);
  });
});
