# Pruebas aisladas

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
