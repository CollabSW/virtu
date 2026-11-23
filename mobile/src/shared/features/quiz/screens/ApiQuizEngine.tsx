// src/shared/features/quiz/screens/ApiQuizEngine.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/shared/components/Button';
import { useTheme } from '@/hooks/use-theme';
import { QuestionCard } from '../components/QuestionCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { startQuiz, answerQuestion, finishQuiz } from '../quizService';

// Interfaz adaptada para el componente visual
type UIQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
};

type Props = {
  quizId: number;
  lessonId: number;
  request: (url: string, body: any) => Promise<any>;
  onFinish?: (result: any) => void;
};

export function ApiQuizEngine({ quizId, lessonId, request, onFinish }: Props) {
  const theme = useTheme();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estados de la pregunta actual
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null);

  // 1. Iniciar el Quiz (POST /cuestionarios/:id/iniciar)
  useEffect(() => {
    async function initQuiz() {
      try {
        const data = await startQuiz(request, quizId, lessonId);
        setAttemptId(data.intentoId);
        
        // Mapeamos los datos de la API a lo que espera QuestionCard
        const mappedQuestions = data.preguntas.map((q: any) => ({
          id: String(q.id),
          text: q.enunciado,
          options: q.opciones.map((o: any) => ({ id: String(o.id), text: o.texto })),
        }));
        
        setQuestions(mappedQuestions);
      } catch (err: any) {
        setError(err.message || 'Error al iniciar el cuestionario');
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [quizId, lessonId, request]);

  // 2. Confirmar respuesta (POST /intentos/:intentoId/responder)
  const handleConfirm = async () => {
    if (!selectedOptionId || !attemptId || isSubmitting) return;
    
    setIsSubmitting(true); // Evita el doble envío
    const currentQuestion = questions[currentIndex];

    try {
      const result = await answerQuestion(
        request, 
        attemptId, 
        Number(currentQuestion.id), 
        Number(selectedOptionId)
      );
      // Recibimos el feedback oficial del servidor
      setFeedback({ isCorrect: result.esCorrecta });
    } catch (err: any) {
      setError(err.message || 'Error al enviar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Avanzar a la siguiente pregunta o finalizar
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setFeedback(null);
    } else {
      // Era la última pregunta
      if (attemptId) {
        try {
          const finalResult = await finishQuiz(request, attemptId);
          if (onFinish) onFinish(finalResult);
        } catch (err) {
          setError('Error al finalizar el cuestionario');
        }
      }
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.success} />
        <ThemedText style={{ marginTop: 16 }}>Iniciando cuestionario...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
      </ThemedView>
    );
  }

  const question = questions[currentIndex];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.success }]}>
          EVALUACIÓN EN CURSO
        </ThemedText>
        
        <ThemedText themeColor="textSecondary">
          Pregunta {currentIndex + 1} de {questions.length}
        </ThemedText>

        {/* Barra de progreso simple */}
        <View style={styles.track}>
          <View style={[styles.progress, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>

        <QuestionCard
          question={question}
          selectedOptionId={selectedOptionId}
          // Bloqueamos la tarjeta si está enviando o si ya hay feedback
          disabled={isSubmitting || !!feedback}
          onSelect={setSelectedOptionId}
          onConfirm={handleConfirm}
        />

        {/* Botón extra por si el FeedbackModal no maneja el avance automático */}
        {isSubmitting && <ActivityIndicator style={{ marginTop: 16 }} />}
      </ScrollView>

      <FeedbackModal
        visible={!!feedback}
        isCorrect={feedback?.isCorrect ?? false}
        explanation="El servidor ha registrado tu respuesta." // La API real no envía explicación, así que ponemos un texto genérico
        onContinue={handleNext}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  eyebrow: { letterSpacing: 1.5 },
  track: { height: 6, borderRadius: 8, backgroundColor: '#d8ddd9', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#39866b', borderRadius: 8 },
});