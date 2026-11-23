// src/app/quiz/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ApiQuizEngine } from '@/shared/features/quiz/screens/ApiQuizEngine';

// TODO: Importar tu función request real desde '@/config/apiConfig'
// Ejemplo: import { request } from '@/config/apiConfig';
const mockRequest = async (url: string, body: any) => {
  console.log("Llamando a:", url, body);
  // Simulamos un retraso de red de 1 segundo
  await new Promise(r => setTimeout(r, 1000));
  
  // Simulamos la respuesta de la API para que puedas probar
  if (url.includes('iniciar')) {
    return {
      intentoId: 1,
      leccion: { id: 101 },
      totalPreguntas: 5,
      preguntas: Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        orden: i,
        enunciado: `¿Pregunta de prueba número ${i + 1}?`,
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
    return { preguntaId: body.preguntaId, esCorrecta: Math.random() > 0.5 }; // Simula acierto/error
  }
  if (url.includes('finalizar')) {
    return { intentoId: 1, totalPreguntas: 5, aciertos: 4, aprobado: true, calificacion: 80 };
  }
};

export default function QuizRoute() {
  const { id } = useLocalSearchParams();
  
  // Asumimos que el id de la ruta es el quizId, y el lessonId viene por parámetro o está fijo
  const quizId = Number(id) || 1;
  const lessonId = 101; 

  return (
    <ApiQuizEngine 
      quizId={quizId}
      lessonId={lessonId}
      request={mockRequest} 
      onFinish={(res) => console.log('Quiz finalizado:', res)}
    />
  );
}