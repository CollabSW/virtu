import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from '@/navigation/AuthNavigator';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({ useFocusEffect: callback => require('react').useEffect(callback, [callback]) }));

function page() {
  return <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 360, height: 800 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 } }}><AuthNavigator /></SafeAreaProvider>;
}

test.each(['ESTUDIANTE', 'DOCENTE'])('opens the correct home for %s without fetching the subject catalog', async rol => {
  const request = jest.fn().mockResolvedValue(rol === 'ESTUDIANTE' ? { slug: 'calculo', unidades: [] } : []);
  useAuth.mockReturnValue({ user: { rol, nombreCompleto: 'Prueba' }, request });
  await render(page());
  expect(await screen.findByText(rol === 'ESTUDIANTE' ? 'Inicio de Cálculo' : 'Panel docente')).toBeTruthy();
  expect(request).toHaveBeenCalledWith(rol === 'ESTUDIANTE' ? '/contenidos/calculo' : '/docente/cursos');
  expect(request).not.toHaveBeenCalledWith('/contenidos');
  expect(screen.queryByText('Elige una materia')).toBeNull();
  expect(screen.queryByText('Volver a materias')).toBeNull();
});
