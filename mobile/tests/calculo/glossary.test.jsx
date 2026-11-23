import { fireEvent, render, screen } from '@testing-library/react-native';
import CalculusGlossary from '@/modules/calculo/screens/CalculusGlossary';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));

test('adapts the official calculus glossary for the existing Core 2 screen', async () => {
  const request = jest.fn().mockResolvedValue([{ id: 17, titulo: 'Derivada', tematica: 'Límites',
    definicion: 'Definición del servidor', renderizacion: 'f\u2032(x)' }]);
  useAuth.mockReturnValue({ request });
  await render(<CalculusGlossary close={jest.fn()} />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Derivada, Cálculo' }));
  expect(screen.getByText('Definición: Definición del servidor')).toBeTruthy();
  expect(request).toHaveBeenCalledWith('/glosarios/calculo');
});
