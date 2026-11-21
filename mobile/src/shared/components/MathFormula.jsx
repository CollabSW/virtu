import { useState } from 'react';
import { Platform, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formulaToLatex, normalizeFormula } from './mathFormatting';

export default function MathFormula({ expression }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const formula = formulaToLatex(expression).replace(/</g, '\\lt ');
  if (failed || Platform.OS === 'web') {
    return <ThemedText selectable>Representación: {expression}</ThemedText>;
  }
  const Katex = require('react-native-katex').default;
  return <View style={{ height: 100, width: '100%' }} accessibilityLabel={`Fórmula: ${normalizeFormula(expression)}`}>
    <Katex testID="formula-renderer" expression={formula} displayMode={false} trust={false} throwOnError={false}
      output="htmlAndMathml" maxSize={5} maxExpand={1000}
      style={{ flex: 1, backgroundColor: theme.background }} scrollEnabled={false} scalesPageToFit={false}
      onError={() => setFailed(true)}
      onShouldStartLoadWithRequest={({ url }) => !url || url === 'about:blank' || url.startsWith('data:text/html')}
      inlineStyle={`html,body{margin:0;padding:8px;box-sizing:border-box;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${theme.background};color:${theme.text};font-size:18px}.katex{font-size:1.1em;max-width:100%;white-space:normal}`} />
  </View>;
}
