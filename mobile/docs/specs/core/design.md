# Virtu Core 2 — diseño aprobado

## Decisión vigente: árbol original de la magíster

El usuario aprobó restituir las features del alcance en `mobile/src/shared/features/`, sin archivos de producción adicionales ni duplicación en `src/core/quiz/`. La especificación vigente encabeza [spec.md](spec.md); el plan y el registro encabezan [plan.md](plan.md).

Alternativas consideradas: conservar `src/core/quiz/` contradice explícitamente el árbol y C2-05; añadir fachadas conservaría dos ubicaciones y archivos no aprobados. Se elige una implementación única en los nombres originales, reutilizando presentación y controles existentes. No se rediseña la app ni se desarrollan módulos de materias ajenos al alcance.

La revisión completa de las 28 tarjetas mantiene esa decisión: no agrega backend, autenticación o materias porque no forman parte de las tarjetas consultadas. Los gaps se resuelven en componentes/servicios ya aprobados y suites separadas. El fixture heterogéneo se extrae a `tests/glossary/fixtures.ts`, con dependencia tests→producción; solo el preview protegido puede consumirlo.

## Dependencias vigentes

```text
Materia / consumidor (lección, preguntas, callbacks)
  └── shared/features/quiz/screens/QuizScreen.tsx
        ├── components/QuestionCard.tsx
        ├── components/FeedbackModal.tsx
        └── screens/ResultScreen.tsx
Consumidor (datos heterogéneos de glosario)
  └── shared/features/glossary/screens/GlossaryScreen.tsx
        └── glossaryService.js (consulta local, no mocks internos)
```

Las features no importan rutas ni materias. Configuración en `config/theme.js`; controles visuales comunes en `shared/components/{Header,Button,Card,SearchBar}.tsx`, consumidos por los componentes/pantallas que los necesitan. La navegación nativa/web actual queda en `navigation/AppNavigator.tsx`; `_layout.tsx` conserva la integración con Expo Router. No se crea un AuthNavigator ni MathRenderer o Backend ficticio. Adaptadores y efectos del starter que permanecen se identifican como heredados, no como entregables completos del árbol original. `QuestionCard` controla presentación/selección/solicitud de confirmar; el modal solo feedback/continuación; `ResultScreen` presenta resultado y revisión sin recalcular.

## Contratos y estado

Los tipos públicos TypeScript de cuestionario se exportan desde `QuizScreen.tsx`, no desde un `types.ts` nuevo. Props: `lessonId`, `questions`, `title?`, `onAnswer?`, `onComplete?`. Datos: opciones con id/text; preguntas con id/text/options/correctOptionId/explanation. La lección identifica el intento que agrupa las cinco preguntas.

La lógica pura local vive en `QuizScreen.tsx` con tipos TypeScript: snapshot validado 5×4, selección, confirmación, avance y resultado. No necesita archivo auxiliar. El estado guarda lección, preguntas congeladas, índice, selección, respuestas y fase. Transiciones: answering → feedback → answering/completed. Las entradas inválidas no crean un intento válido; la pantalla captura el error y no notifica onComplete.

`quizService.js` es el archivo objetivo del envío de notas y registro de intentos en Sprint 2. Se retiró su máquina de estados; el pull posterior de C2-02 añadió el nombre como archivo vacío junto a `Timer.tsx`. Se preservan esos archivos del equipo sin simular API/timer. Las pruebas de lógica importan las funciones de QuizScreen; ningún componente importa el servicio para controlar selección/avance.

El resultado incluye lessonId, totalQuestions=5, correctAnswers, score (aciertos 0–5), passed (>=4) y answers. Solo existe resultado de un intento completo. No se registra duración ni se cambia el contenido del intento al mutar props; nueva key para reiniciar. Los handlers están vinculados a fase/índice y callbacks actuales para evitar eventos duplicados/obsoletos y problemas de StrictMode.

El glosario recibe entries y subject opcional; el contrato JSDoc de `glossaryService.js` contempla las seis materias y campos textuales opcionales de sus detalles (definición/temática/fecha/personaje/línea temporal/concepto/video/vocabulario/audio/ejemplo/flashcard/elemento). Búsqueda sobre contenido textual, no solo título; consulta vacía conserva lista, cero coincidencias muestra estado explícito y permite limpiar. No reproductores multimedia ni renderizadores de fórmulas inventados en esta dependencia mínima.

## Pruebas y límites

La ampliación de Jhaelin reutiliza controlador y vistas: no hay segundo scorer ni estado paralelo. Los fixtures agrupan lección/preguntas fuera de producción. Las suites existentes recorren las seis notas 0..5 y resultados esperados explícitos, sin obtener el esperado del cálculo que se prueba. UI renderiza QuizScreen/ResultScreen reales. Si el test pasa en la base existente se declara caracterización, no un RED inventado.

Se actualizan las suites existentes bajo `mobile/tests/quiz/`; los datos ficticios no entran en producción. El preview existente conserva su guard `__DEV__` y muestra ambos contratos sin abrir rutas nuevas. La ruta release redirige sin cargar la demo.

Timer: duración no definida, pendiente de aclaración. AuthNavigator, configuración API, servicios comunes, panel docente y materias no se crean como scaffolding. La conformidad aquí es del código implementado y su responsabilidad, no de todo el árbol ni del ERS ausente. Accesibilidad nativa y QA dispositivo requieren comprobación manual posterior.

---

## Diseño histórico sustituido — no usar para nuevos consumidores

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
