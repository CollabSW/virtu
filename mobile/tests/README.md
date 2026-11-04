# Pruebas aisladas — contratos vigentes

Las suites existentes verifican el cuestionario 5×4 por lección, resultado sobre cinco y aprobación desde 4/5; cero/una pregunta deben rechazarse sin completar un intento. Producción vive en `src/shared/features/quiz/`, no en `src/core/quiz/`. El glosario local recibe datos heterogéneos de seis materias, sin backend ni contenido pedagógico definitivo.

Los datos ficticios permanecen aquí. `QuizDemo.tsx` demuestra contratos internos de cuestionario/glosario y solo puede cargarse por el preview protegido con `__DEV__`; en release `/pruebas` redirige sin cargar demo. Publicación formal de motores pendiente de Sprint 2.

Desde `mobile/`: `npm test -- --runInBand`; lógica enfocada: `npm test -- --runInBand tests/quiz/quiz-state.test.ts`. No ejecutar export/Metro simultáneamente con Jest. Ver [plan vigente y evidencia](../docs/specs/core/plan.md).

---

## Contexto histórico del aislamiento anterior

Las referencias a `@/core/quiz` de este registro están sustituidas por los imports `@/shared/features/…`.

Esta carpeta contiene material de pruebas, separado de las herramientas reutilizables de `src/`. La dependencia habitual es `tests → src`; la única excepción es la ruta de preview protegida por `__DEV__`, que permite abrir la demo sin convertirla en contenido de producción.

- `quiz/*.test.ts` y `quiz/*.test.tsx`: validación, puntaje, estado y componentes reales de Core.
- `quiz/fixtures.ts`: cinco preguntas ficticias, casos límite y elecciones reproducibles.
- `quiz/QuizDemo.tsx`: componente del cuestionario de muestra; no es una ruta pública ni se exporta desde Core.
- `style-mock.js`: sustitución de CSS exclusivamente para Jest.

Desde `mobile/`:

```sh
npm test -- --runInBand
npm test -- --runInBand tests/quiz/quiz-state.test.ts
npm test -- --runInBand tests/quiz/quiz-state.test.ts -t "empty"
npm run typecheck
```

`jest.config.js` permanece en la raíz del paquete como configuración de tooling, pero solo descubre pruebas dentro de `tests/`. La antigua `/quiz` fue retirada. El acceso «Cuestionario de pruebas» desde Home abre el preview únicamente en desarrollo, con aviso visible de datos ficticios. El código de Core permanece sin fixtures; las materias deben consumir `@/core/quiz` con sus propios datos.

Para verlo: `npm run web`, pestaña **Pruebas** o enlace de Home. URL local con el puerto actual: `http://localhost:8081/pruebas` (si Expo elige otro puerto, usar el indicado en terminal). En release `/pruebas` redirige a Home sin cargar el cuestionario.
