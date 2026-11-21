export function normalizeFormula(value) {
  return value.trim().replace(/\\\\(?=[a-zA-Z])/g, '\\')
    .replace(/^\$\$([\s\S]*)\$\$$/, '$1').replace(/^\$([\s\S]*)\$$/, '$1')
    .replace(/^\\\(([\s\S]*)\\\)$/, '$1').replace(/^\\\[([\s\S]*)\\\]$/, '$1');
}

function closingParenthesis(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') depth++;
    if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

function unwrap(text) {
  const trimmed = text.trim();
  return trimmed[0] === '(' && closingParenthesis(trimmed, 0) === trimmed.length - 1
    ? trimmed.slice(1, -1) : trimmed;
}

export function formulaToLatex(value) {
  const source = normalizeFormula(value);
  if (/\\[a-zA-Z]+/.test(source)) return source;
  if (source.includes('=')) return source.split('=').map(formulaToLatex).join(' = ');
  let converted = '';
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '^' && source[i + 1] === '(') {
      const end = closingParenthesis(source, i + 1);
      if (end !== -1) {
        converted += `^{${formulaToLatex(source.slice(i + 2, end))}}`;
        i = end;
        continue;
      }
    }
    converted += source[i];
  }
  let depth = 0;
  let slash = -1;
  let hasSum = false;
  for (let i = 0; i < converted.length; i++) {
    if ('({'.includes(converted[i])) depth++;
    else if (')}'.includes(converted[i])) depth--;
    else if (!depth && converted[i] === '/') slash = i;
    else if (!depth && i > 0 && '+-'.includes(converted[i])) hasSum = true;
  }
  // shortcut: only legacy standalone fractions are converted; use explicit LaTeX for mixed arithmetic.
  if (slash > 0 && slash < converted.length - 1 && !hasSum) {
    return `\\frac{${formulaToLatex(unwrap(converted.slice(0, slash)))}}{${formulaToLatex(unwrap(converted.slice(slash + 1)))}}`;
  }
  return converted.replace(/(^|[^a-zA-Z])(sin|cos|tan|ln|log)\s*(?=\()/g, '$1\\$2')
    .replace(/\^(\d{2,})/g, '^{$1}').replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/[×*]/g, '\\cdot ');
}

export function splitMathText(text, standalone = false) {
  if (standalone && /[\d=^/\\²³]/.test(text)
    && /^[\da-zA-Z\s()+\-*/^=.'′{},\\²³]+$/.test(text)
    && (text.match(/[a-zA-Z]+/g) ?? []).every(word => word.length === 1 || /^(sin|cos|tan|ln|log|lim)$/.test(word))) {
    return [{ math: true, value: text }];
  }
  const pattern = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|(?:[a-zA-Z]['′]?\([^,;\n]*?\)|y)\s*=\s*[^,;:\n]+/g;
  const parts = [];
  let start = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > start) parts.push({ math: false, value: text.slice(start, match.index) });
    parts.push({ math: true, value: match[0] });
    start = match.index + match[0].length;
  }
  if (start < text.length) parts.push({ math: false, value: text.slice(start) });
  return parts;
}
