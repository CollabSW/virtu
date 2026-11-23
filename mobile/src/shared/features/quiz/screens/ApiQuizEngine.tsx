// src/shared/features/quiz/screens/ApiQuizEngine.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { useTheme } from '@/hooks/use-theme';
import { QuestionCard } from '../components/QuestionCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { startQuiz, answerQuestion, finishQuiz } from '../quizService';

type UIQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
};

type ServerFeedback = {
  isCorrect: boolean;
  explanation: string;
  correctOptionText: string;
};

type Props = {
  quizId: number;
  lessonId: number;
  request: (url: string, body: any) => Promise<any>;
};

export function ApiQuizEngine({ quizId, lessonId, request }: Props) {
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
  const [feedback, setFeedback] = useState<ServerFeedback | null>(null);

  // Estado para la pantalla final (respuesta oficial del backend)
  const [finalResult, setFinalResult] = useState<any | null>(null);

  // 1. Iniciar el Quiz
  const initQuiz = async () => {
    setLoading(true);
    setError(null);
    setFinalResult(null);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);

    try {
      const data = await startQuiz(request, quizId, lessonId);
      setAttemptId(data.intentoId);
      
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
  };

  useEffect(() => {
    initQuiz();
  }, [quizId, lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Confirmar respuesta
  const handleConfirm = async () => {
    if (!selectedOptionId || !attemptId || isSubmitting) return;
    
    setIsSubmitting(true);
    const currentQuestion = questions[currentIndex];

    try {
      const result = await answerQuestion(
        request, 
        attemptId, 
        Number(currentQuestion.id), 
        Number(selectedOptionId)
      );
      
      // Buscamos el texto de la opción correcta usando el ID que dio el servidor
      const correctOpt = currentQuestion.options.find(
        (o) => o.id === String(result.opcionCorrectaId)
      );

      setFeedback({
        isCorrect: result.esCorrecta,
        explanation: result.explicacion || 'Sin explicación adicional.',
        correctOptionText: correctOpt?.text || 'Desconocida',
      });
    } catch (err: any) {
      setError(err.message || 'Error al enviar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Avanzar o finalizar
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setFeedback(null);
    } else {
      // Era la última pregunta, finalizamos el intento en el servidor
      if (attemptId) {
        setLoading(true);
        try {
          const result = await finishQuiz(request, attemptId);
          setFinalResult(result); // Guardamos la nota oficial del backend
        } catch (err: any) {
          setError(err.message || 'Error al finalizar el cuestionario');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.success} />
        <ThemedText style={{ marginTop: 16 }}>Cargando...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Button title="Volver a intentar" onPress={initQuiz} style={{ marginTop: 20 }} />
      </ThemedView>
    );
  }

  // PANTALLA FINAL: Muestra estrictamente lo que dijo el backend
  if (finalResult) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.resultSummary}>
          <Header title={finalResult.aprobado ? '¡Cuestionario aprobado!' : 'Sigue practicando'} />
          <ThemedText type="title" style={styles.score}>
            {finalResult.calificacion}
          </ThemedText>
          <ThemedText>{finalResult.aciertos} de {finalResult.totalPreguntas} respuestas correctas</ThemedText>
        </Card>
        
        <Button 
          title="Intentar de nuevo" 
          onPress={initQuiz} 
          style={{ marginTop: 16 }} 
        />
      </ScrollView>
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

        <View style={styles.track}>
          <View style={[styles.progress, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>

        <QuestionCard
          question={question}
          selectedOptionId={selectedOptionId}
          disabled={isSubmitting || !!feedback}
          onSelect={setSelectedOptionId}
          onConfirm={handleConfirm}
        />

        {isSubmitting && <ActivityIndicator style={{ marginTop: 16 }} />}
      </ScrollView>

      <FeedbackModal
        visible={!!feedback}
        isCorrect={feedback?.isCorrect ?? false}
        explanation={feedback?.explanation ?? ''}
        correctOptionText={feedback?.correctOptionText}
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
  resultSummary: { alignItems: 'center', padding: 24, borderRadius: 24, gap: 8 },
  score: { fontSize: 48, lineHeight: 56 },
});