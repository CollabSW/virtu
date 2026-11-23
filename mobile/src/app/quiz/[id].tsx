// src/app/quiz/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ApiQuizEngine } from '@/shared/features/quiz/screens/ApiQuizEngine';

const mockRequest = async (url: string, body: any) => {
  await new Promise(r => setTimeout(r, 800)); // Simula latencia
  
  if (url.includes('iniciar')) {
    return {
      intentoId: 1,
      leccion: { id: 101 },
      totalPreguntas: 5,
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
    const isCorrect = body.opcionSeleccionadaId === 1; // Si elige la opción A, es correcta
    return { 
      preguntaId: body.preguntaId, 
      esCorrecta: isCorrect,
      explicacion: "Esta es la explicación oficial que envía el backend sobre el tema.",
      opcionCorrectaId: 1 // El ID de la opción correcta
    };
  }
  
  if (url.includes('finalizar')) {
    // El backend simula que acertaste 4 de 5
    return { 
      intentoId: 1, 
      totalPreguntas: 5, 
      aciertos: 4, 
      aprobado: true, 
      calificacion: "80/100" // Enviamos string para probar que no hacemos matemáticas locales
    };
  }
};

export default function QuizRoute() {
  const { id } = useLocalSearchParams();
  const quizId = Number(id) || 1;
  const lessonId = 101; 

  return (
    <ApiQuizEngine 
      quizId={quizId}
      lessonId={lessonId}
      request={mockRequest} 
    />
  );
}