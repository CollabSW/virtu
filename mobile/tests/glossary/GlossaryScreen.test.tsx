import { fireEvent, render, screen } from '@testing-library/react-native';
import { GlossaryScreen } from '@/shared/features/glossary/screens/GlossaryScreen';
import { glossaryExamples } from './fixtures';
import { describe, expect, it } from '@jest/globals';

describe('GlossaryScreen', () => {
  it('lists six subjects and shows each entry’s available detail fields', async () => {
    await render(<GlossaryScreen entries={glossaryExamples} />);
    for (const title of ['Función cuadrática', 'Simón Bolívar', 'Inercia', 'Resilient', 'Célula', 'Carbono']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    for (const [title, fields] of [
      ['Función cuadrática', ['Tema: Funciones', 'Definición: Polinomio de segundo grado.', 'Representación: f(x) = ax² + bx + c']],
      ['Simón Bolívar', ['Fecha: 1783–1830', 'Personaje: Líder independentista', 'Línea de tiempo: Independencias hispanoamericanas']],
      ['Inercia', ['Concepto: Un cuerpo conserva su estado de movimiento si no actúa una fuerza neta.', 'Video: https://example.test/inercia']],
      ['Resilient', ['Vocabulario: resilient', 'Audio: https://example.test/resilient', 'Ejemplo: She is resilient.']],
      ['Célula', ['Anverso: ¿Cuál es la unidad básica de la vida?', 'Reverso: La célula.']],
      ['Carbono', ['Símbolo: C', 'Número atómico: 6', 'Propiedades: No metal, Presente en moléculas orgánicas']],
    ] as const) {
      await fireEvent.press(screen.getByRole('button', { name: new RegExp(title) }));
      for (const field of fields) expect(screen.getByText(field)).toBeTruthy();
      await fireEvent.press(screen.getByRole('button', { name: 'Volver a la lista' }));
      expect(screen.getByText('Función cuadrática')).toBeTruthy();
    }
  });

  it('searches optional fields case-insensitively, clears, and reports empty/no matches', async () => {
    const view = await render(<GlossaryScreen entries={glossaryExamples} />);
    const search = screen.getByLabelText('Buscar en el glosario');
    await fireEvent.changeText(search, 'INDEPENDENCIAS');
    expect(screen.getByText('Simón Bolívar')).toBeTruthy();
    expect(screen.queryByText('Carbono')).toBeNull();
    await fireEvent.changeText(search, 'no existe');
    expect(screen.getByText('No hay resultados')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(screen.getByText('Carbono')).toBeTruthy();
    await view.rerender(<GlossaryScreen entries={[]} />);
    expect(screen.getByText('No hay resultados')).toBeTruthy();
  });

  it('does not mix entries when changing the subject filter', async () => {
    const first = await render(<GlossaryScreen entries={glossaryExamples} subject="historia" />);
    expect(screen.getByText('Simón Bolívar')).toBeTruthy();
    await first.rerender(<GlossaryScreen entries={glossaryExamples} subject="quimica" />);
    expect(screen.getByText('Carbono')).toBeTruthy();
    expect(screen.queryByText('Simón Bolívar')).toBeNull();
  });
});
