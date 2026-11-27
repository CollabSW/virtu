# GraphFunction: contrato T15/T17

`src/modules/calculo/components/GraphFunction.tsx` dibuja datos muestreados; no interpreta ni evalúa expresiones. No existe T15 en esta rama. El motor debe entregar coordenadas finitas y muestrear con suficiente densidad; T17 solo necesita pasar sus datos y estados al componente.

## Props de datos

- `points?: readonly { x: number; y: number }[]`: serie muestreada en orden creciente de `x`. Valores `NaN`, infinitos, fuera de los límites visibles y saltos verticales bruscos cortan el path.
- `segments?: readonly (readonly { x: number; y: number }[])[]`: preferido cuando T15 ya identifica intervalos continuos. Cada elemento siempre genera un path independiente; los cortes inválidos o abruptos también se aplican dentro de cada segmento. Si se proporciona, tiene precedencia sobre `points`.
- `domain?: { min: number; max: number }` y `range?: { min: number; max: number }`: intervalos visibles X/Y. `xMin`, `xMax`, `yMin` y `yMax` son alternativas independientes y prevalecen sobre el límite correspondiente de `domain`/`range`. Los límites omitidos se infieren de los puntos.
- `expression?: string`: etiqueta descriptiva, por ejemplo `x²` o `sin(x)`; no activa evaluación.

## Presentación y estados

`showGrid` es `true` por defecto. `loading`, `error` (`string | Error | null`), `emptyMessage`, `height`, `accessibilityLabel` y `style` son opcionales. Un intervalo no finito o con `min >= max` presenta un error accesible; datos ausentes o sin tramos dibujables presentan el estado vacío. El componente mide el ancho disponible con `onLayout`.

Ejemplo:

```tsx
<GraphFunction
  expression="1/x"
  segments={evaluatedFunction.segments}
  domain={{ min: -5, max: 5 }}
  range={{ min: -10, max: 10 }}
/>
```

Contrato recomendado de T15:

```ts
type EvaluatedFunction = {
  points?: readonly { x: number; y: number }[];
  segments?: readonly (readonly { x: number; y: number }[])[];
  domain?: { min: number; max: number };
  range?: { min: number; max: number };
  error?: string | null;
};
```

Para discontinuidades conocidas, T15 debe emitir `segments` separados y omitir `NaN`/`Infinity`; la detección de saltos de `GraphFunction` es una defensa adicional, no sustituye la identificación semántica de asíntotas por el evaluador.
