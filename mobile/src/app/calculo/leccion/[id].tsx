import { router, useLocalSearchParams } from 'expo-router';
import LessonScreen from '@/modules/calculo/screens/LessonScreen';

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = Number(id);
  if (!Number.isSafeInteger(lessonId) || lessonId <= 0) return null;
  return <LessonScreen id={lessonId} close={() => router.back()} onProgressChanged={async () => {}} />;
}
