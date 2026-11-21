import { fireEvent, render, screen } from '@testing-library/react-native';
import TeacherDashboard from '@/shared/features/teacher-dashboard/TeacherDashboard';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));

test('keeps teacher reports read-only and scopes lesson selection to calculus', async () => {
  const request = jest.fn()
    .mockResolvedValueOnce([{ id: 5, nombre: 'Curso de prueba' }])
    .mockResolvedValueOnce({ estudiantes: [{ estudianteId: 8, nombreCompleto: 'Alumno de prueba' }] })
    .mockResolvedValueOnce({ slug: 'calculo', unidades: [{ lecciones: [{ id: 22, titulo: 'Derivadas' }] }] })
    .mockResolvedValueOnce({ estudiante: { id: 8 }, leccion: { id: 22 }, estadoLeccion: 'ESTUDIADO',
      notaVigente: 6.1, aciertosTotales: 4, desaciertosTotales: 1 })
    .mockResolvedValueOnce({ slug: 'calculo', unidades: [{ lecciones: [{ id: 22, titulo: 'Derivadas' }] }] });
  useAuth.mockReturnValue({ request });
  await render(<TeacherDashboard name="Docente" />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Curso de prueba' }));
  expect(await screen.findByText(/avance agregado de la API/)).toBeTruthy();
  await fireEvent.press(await screen.findByRole('button', { name: 'Alumno de prueba' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Derivadas' }));
  expect(await screen.findByText('Nota vigente: 6.1')).toBeTruthy();
  expect(screen.getByText('Aciertos: 4 · Desaciertos: 1')).toBeTruthy();
  expect(request.mock.calls).toEqual([
    ['/docente/cursos'], ['/docente/cursos/5/estudiantes'], ['/contenidos/calculo'],
    ['/docente/estudiantes/8/lecciones/22'],
  ]);
  await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
  expect(await screen.findByText('Alumno de prueba · Lecciones de Cálculo')).toBeTruthy();
});
