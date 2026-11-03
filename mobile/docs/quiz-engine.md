# Virtu Core — guía de consumo de QuizEngine

QuizEngine es una herramienta de **Core**, la capa reutilizable que consumen todas las materias en sus propios canales; no pertenece al canal de Cálculo. No consulta APIs ni guarda intentos. SDD: [spec](../../docs/specs/core/spec.md), [design](../../docs/specs/core/design.md), [tasks](../../docs/specs/core/tasks.md) y [plan](../../docs/specs/core/plan.md).

## Estructura y contratos

La herramienta vive en `src/core/quiz/`, dentro del paquete `mobile/`. Su entrada pública es `@/core/quiz`:

- `types.ts`: `Option`, `Question`, `QuizAnswer`, `QuizResult`, `QuizEngineProps`, `FeedbackModalProps`.
- `quiz-state.ts`: validación inicial, instantánea de datos y transiciones puras; único `calculateScore`.
- `use-quiz.ts`: controlador React; serializa eventos y notifica callbacks. `QuizEngine.tsx`: contenedor y controles locales; `FeedbackModal.tsx`: explicación/continuación. `index.ts`: exporta componentes, hook y contratos.
- Las pruebas, datos ficticios y componente de muestra viven en `tests/quiz/`, fuera de Core. Home ofrece un acceso «Cuestionario de pruebas» solo en desarrollo, mediante una ruta puente protegida por `__DEV__`; no es un canal real ni carga la demo en release.
- Los componentes visuales consumen esos contratos; no deben mantener otro contador de respuestas o puntaje.

### Límite Core / canales de materias

- **Core** define contratos y ejecuta selección, confirmación, feedback y puntaje sin conocer qué materia lo consume.
- **Cada canal** proporciona sus preguntas, título y callbacks; decide navegación y qué hacer con el resultado. No copia el motor ni agrega condicionales por materia dentro de Core.
- La demo de cultura general es un consumidor aislado en `tests/quiz/QuizDemo.tsx`, no una ruta ni la estructura definitiva de canales. Sus preguntas están en `tests/quiz/fixtures.ts`. El ejemplo de Biología siguiente usa exactamente el mismo contrato, pero cada materia proporciona sus datos reales.
- La presentación Core reutiliza el tema y componentes generales existentes. No importa rutas ni módulos particulares de materias.

| Contrato | Campos |
|---|---|
| `Option` | `id: string`, `text: string` |
| `Question` | `id`, `text`, `options: readonly Option[]`, `correctOptionId`, `explanation` |
| `QuizAnswer` | `questionId`, `optionId`, `isCorrect: boolean` |
| `QuizResult` | `totalQuestions`, `correctAnswers`, `score: number`, `answers: readonly QuizAnswer[]` |

`score` es un porcentaje entero redondeado (por ejemplo, 2/3 → 67), no un decimal de 0 a 1. Cero preguntas produce cero puntos y cero respuestas.

`QuizEngine` recibe `questions: readonly Question[]`, `title?: string`, `onAnswer?: (answer: QuizAnswer) => void` y `onComplete?: (result: QuizResult) => void`. Los callbacks son notificaciones síncronas; no representan persistencia ni deben lanzar errores.

`FeedbackModal` recibe `visible: boolean`, `isCorrect: boolean`, `explanation: string` y `onContinue: () => void`. Su responsabilidad es mostrar el feedback y solicitar continuar, nunca calcular resultados.

## Proporcionar preguntas

Usar IDs estables: únicos para preguntas en el cuestionario y para opciones dentro de cada pregunta. Se pueden repetir IDs de opciones en preguntas distintas. `correctOptionId` debe existir entre las opciones de esa pregunta. No se revela visualmente antes de confirmar, pero estos datos locales no son un mecanismo antitrampas.

La entrada tipada se valida al crear el intento: IDs, enunciados, explicaciones y textos de opciones no vacíos; al menos dos opciones; sin IDs duplicados; clave correcta existente. Una configuración inválida lanza un error descriptivo, no se omite silenciosamente. Validar contenido antes de publicarlo. No es un parser de JSON remoto.

Las preguntas se copian al montar: mutar los datos externos o reconstruir un array en un render no altera el intento. Para cambiar de materia o reiniciar, remontar `QuizEngine` con una `key` distinta.

## Ejemplo: integración en Biología

Este componente usa exports reales y el mismo motor que la demo de cultura general. Colocarlo en una pantalla de la materia; no se necesita servicio ni adaptador remoto:

```tsx
import { QuizEngine, type Question, type QuizResult } from '@/core/quiz';

const biologyQuestions = [
  {
    id: 'bio-celula-1',
    text: '¿Qué orgánulo produce la mayor parte del ATP celular?',
    options: [
      { id: 'mitocondria', text: 'La mitocondria' },
      { id: 'nucleo', text: 'El núcleo' },
    ],
    correctOptionId: 'mitocondria',
    explanation: 'La respiración celular en las mitocondrias produce ATP.',
  },
] satisfies readonly Question[];

function receiveResult(result: QuizResult) {
  // Consumir el resultado local sin volver a calcular el puntaje.
  console.info(`Biología: ${result.score}% (${result.correctAnswers}/${result.totalQuestions})`);
  console.info(result.answers);
}

export default function BiologyQuiz() {
  return (
    <QuizEngine
      key="biologia-intento-1"
      title="Biología celular"
      questions={biologyQuestions}
      onComplete={receiveResult}
    />
  );
}
```

`onAnswer` permite observar cada respuesta confirmada por sus IDs. `onComplete` entrega el resultado final tras continuar desde el último feedback; también se notifica en un cuestionario vacío. El motor muestra el resultado aunque no se proporcionen callbacks. Cambiar la `key` crea un intento nuevo, no recupera uno anterior.

## Ejecutar las pruebas

Desde `mobile/`, con dependencias instaladas mediante `npm ci`:

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
# Solo núcleo:
npm test -- --runInBand tests/quiz/quiz-state.test.ts
# Un caso concreto:
npm test -- --runInBand tests/quiz/quiz-state.test.ts -t "empty"
```

No hay servicios ni variables de entorno requeridos. Jest usa el preset de Expo y solo descubre archivos de pruebas dentro de `tests/`; el único mock de estilos sustituye CSS en Node, sin sustituir la lógica de puntaje o transiciones. Los fixtures de `tests/quiz/fixtures.ts` tienen `empty`, `single`, `multiple`, `long` y `quizAnswerFixtures` con IDs para elecciones correctas/incorrectas. El caso largo conserva IDs y alarga enunciado/opciones. Core y canales de producción no deben importar material de pruebas; solo se permite su carga en el puente de preview protegido por `__DEV__`.

La antigua `/quiz` y su pestaña fueron retiradas. Para la prueba manual, ejecutar `npm run web` y pulsar **Cuestionario de pruebas** en Home; el preview tiene un aviso persistente de datos ficticios. No se muestra el acceso ni se carga el cuestionario en release. La guía [tests/README.md](../tests/README.md) describe la organización de pruebas.

También se puede usar la pestaña **Pruebas** o abrir `/pruebas` en el servidor de desarrollo (por ejemplo `http://localhost:8081/pruebas`). En release esa ruta redirige a Home; los datos ficticios no se cargan. Las verificaciones nuevas del aviso y guard están registradas al final de `plan.md`.

## Desarrollo guiado por especificación

1. Localizar el requisito CORE/QUIZ en `spec.md` y la tarjeta C2 correspondiente en `tasks.md`.
2. Si cambia el requisito, actualizar `spec.md`; si cambia la arquitectura o contrato, actualizar `design.md`. Acordar cambios incompatibles con el equipo y reflejarlos en las tareas antes de implementar.
3. Añadir una prueba que falle por ese comportamiento, no por un error de configuración; implementar el mínimo y ejecutar la prueba enfocada.
4. Probar selección → confirmación → feedback → continuación, incluidos eventos duplicados. El resultado debe derivar de las respuestas confirmadas.
5. Seguir el orden de `plan.md`, ejecutar verificaciones completas y registrar evidencia real allí antes de solicitar revisión. Actualizar estados en `tasks.md`, separando errores preexistentes y límites no verificados.

## Dependencias y límites del equipo

En este checkout no existen C2-02, C2-03, C2-12 o C2-13 ni contratos que permitan vincular cada módulo a Oliver Mérida, Jhaelin Alvarado o Esteban Medrano. La implementación local mínima verifica el flujo sin afirmar que sus entregas estén integradas. Cuando lleguen sus componentes, adaptar las vistas a los contratos acordados y conservar una sola fuente de verdad para confirmación y puntaje.

El glosario será otra herramienta transversal de Core, pero no hay implementación ni interfaz exportada que consumir. Su integración está pendiente: no se inventa `Glossary`, `GlossaryEntry` ni un servicio ficticio. Esta guía se ampliará con imports y props reales cuando exista ese módulo.

Las tarjetas de Trello no fueron accesibles desde el entorno; la especificación proviene de la solicitud proporcionada. No se modificaron tarjetas. Todas las entregas siguen pendientes de revisión de PR, incluso si las comprobaciones técnicas pasan.

## Evidencia histórica: implementación anterior al traslado a Core

Los comandos con la ubicación anterior registran lo que efectivamente se ejecutó entonces, no instrucciones vigentes. Las validaciones posteriores del traslado y aislamiento se registran en [plan.md](../../docs/specs/core/plan.md).

- **A, diagnóstico:** `npm ci --no-audit --no-fund` instaló 607 paquetes. Baseline `npx tsc --noEmit` falló por dos imports CSS sin declaración (`animated-icon.module.css`, `@/global.css`). Se añadieron declaraciones en `src/styles.d.ts`, sin cambiar estilos ni runtime.
- **A, lint:** la primera ejecución `CI=1 npm run lint` inició el bootstrap oficial, añadió ESLint/config Expo y generó `eslint.config.js`; esa ejecución acabó con `Cannot find module 'eslint'`. No se presenta como un lint aprobado.
- **B, contratos:** `npx tsc --ignoreConfig --noEmit --strict --skipLibCheck src/shared/features/quiz/types.ts src/shared/features/quiz/fixtures.ts` terminó con código 0.
- **E, núcleo:** ejecución enfocada `npm test -- --runInBand src/shared/features/quiz/quiz-state.test.ts`: 17 pruebas aprobadas. Incluye fixture de textos/opciones largos, vacío, 0/100, parcial 50 y redondeo 67, IDs inválidos, snapshot, bloqueo y conteos válidos hasta 30 preguntas.
- **TDD, limitación:** el núcleo inicial no tuvo evidencia de fallo previo a la implementación; no se afirma un ciclo rojo/verde completo. La ampliación del fixture sí produjo un fallo real por opciones demasiado cortas antes de corregirlo y volver a verde.
- **Dependencias:** se instaló tooling de pruebas con `npx expo install jest-expo jest @types/jest @testing-library/react-native --dev`. El auditor de instalación reportó 57 vulnerabilidades (7 altas); `npm audit --omit=dev --json` reportó 42 (7 altas, código 1), incluidas dependencias transitivas de Expo/Router. No se ejecutó `audit fix --force` ni se cambió de SDK. Requiere revisión separada del equipo; no confundir pruebas funcionales con una auditoría de seguridad aprobada.
- **C/D/E, validación final secuencial:** `npm run typecheck` → código 0; `npm test -- --runInBand` → 3 suites, **24/24 pruebas aprobadas**, 6,704 s. Las pruebas de UI incluyen feedback de error y resultado parcial, StrictMode, callbacks actualizados, snapshot y duplicados en el mismo `act`, además de callbacks retenidos de una pregunta anterior.
- **Lint final:** `npm run lint` → código 1 por un único error en el archivo preexistente y no modificado `src/hooks/use-color-scheme.web.ts:11` (`react-hooks/set-state-in-effect`). `npx eslint src/shared/features/quiz src/app/quiz.tsx src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx` → código 0. No se desactivaron reglas para ocultar errores propios.
- **Empaquetado:** `CI=1 npx expo export --platform web` → código 0; genera `/quiz`, `/`, `/explore` y rutas de Expo en `dist/` ignorado por Git. Esto no equivale a una prueba E2E en navegador o compilación de binarios móviles.
- **Ejemplo de esta guía:** comprobado con la API del compilador TypeScript, cargando el bloque TSX como archivo virtual junto a `tsconfig.json` y todos los archivos del proyecto → 0 diagnósticos, sin crear una ruta de ejemplo adicional.
- **Incidencia de ejecución:** la primera suite completa, ejecutada mientras Metro exportaba, excedió el timeout de 5 s en el primer caso UI. La repetición secuencial aprobó sin ampliar timeouts. También se corrigieron errores propios detectados de refs durante render, import `QuizState` y tuples readonly en tests; la validación final corresponde a esas correcciones.
- **TDD UI:** el primer intento falló por configuración CSS, no por comportamiento ausente; tampoco se afirma un ciclo rojo/verde inicial de los componentes.

## Estado por tarea y revisión

La matriz canónica tarea → requisito → archivo → prueba → dependencia vive en [tasks.md](../../docs/specs/core/tasks.md). La evidencia del traslado y aislamiento está en [plan.md](../../docs/specs/core/plan.md). No se duplican aquí estados que podrían quedar desactualizados. «Verificada localmente» no significa Done ni revisión de PR aprobada.

Matías debe revisar contratos/exportaciones, semántica de puntaje y cuestionario vacío, textos de ejemplo y transición del modal; ejecutar los comandos anteriores y probar teclado/VoiceOver/TalkBack y escalado en dispositivos. Acordar con Oliver, Jhaelin y Esteban los contratos faltantes antes de sustituir controles locales. No hay evidencia de revisión de PR ni pruebas E2E/dispositivo; no marcar tarjetas Done.
