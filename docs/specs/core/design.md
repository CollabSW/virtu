# Virtu Core — diseño técnico

Implementa [spec.md](spec.md). Los criterios y estados de entrega viven en [tasks.md](tasks.md); el orden y la evidencia, en [plan.md](plan.md).

## Decisión: Core explícito dentro de mobile

`mobile/src/core/quiz/` reemplaza la ubicación genérica anterior. Es un cambio de límite y nombre, no una segunda implementación ni un cambio de contratos. La aclaración del usuario establece que cada materia usará estas herramientas en sus propios canales.

Alternativas descartadas:
- Mantenerlo como feature genérica oculta su responsabilidad transversal.
- Crear un paquete raíz independiente exigiría workspace, resolución y empaquetado sin otro consumidor fuera de `mobile/` que lo justifique.

## Dependencias y propiedad

```text
Canal/pantalla de cada materia (preguntas, título, consumo del resultado)
    └── @/core/quiz (API pública)
          ├── QuizEngine + FeedbackModal (presentación reutilizable)
          └── useQuiz (controlador)
                └── quiz-state + types (estado, validación y puntaje)

Presentación Core → componentes/tema/hooks generales de la aplicación
Core ↛ rutas, contenido o servicios particulares de una materia
```

El cuestionario ficticio «Cultura general» es un consumidor aislado en `mobile/tests/quiz/QuizDemo.tsx`, no una pantalla de la aplicación. No hay módulos de canales implementados: este diseño define el límite para que los integren, no crea una estructura ficticia para ellos.

## Archivos y puntos de extensión

Rutas relativas a `mobile/src/core/quiz/`:

| Archivo | Responsabilidad |
|---|---|
| `index.ts` | Entrada pública: `QuizEngine`, `FeedbackModal`, `useQuiz` y contratos |
| `types.ts` | Datos y props compartidos; sin tipos específicos de Cálculo |
| `quiz-state.ts` | Transiciones puras, snapshot, validación y único `calculateScore` |
| `use-quiz.ts` | Serializar acciones, invalidar handlers de preguntas anteriores y notificar callbacks |
| `QuizEngine.tsx` | Componer selección, confirmación, feedback y resultado |
| `FeedbackModal.tsx` | Presentar explicación y continuar una vez por apertura |

Las materias usan `@/core/quiz`. No se necesitan imports de `quiz-state` en los canales. No se conservan fachadas en las rutas antiguas porque no hay consumidores externos verificados que las necesiten.

### Pruebas fuera de la aplicación

`mobile/tests/quiz/` contiene `fixtures.ts`, `QuizDemo.tsx` y las suites del motor, modal y preview. Los tests importan implementación de `@/core/quiz`; los fixtures importan sus tipos, no al revés. Core y canales de producción no importan esta carpeta. La única excepción autorizada es una ruta puente de preview que carga `QuizDemo` exclusivamente con `__DEV__`.

`mobile/jest.config.js` solo descubre `tests/**/*.test.[jt]s?(x)` y mantiene preset Expo, alias `@/` y mock CSS en `tests/`. Es configuración del runner, no código de Core. TypeScript sigue comprobando tanto producción como pruebas mediante el `tsconfig.json` existente. Las dependencias de testing siguen siendo de desarrollo.

El usuario solicitó volver a mostrar el cuestionario de prueba tras aislarlo. Se habilita un acceso desde Home únicamente en desarrollo, rotulado «Cuestionario de pruebas», y una ruta puente con carga condicional para conservar fixtures fuera de Core. El componente muestra un aviso persistente de datos ficticios y de que no pertenece a un canal real. En release no se carga la demo; la ruta debe mostrar indisponibilidad o redirigir. No se modifica el motor para habilitar este preview.

## Contratos existentes

- `Option`: `readonly id: string`, `readonly text: string`.
- `Question`: `readonly id`, `text`, `options: readonly Option[]`, `correctOptionId`, `explanation`.
- `QuizAnswer`: `questionId`, `optionId`, `isCorrect: boolean`.
- `QuizResult`: `totalQuestions`, `correctAnswers`, `score: number`, `answers: readonly QuizAnswer[]`.
- `QuizEngineProps`: `questions: readonly Question[]`, `title?`, `onAnswer?: (answer: QuizAnswer) => void`, `onComplete?: (result: QuizResult) => void`.
- `FeedbackModalProps`: `visible`, `isCorrect`, `explanation`, `onContinue: () => void`.
- `useQuiz(questions, onAnswer?, onComplete?)`: devuelve `state`, `select(optionId)`, `confirm()` y `continue()`. El consumidor normalmente solo necesita el componente.

Los tipos fuente son la autoridad de firmas; la guía muestra un ejemplo completo compilable. Los callbacks notifican sincrónicamente y no deben lanzar. La materia decide qué hacer con el resultado; Core no lo persiste.

## Estado y concurrencia

`answering → feedback → answering/completed`. La lista vacía comienza en `completed`.

Las transiciones inválidas devuelven la misma referencia. El controlador conserva la referencia actual en un ref actualizado desde eventos; cada handler corresponde al índice/fase que lo originó. Los callbacks se actualizan tras el commit. Esto evita dos confirmaciones en el mismo batch y acciones retenidas que operen sobre otra pregunta, sin crear una segunda fuente de verdad.

Cada apertura del modal tiene una sesión invalidada al cerrar. Su botón consume esa sesión antes de notificar. La presentación no incrementa preguntas ni calcula puntajes: solicita la transición al controlador. El foco usa las capacidades de React Native/Modal y restauración web; falta validación manual con lectores de pantalla.

Las preguntas/opciones se copian y congelan al iniciar; respuestas/estados no se mutan. Puntaje: `Math.round(correctAnswers / totalQuestions * 100)`, excepto vacío → 0. Conteos inválidos lanzan `RangeError`; no se corrigen silenciosamente.

## Integración y evolución

Cambiar contenido de una materia no exige editar Core. Otro intento requiere nueva `key`. No duplicar motor por canal, agregar condicionales por nombre de materia ni mover navegación a Core.

Cuando lleguen C2-02/03/12/13, acordar sus interfaces y sustituir solo las piezas necesarias manteniendo validación, estado y cálculo únicos. El glosario tendrá que definirse a partir de su implementación real; no se fija aquí una API anticipada.
