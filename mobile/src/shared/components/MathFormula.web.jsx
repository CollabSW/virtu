
import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import { formulaToLatex } from './mathFormatting';

export default function MathFormula({ expression }) {
  const raw = String(expression ?? '').trim();

  const result = useMemo(() => {
    if (!raw) {
      return { html: '', error: false };
    }

    try {
      const latex = formulaToLatex(raw);

      const html = katex.renderToString(latex, {
        throwOnError: true,
        trust: false,
        strict: 'warn',
        output: 'htmlAndMathml',
        displayMode: true,
        maxExpand: 1000,
      });

      return { html, error: false };
    } catch {
      return { html: '', error: true };
    }
  }, [raw]);

  if (!raw) {
    return null;
  }

  if (result.error) {
    return (
      <div
        role="alert"
        style={{
          padding: 14,
          borderRadius: 10,
          backgroundColor: '#EFF3FB',
          color: '#17253B',
          fontSize: 16,
          overflowWrap: 'anywhere',
        }}
      >
        <strong>Representación original:</strong>
        <div style={{ marginTop: 8 }}>
          {raw}
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Fórmula matemática: ${raw}`}
      style={{
        width: '100%',
        minHeight: 52,
        boxSizing: 'border-box',
        padding: '16px 8px',
        backgroundColor: '#EFF3FB',
        borderRadius: 12,
        color: '#17253B',
        overflowX: 'auto',
        fontSize: 18,
        textAlign: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: result.html }}
    />
  );
}
