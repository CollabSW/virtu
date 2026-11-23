// src/app/quiz/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ApiQuizEngine } from '@/shared/features/quiz/screens/ApiQuizEngine';

const mockRequest = async (url: string, body: any) => {
  await new Promise(r => setTimeout(r, 1000)); 
  
  if (url.includes('iniciar')) {
    // Simulamos un error 401 de vez en cuando si el quizId es 99
    if (body === 99) throw new Error("401 Unauthorized");

    return {
      intentoId: 1,
      leccion: { id: 101 },
      totalPreguntas: 5,
      // T12: Agregamos un tiempo límite de 2 minutos (120 segundos) para probar
      tiempoLimiteSegundos: 120, 
      preguntas: Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        orden: i,
        enunciado: `¿Pregunta de prueba ${i + 1}?`,
        opciones: [
          { id: 1, texto: 'Opción A' },
          { id: 2, texto: 'Opción B' },
          { id: 3, texto: 'Opción C' },
          { id: 4, texto: 'Opción D' },
        ],
      })),
    };
  }
  
  if (url.includes('responder')) {
    // Simulamos pérdida de conexión si eligen la opción D
    if (body.opcionSeleccionadaId === 4) {
      throw new Error("Network request failed"); 
    }
    const isCorrect = body.opcionSeleccionadaId === 1;
    return { 
      preguntaId: body.preguntaId, 
      esCorrecta: isCorrect,
      explicacion: "Explicación oficial.",
      opcionCorrectaId: 1 
    };
  }
  
  if (url.includes('finalizar')) {
    return { intentoId: 1, totalPreguntas: 5, aciertos: 4, aprobado: true, calificacion: "80/100" };
  }
};

export default function QuizRoute() {
  const { id } = useLocalSearchParams();
  const quizId = Number(id) || 1;

  return <ApiQuizEngine quizId={quizId} lessonId={101} request={mockRequest} />;
}