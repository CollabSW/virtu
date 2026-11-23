import { render, screen } from '@testing-library/react-native';
import MathFormula from '@/shared/components/MathFormula';
import { WebView } from 'react-native-webview';

test('renders API-escaped LaTeX using local KaTeX with trust disabled', async () => {
  await render(<MathFormula expression={String.raw`f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}`} />);
  expect(screen.getByLabelText(String.raw`Fórmula: f'(x) = \lim_{h \to 0} \frac{f(x+h)-f(x)}{h}`)).toBeTruthy();
  const props = WebView.mock.calls.at(-1)[0];
  expect(props.source.html).toContain('"trust":false');
  expect(props.source.html).toContain('"output":"htmlAndMathml"');
  expect(props.onShouldStartLoadWithRequest({ url: 'https://example.test' })).toBe(false);
});

test('prevents the formula from closing its containing script element', async () => {
  await render(<MathFormula expression={'x</script><script>alert(1)</script>'} />);
  expect(WebView.mock.calls.at(-1)[0].source.html).not.toContain('x</script>');
});
