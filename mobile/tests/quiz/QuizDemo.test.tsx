import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, it } from '@jest/globals';
import type { PressableStateCallbackType } from 'react-native';
import { Button } from '@/shared/components/Button';
import QuizDemo from './QuizDemo';

describe('QuizDemo', () => {
  it('passes the Pressable state available in the test renderer to a style callback', async () => {
    const style = jest.fn((_state: PressableStateCallbackType) => ({}));
    await render(<Button title="Test" style={style} />);

    expect(style).toHaveBeenCalledWith({ pressed: false });
  });

  it('clearly identifies the quiz and its fictional test-only content', async () => {
    await render(<QuizDemo />);
    expect(await screen.findByText('Cultura general · Pruebas')).toBeTruthy();
    expect(await screen.findByText(/SOLO PRUEBAS/)).toBeTruthy();
    expect(await screen.findByText(/datos ficticios.*no corresponde a un canal real/i)).toBeTruthy();
    expect(await screen.findByText('Glosario de pruebas')).toBeTruthy();
    const search = screen.getByLabelText('Buscar en el glosario');
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' }).props.accessibilityState.disabled).toBe(true);
    await fireEvent.changeText(search, 'funciones');
    expect(screen.getByLabelText('Buscar en el glosario').props.value).toBe('funciones');
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' }).props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(await screen.findByRole('button', { name: /función cuadrática/i }));
    expect(await screen.findByText('Tema: Funciones')).toBeTruthy();
    expect(await screen.findByText('Definición: Polinomio de segundo grado.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver a la lista' }));
    await fireEvent.changeText(search, 'célula');
    await fireEvent.press(await screen.findByRole('button', { name: /biología/i }));
    expect(await screen.findByText('Anverso: ¿Cuál es la unidad básica de la vida?')).toBeTruthy();
    expect(await screen.findByText('Reverso: La célula.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver a la lista' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(screen.getByLabelText('Buscar en el glosario').props.value).toBe('');
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' }).props.accessibilityState.disabled).toBe(true);
    expect(await screen.findByText('Simón Bolívar')).toBeTruthy();
    await fireEvent.changeText(search, 'dato-inexistente');
    expect(await screen.findByText('No hay resultados')).toBeTruthy();
  });

  it('shows optional details only when supplied and includes heterogeneous field labels', async () => {
    await render(<QuizDemo />);
    const search = screen.getByLabelText('Buscar en el glosario');
    await fireEvent.changeText(search, '1783');
    await fireEvent.press(await screen.findByRole('button', { name: /historia/i }));
    expect(await screen.findByText('Fecha: 1783–1830')).toBeTruthy();
    expect(await screen.findByText('Personaje: Líder independentista')).toBeTruthy();
    expect(screen.queryByText(/Audio:/)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver a la lista' }));
    await fireEvent.changeText(search, 'intertia-no');
    expect(await screen.findByText('No hay resultados')).toBeTruthy();
  });
});
