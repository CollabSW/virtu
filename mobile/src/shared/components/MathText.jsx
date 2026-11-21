import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import MathFormula from './MathFormula';
import { splitMathText } from './mathFormatting';

/** @param {{text?: string, standalone?: boolean, textStyle?: import('react-native').StyleProp<import('react-native').TextStyle>, type?: import('@/components/themed-text').ThemedTextProps['type']}} props */
export default function MathText({ text = '', standalone = false, textStyle, type = 'default' }) {
  const parts = splitMathText(text, standalone);
  if (!parts.some(part => part.math)) return <ThemedText type={type} style={textStyle}>{text}</ThemedText>;
  return <View style={{ gap: 6 }}>
    {parts.map((part, index) => part.math
      ? <MathFormula key={index} expression={part.value} />
      : part.value.trim() ? <ThemedText key={index} type={type} style={textStyle}>{part.value.trim()}</ThemedText> : null)}
  </View>;
}
