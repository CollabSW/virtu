import { useFonts } from 'expo-font';
import { useTheme } from '@/hooks/use-theme';

// Scoped to T01/T11 so the Figma palette does not restyle other contributors' screens.
export function useMatiasDesign() {
  const theme = useTheme();
  const [loaded] = useFonts({
    VirtuInter: require('../../../../assets/figma/matias/Inter-Regular.ttf'),
    VirtuInterSemiBold: require('../../../../assets/figma/matias/Inter-SemiBold.ttf'),
    VirtuInterBold: require('../../../../assets/figma/matias/Inter-Bold.ttf'),
  });
  const dark = theme.background === '#000000';
  return {
    background: dark ? '#101827' : '#f8f9ff',
    surface: dark ? '#1c293d' : '#ffffff',
    text: dark ? '#f1f5ff' : '#0b1c30',
    muted: dark ? '#c3cbdc' : '#434655',
    primary: dark ? '#99bbff' : '#245ce8',
    button: '#245ce8',
    onButton: '#ffffff',
    subtle: dark ? '#263b60' : '#e5eeff',
    border: dark ? '#465674' : '#c3c5d7',
    success: dark ? '#70f7ee' : '#006a65',
    successSurface: dark ? '#173b3b' : '#defbf8',
    regular: loaded ? 'VirtuInter' : undefined,
    semibold: loaded ? 'VirtuInterSemiBold' : undefined,
    bold: loaded ? 'VirtuInterBold' : undefined,
  };
}
