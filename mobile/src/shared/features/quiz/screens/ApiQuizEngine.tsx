// src/shared/features/quiz/screens/ApiQuizEngine.tsx
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { useTheme } from '@/hooks/use-theme';
import { QuestionCard } from '../components/QuestionCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { startQuiz, answerQuestion, finishQuiz } from '../quizService';

type UIQuestion = { id: string; text: string; options: { id: string; text: string }[] };
type ServerFeedback = { isCorrect: boolean; explanation: string; correctOptionText: string };
type Props = { quizId: number; lessonId: number; request: (url: string, body: any) => Promise<any> };

export function ApiQuizEngine({ quizId, lessonId, request }: Props) {
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(true); // Saber si podemos reintentar (true para GET, false para POST)
  
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ServerFeedback | null>(null);
  const [finalResult, setFinalResult] = useState<any | null>(null);

  // --- ESTADOS PARA T12 (ROBUSTEZ) ---
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Temporizador
  const [isTimedOut, setIsTimedOut] = useState(false); // Si se agotó el tiempo
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Función auxiliar para traducir errores técnicos a mensajes humanos (T12)
  const getFriendlyError = (err: any) => {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('network') || msg.includes('failed to fetch')) return 'Parece que no hay conexión a internet. Revisa tu red e intenta de nuevo.';
    if (msg.includes('401') || msg.includes('unauthorized')) return 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.';
    if (msg.includes('404')) return 'El cuestionario no está disponible en este momento.';
    if (msg.includes('400')) return 'Hubo un problema con tu solicitud. Intenta recargar la página.';
    return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
  };

  // 1. Iniciar el Quiz (GET)
  const initQuiz = async () => {
    setLoading(true);
    setError(null);
    setFinalResult(null);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedback(null);
    setIsTimedOut(false);
    setTimeLeft(null);

    try {
      const data = await startQuiz(request, quizId, lessonId);
      setAttemptId(data.intentoId);
      
      // T12: Temporizador si existe en la respuesta
      if (data.tiempoLimiteSegundos) {
        setTimeLeft(data.tiempoLimiteSegundos);
      }

      const mappedQuestions = data.preguntas.map((q: any) => ({
        id: String(q.id),
        text: q.enunciado,
        options: q.opciones.map((o: any) => ({ id: String(o.id), text: o.texto })),
      }));
      setQuestions(mappedQuestions);
    } catch (err: any) {
      setError(getFriendlyError(err));
      setIsRetryable(true); // Como es un GET, permitimos reintentar
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initQuiz(); }, [quizId, lessonId]);

  // T12: Lógica del temporizador
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || finalResult || feedback) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimedOut(true);
          setIsSubmitting(true); // Bloquea el quiz
          // Aquí podrías llamar automáticamente a finishQuiz(request, attemptId) si el backend lo requiere
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, finalResult, feedback]);

  // 2. Confirmar respuesta (POST)
  const handleConfirm = async () => {
    if (!selectedOptionId || !attemptId || isSubmitting || isTimedOut) return;
    
    setIsSubmitting(true);
    const currentQuestion = questions[currentIndex];

    try {
      const result = await answerQuestion(request, attemptId, Number(currentQuestion.id), Number(selectedOptionId));
      const correctOpt = currentQuestion.options.find((o) => o.id === String(result.opcionCorrectaId));

      setFeedback({
        isCorrect: result.esCorrecta,
        explanation: result.explicacion || 'Sin explicación adicional.',
        correctOptionText: correctOpt?.text || 'Desconocida',
      });
    } catch (err: any) {
      // T12: NO reintentamos POST automáticamente para evitar duplicados.
      // Mostramos una alerta para que el usuario decida.
      setIsRetryable(false); 
      setError(getFriendlyError(err));
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
      if (attemptId) {
        setLoading(true);
        setError(null);
        try {
          const result = await finishQuiz(request, attemptId);
          setFinalResult(result);
        } catch (err: any) {
          setIsRetryable(false); // Es POST, no reintentar a ciegas
          setError(getFriendlyError(err));
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

  // T12: Pantalla de Error robusta
  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 10 }}>¡Ups! Algo salió mal</ThemedText>
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center', marginBottom: 20 }}>{error}</ThemedText>
        
        {isRetryable ? (
          <Button title="Reintentar" onPress={initQuiz} />
        ) : (
          <Button title="Volver a cargar el cuestionario" onPress={initQuiz} />
        )}
      </ThemedView>
    );
  }

  // T12: Pantalla si se agota el tiempo
  if (isTimedOut) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title" style={{ color: '#a52d25', marginBottom: 10 }}>Tiempo agotado</ThemedText>
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center', marginBottom: 20 }}>
          Se ha acabado el tiempo límite para este cuestionario. El intento ha sido cerrado.
        </ThemedText>
        <Button title="Volver al inicio" onPress={initQuiz} />
      </ThemedView>
    );
  }

  if (finalResult) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.resultSummary}>
          <Header title={finalResult.aprobado ? '¡Cuestionario aprobado!' : 'Sigue practicando'} />
          <ThemedText type="title" style={styles.score}>{finalResult.calificacion}</ThemedText>
          <ThemedText>{finalResult.aciertos} de {finalResult.totalPreguntas} respuestas correctas</ThemedText>
        </Card>
        <Button title="Intentar de nuevo" onPress={initQuiz} style={{ marginTop: 16 }} />
      </ScrollView>
    );
  }

  const question = questions[currentIndex];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText themeColor="textSecondary">
            Pregunta {currentIndex + 1} de {questions.length}
          </ThemedText>
          {/* T12: Mostrar temporizador solo si existe */}
          {timeLeft !== null && (
            <ThemedText type="smallBold" style={{ color: timeLeft < 10 ? '#a52d25' : theme.textSecondary }}>
              ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </ThemedText>
          )}
        </View>

        <View style={styles.track}>
          <View style={[styles.progress, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>

        <QuestionCard
          question={question}
          selectedOptionId={selectedOptionId}
          disabled={isSubmitting || !!feedback || isTimedOut}
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
    width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 40, gap: 20,
  },
  track: { height: 6, borderRadius: 8, backgroundColor: '#d8ddd9', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#39866b', borderRadius: 8 },
  resultSummary: { alignItems: 'center', padding: 24, borderRadius: 24, gap: 8 },
  score: { fontSize: 48, lineHeight: 56 },
});