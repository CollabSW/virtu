export async function startQuiz(request, quizId, lessonId) {
  const data = await request(`/cuestionarios/${quizId}/iniciar`, {});
  if (!Number.isSafeInteger(data?.intentoId) || data.intentoId <= 0
    || data.leccion?.id !== lessonId || data.totalPreguntas !== 5
    || !Array.isArray(data.preguntas) || data.preguntas.length !== 5
    || new Set(data.preguntas.map(q => q?.id)).size !== 5
    || data.preguntas.some(q => !q || !Number.isSafeInteger(q.id) || q.id <= 0 || !q.enunciado
      || !Array.isArray(q.opciones) || q.opciones.length !== 4
      || new Set(q.opciones.map(o => o?.id)).size !== 4
      || q.opciones.some(o => !o || !Number.isSafeInteger(o.id) || o.id <= 0 || !o.texto))) {
    throw new Error('El servidor devolvió un cuestionario inválido. Vuelve a la lección.');
  }
  return { ...data, preguntas: [...data.preguntas].sort((a, b) => a.orden - b.orden) };
}

export async function answerQuestion(request, attemptId, questionId, optionId) {
  const feedback = await request(`/intentos/${attemptId}/responder`, {
    preguntaId: questionId, opcionSeleccionadaId: optionId,
  });
  if (feedback?.preguntaId !== questionId || typeof feedback.esCorrecta !== 'boolean') {
    throw new Error('No se pudo verificar la confirmación del servidor.');
  }
  return feedback;
}

export async function finishQuiz(request, attemptId) {
  const result = await request(`/intentos/${attemptId}/finalizar`, {});
  if (result?.intentoId !== attemptId || result.totalPreguntas !== 5
    || !Number.isInteger(result.aciertos) || result.aciertos < 0 || result.aciertos > 5
    || typeof result.aprobado !== 'boolean' || result.calificacion == null
    || !Number.isFinite(Number(result.calificacion))) {
    throw new Error('El servidor no devolvió un resultado oficial válido. Consulta el historial.');
  }
  return result;
}
