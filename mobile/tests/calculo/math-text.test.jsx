import { render, screen } from '@testing-library/react-native';
import { WebView } from 'react-native-webview';
import MathText from '@/shared/components/MathText';
import { formulaToLatex, splitMathText } from '@/shared/components/mathFormatting';
import { QuestionCard } from '@/shared/features/quiz/components/QuestionCard';
import { fireEvent } from '@testing-library/react-native';

test.each([
  ['e^(5x)', 'e^{5x}'],
  ['2x / (x^2 + 1)', String.raw`\frac{2x}{x^2 + 1}`],
  ['4cos(4x)', String.raw`4\cos(4x)`],
  ['x² * 3', String.raw`x^2 \cdot  3`],
  ['a + b/c', 'a + b/c'],
  [String.raw`$$\\frac{x}{2}$$`, String.raw`\frac{x}{2}`],
])('formats %s without evaluating it', (input, expected) => {
  expect(formulaToLatex(input)).toBe(expected);
});

test('separates prose, legacy equations and delimited LaTeX', () => {
  const parts = splitMathText("Para f(x) = (3x + 2)^2, usa $x^2$.");
  expect(parts.filter(part => part.math).map(part => part.value))
    .toEqual(['f(x) = (3x + 2)^2', '$x^2$']);
  expect(splitMathText('Una respuesta escrita', true)).toEqual([{ math: false, value: 'Una respuesta escrita' }]);
});

test('sends lesson and option formulas to the native renderer', async () => {
  await render(<MathText text="Deriva y = e^(5x)" />);
  expect(screen.getByText('Deriva')).toBeTruthy();
  expect(WebView.mock.calls.at(-1)[0].source.html).toContain('e^{5x}');
});

test('math answer remains selectable by its radio label', async () => {
  const onSelect = jest.fn();
  await render(<QuestionCard renderMath question={{ id: '1', text: 'Deriva y = e^(5x)',
    options: [{ id: '2', text: '5e^(5x)' }] }} selectedOptionId={null} disabled={false}
    onSelect={onSelect} onConfirm={jest.fn()} />);
  fireEvent.press(screen.getByRole('radio', { name: '5e^(5x)' }));
  expect(onSelect).toHaveBeenCalledWith('2');
  expect(screen.getByLabelText('Fórmula: 5e^(5x)')).toBeTruthy();
});
