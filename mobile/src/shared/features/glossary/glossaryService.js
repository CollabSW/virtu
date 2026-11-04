// @ts-check

/** @typedef {'historia' | 'biologia' | 'quimica' | 'ingles' | 'calculo' | 'fisica'} GlossarySubject */
/** @typedef {{ readonly id: string, readonly subject: GlossarySubject, readonly title: string, readonly definition?: string, readonly topic?: string, readonly rendering?: string, readonly date?: string, readonly character?: string, readonly timeline?: string, readonly concept?: string, readonly videoUrl?: string, readonly vocabulary?: string, readonly audioUrl?: string, readonly example?: string, readonly front?: string, readonly back?: string, readonly symbol?: string, readonly atomicNumber?: number, readonly properties?: string | readonly string[] }} GlossaryEntry */

const subjects = new Set(['historia', 'biologia', 'quimica', 'ingles', 'calculo', 'fisica']);

/** @param {readonly GlossaryEntry[]} entries @param {GlossarySubject=} subject @returns {readonly GlossaryEntry[]} */
export function getGlossaryEntries(entries, subject) {
  if (!Array.isArray(entries)) throw new TypeError('entries must be an array');
  if (subject !== undefined && !subjects.has(subject)) throw new TypeError(`Unsupported glossary subject: ${subject}`);
  return subject === undefined ? entries : entries.filter((entry) => entry.subject === subject);
}

/** @param {unknown} value @returns {string[]} */
function textValues(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(textValues);
  if (value && typeof value === 'object') return Object.values(value).flatMap(textValues);
  return [];
}

/** @param {readonly GlossaryEntry[]} entries @param {string} query @param {GlossarySubject=} subject @returns {readonly GlossaryEntry[]} */
export function filterGlossaryEntries(entries, query, subject) {
  const filtered = getGlossaryEntries(entries, subject);
  const needle = typeof query === 'string' ? query.trim().toLocaleLowerCase() : '';
  if (!needle) return filtered;
  return filtered.filter((entry) => textValues(entry).some((value) => value.toLocaleLowerCase().includes(needle)));
}
