import { router } from 'expo-router';
import CalculusGlossary from '@/modules/calculo/screens/CalculusGlossary';

export default function GlosarioRoute() {
  return <CalculusGlossary close={() => router.back()} />;
}
