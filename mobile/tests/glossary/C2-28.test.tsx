import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { GlossaryScreen } from '@/shared/features/glossary/screens/GlossaryScreen';
import { c2GlossaryExamples } from './c2-28-fixtures';

describe('Glosario C2-28', () => {
  it.each([
    ['LÍMITE', 'Límite', 'Representación: Definición formal de límite (fórmula)'],
    ['límite', 'Límite', 'Tema: Límites y continuidad'],
    ['Simón', 'Independencia', 'Dato: Se firmó el acta de independencia.'],
    ['gravitación', 'Gravedad', 'Concepto: Ley de gravitación universal'],
    ['ATP', 'Mitocondria', 'Reverso: Producir energía (ATP) para la célula.'],
    ['No metal', 'Oxígeno', 'Propiedades: No metal'],
  ])('busca %s y muestra los detalles de %s', async (query, title, detail) => {
    await render(<GlossaryScreen entries={c2GlossaryExamples} />);
    await fireEvent.changeText(screen.getByLabelText('Buscar en el glosario'), query);
    const entries = screen.getAllByRole('button').filter((button) => button.props.accessibilityLabel !== 'Limpiar búsqueda');
    expect(entries).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(title) }));
    expect(screen.getByText(detail)).toBeTruthy();
  });

  it('encuentra Cloud sin audio y restaura la lista después de una búsqueda vacía de resultados', async () => {
    await render(<GlossaryScreen entries={c2GlossaryExamples} />);
    const search = screen.getByLabelText('Buscar en el glosario');
    await fireEvent.changeText(search, 'xyz');
    expect(screen.getByText('No hay resultados')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(screen.getByText('Innovation')).toBeTruthy();
    await fireEvent.changeText(search, 'cloud');
    await fireEvent.press(screen.getByRole('button', { name: /Cloud/ }));
    expect(screen.getByText('Ejemplo: The sky is full of clouds today.')).toBeTruthy();
    expect(screen.queryByText(/^Audio:/)).toBeNull();
  });
});
