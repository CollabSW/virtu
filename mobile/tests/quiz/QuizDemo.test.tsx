import { render, screen } from '@testing-library/react-native';
import { describe, expect, it } from '@jest/globals';
import QuizDemo from './QuizDemo';

describe('QuizDemo', () => {
  it('clearly identifies the quiz and its fictional test-only content', async () => {
    await render(<QuizDemo />);
    expect(await screen.findByText('Cultura general · Pruebas')).toBeTruthy();
    expect(await screen.findByText(/SOLO PRUEBAS/)).toBeTruthy();
    expect(await screen.findByText(/datos ficticios.*no corresponde a un canal real/i)).toBeTruthy();
  });
});
