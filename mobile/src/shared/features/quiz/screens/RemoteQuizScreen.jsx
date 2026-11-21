import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import MathText from '@/shared/components/MathText';
import { useAuth } from '@/shared/context/AuthContext';
import { QuestionCard } from '../components/QuestionCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { answerQuestion, finishQuiz, startQuiz } from '../quizService';

export default function RemoteQuizScreen({ quizId, lessonId, close, onProgressChanged }) {
  const { request } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [expired, setExpired] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const pending = useRef(false);
  const question = attempt?.preguntas[index];

  async function begin() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const started = Date.now();
      const data = await startQuiz(request, quizId, lessonId);
      setAttempt(data);
      setIndex(0);
      setSelected(null);
      setLocked(false);
      setFeedback(null);
      setResult(null);
      setExpired(false);
      setFinishing(false);
      const limit = data.tiempoLimiteSegundos;
      setDeadline(typeof limit === 'number' && limit > 0 ? started + limit * 1000 : null);
      setRemaining(typeof limit === 'number' && limit > 0 ? limit : null);
    } catch (failure) { setError(failure.message); }
    finally { pending.current = false; setBusy(false); }
  }

  const finish = useCallback(async () => {
    if (pending.current || !attempt || result) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const official = await finishQuiz(request, attempt.intentoId);
      setResult(official);
      setFeedback(null);
      setDeadline(null);
      await onProgressChanged();
    } catch (failure) { setError(failure.message); }
    finally { pending.current = false; setBusy(false); }
  }, [attempt, result, request, onProgressChanged]);

  useEffect(() => {
    if (deadline === null || result) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) {
        setExpired(true);
        setFeedback(null);
      }
    };
    const timer = setInterval(tick, 1000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') tick(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [deadline, result]);

  async function confirm() {
    if (pending.current || !selected || feedback || expired) return;
    pending.current = true;
    setBusy(true);
    setLocked(true);
    setError('');
    try {
      const data = await answerQuestion(request, attempt.intentoId, question.id, Number(selected));
      setFeedback(data);
    } catch (failure) {
      setError(`${failure.message} La selección queda bloqueada para evitar cambiar una respuesta que el servidor pudo registrar. Puedes reintentar la misma confirmación o volver e iniciar otro intento.`);
    } finally { pending.current = false; setBusy(false); }
  }

  function next() {
    setFeedback(null);
    if (index === 4) { setFinishing(true); void finish(); return; }
    setIndex(value => value + 1);
    setSelected(null);
    setLocked(false);
  }

  return <View style={{ gap: 12 }}>
    <Button title="Volver a la lección" disabled={busy} onPress={close} />
    {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
    {busy && <ActivityIndicator accessibilityLabel="Consultando evaluación" />}
    {!attempt || result ? <>
      {result && <>
        <Card>
          <ThemedText type="subtitle">{result.aprobado ? '¡Cuestionario aprobado!' : 'Sigue practicando'}</ThemedText>
          <ThemedText>{result.aciertos} de {result.totalPreguntas} aciertos</ThemedText>
          <ThemedText>Nota oficial: {result.calificacion}</ThemedText>
        </Card>
        {result.retroalimentacion?.map(item => <Card key={item.preguntaId}>
          <MathText text={item.enunciado} />
          <ThemedText>Tu respuesta:</ThemedText>
          <MathText text={item.opcionSeleccionadaTexto ?? 'Sin respuesta'} standalone />
          <ThemedText>Respuesta correcta:</ThemedText>
          <MathText text={item.opcionCorrectaTexto} standalone />
          <MathText text={item.solucion} />
        </Card>)}
      </>}
      <Button title={result ? 'Reintentar cuestionario' : 'Comenzar intento'} disabled={busy} onPress={begin} />
    </> : expired || finishing ? <>
      <ThemedText>{expired ? 'Se agotó el tiempo establecido por el servidor.' : 'Respuestas confirmadas. Consulta tu resultado oficial.'}</ThemedText>
      <Button title="Finalizar intento" disabled={busy} onPress={finish} />
    </> : <>
      <ThemedText>Pregunta {index + 1} de 5</ThemedText>
      {remaining !== null && <ThemedText>Tiempo restante: {remaining} segundos</ThemedText>}
      <QuestionCard renderMath question={{ id: String(question.id), text: question.enunciado,
        options: question.opciones.map(option => ({ id: String(option.id), text: option.texto })) }}
        selectedOptionId={selected} disabled={busy || locked}
        onSelect={setSelected} onConfirm={confirm} />
      {!!error && locked && <Button title="Reintentar confirmación" disabled={busy} onPress={confirm} />}
      <FeedbackModal renderMath visible={!!feedback} isCorrect={feedback?.esCorrecta ?? false}
        explanation={feedback?.explicacion ?? ''}
        correctOptionText={question.opciones.find(option => option.id === feedback?.opcionCorrectaId)?.texto}
        onContinue={next} />
    </>}
  </View>;
}
