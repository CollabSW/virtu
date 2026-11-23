export function getProgress(request, slug) {
  return request(`/contenidos/${encodeURIComponent(slug)}`);
}

export function getAttemptHistory(request, quizId) {
  return request(`/cuestionarios/${quizId}/historial`);
}
