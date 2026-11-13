# Evidencia de la revisión del 11 de noviembre de 2026

- [Matriz de tarjetas](tasks.md). Se cotejaron las 26 tarjetas técnicas accesibles y las tres de coordinación. C2-03 y C2-17 ya no se pudieron abrir en Trello. Sus comportamientos siguen cubiertos localmente.
- Android 15, emulador `Medium_Phone`, Expo Go 57.0.9. Se probó `/pruebas` con 1080 px a 480 dpi (360 dp), escala de fuente 1.0. La pregunta y las alternativas extensas se ajustaron al ancho y se recorrieron por desplazamiento vertical.
- Se eligió una alternativa incorrecta en el caso largo. El modal mostró el texto de la correcta y permitió continuar. Antes del ajuste, la segunda pregunta abría desplazada hasta las opciones. Después del ajuste se comprobaron los encabezados de las preguntas 2 a 5 al avanzar y el resultado `0 de 5`, con revisión desplazable.
- El texto de progreso, los identificadores de opción y las preguntas en resultados usan 16 sp. El contraste calculado del borde seleccionado frente a su fondo es 4,97:1 en claro y 7,57:1 en oscuro. Quedan pendientes TalkBack, dispositivo físico y revisión de PR.
- `npm run lint` y `npm run typecheck` pasaron desde `mobile/`. Jest pasó 68 pruebas en nueve suites después de cerrar Metro y el emulador. La primera ejecución con el emulador arrancando agotó el tiempo de una prueba. Para la verificación final se usó `--runInBand --no-cache --cacheDirectory node_modules/.cache/virtu-jest --testTimeout 30000`, con ajustes limitados a esa ejecución.

# Tablero completo Core 2 — planificación anterior

**Objetivo:** revisar C2-01..28 y completar pendientes reales en el árbol aprobado del usuario. [Spec](spec.md), [diseño](design.md), [matriz completa de tareas](tasks.md). No reemplazar trabajo funcional ni crear funcionalidades solo para llenar nombres del árbol.

## Diagnóstico nuevo

- 28 tarjetas Sprint 1/Core 2 consultadas completamente en https://trello.com/b/rAeH5rhS/calculo-virtu, sin páginas pendientes. El resto del árbol representa otros ámbitos sin contratos/tarjetas aquí.
- Base actual ya tiene QuizScreen, QuestionCard, feedback, resultados, glosario y 37 pruebas aprobadas en la ejecución inmediatamente anterior. Esos resultados no se reutilizarán como aprobación global de los cambios nuevos.
- Defecto confirmado por cálculo: texto pequeño #39866b sobre blanco 4,38:1, menor que 4,5:1; sobre negro 4,80:1. Falta evidencia completa de campos/flujo del glosario y QA 360.
- El servicio ya busca recursivamente strings/arrays; C2-18 exige campos **textuales**, no búsqueda numérica de atomicNumber ni objetos cíclicos fuera de contrato. No se implementan esos supuestos como defectos ficticios.
- Entorno: Chrome/Brave instalados; SDK Android y AVD `Medium_Phone` disponibles, sin dispositivos conectados inicialmente. Comprobar lo que pueda ejecutarse realmente, sin equiparar export web a Android.
- Preservar los nueve archivos locales modificados de la entrega anterior de Jhaelin. Timer/quizService vacíos son aportación del pull, sin duración/API especificada.

## Lanes y validación

- [ ] **Datos/glosario — fixer:** `tests/glossary/{fixtures.ts,glossaryService.test.ts}`. Reutilizar los seis datos del preview. Test por campo textual, optional, arrays, query vacía, empty entries y combinación subject/query. Servicio solo si falla un requisito real. Checks enfocados; no UI/docs.
- [ ] **UI — designer:** componentes/pantallas existentes aprobados, `tests/quiz/QuestionCard.test.tsx`, `tests/glossary/GlossaryScreen.test.tsx`, preview consume fixture aislado. Corregir contraste y solo overflow comprobado; validar seis detalles/limpieza/estados. No servicio, hook o tests ajenos.
- [ ] **Hidratación — fixer:** hook web existente y regresión aislada bajo `tests/hooks/`; conservar SSR claro y esquema cliente reactivo sin setState síncrono en effect ni desactivar lint. No cambios de navegación/tema.
- [ ] **Orquestador:** documentación, lectura/reconciliación de artefactos, evidencia de layout/dispositivo, suite completa única final, typecheck, lint y export release sin datos ficticios. Repetir solo checks afectados si surge un fallo.

Sin dependencias de producción nuevas, commits, push, despliegues ni modificaciones de Trello. Revisión de PR/acuerdos humanos pendientes aunque los checks técnicos aprueben. Timer/API formal/publicación de motores siguen las limitaciones explícitas de Sprint 2; no hay un ERS completo para certificarlo.

## Evidencia global nueva

Pendiente de terminar y reconciliar las tres lanes. No declarar C2-26 completa sin comprobación Android de 360 dp.

---

# Jhaelin — ejecución anterior sobre la base integrada

**Objetivo:** completar y verificar C2-03/08/12/13/17/23/27, propuestas para `jhaelin.alvarado` en Sprint 1/Core 2. Fuentes: [spec](spec.md), [tareas](tasks.md) y consulta autenticada del tablero https://trello.com/b/rAeH5rhS/calculo-virtu y de cada tarjeta.

**Arquitectura:** reutilizar contratos/lógica en `shared/features/quiz/screens/QuizScreen.tsx` y vistas existentes. Fixtures y pruebas únicamente en `tests/quiz/`. No nueva API, servicios, duración, archivos auxiliares de producción ni dependencias.

## Plan y responsables

- [x] Diagnóstico (orquestador/explorer): leer siete tarjetas completas y fuentes actuales. C2-03 está en `review`; C2-08/12/13/17/23/27 en `In progress`. Todas sin miembros formalmente asignados; responsabilidad propuesta en descripción. No comentarios/checklists adicionales.
- [x] Baseline (orquestador): árbol limpio en `core2`, HEAD `7dc8e77`; suite completa: 26/26 en 5 suites. Typecheck falla por `jest.fn` sin import de valor en `QuizDemo.test.tsx:9`; lint global solo por el hook web preexistente.
- [x] Corrección mínima (orquestador): importar `jest` desde `@jest/globals` en `QuizDemo.test.tsx`, sin cambiar su cobertura de glosario/controles.
- [x] Fixtures y caracterización (fixer): objeto por lección 5×4, resultados 0..5 y aprobado explícito; suites existentes reforzadas sin mocks del motor ni cálculo duplicado. Dos suites enfocadas aprobadas.
- [x] Reconciliación (orquestador): artefactos leídos; se eliminaron promesas de eventos sin await que causaban overlapping act, se tipó la tabla Jest y se reforzó selección UI A→B y repetición final de confirmación/continuación. No defectos de producción detectados ni RED conductual nuevo.
- [x] Validación final (orquestador): typecheck, lint global/enfocado, suite completa y export web secuenciales; release sin fixtures. Resultados nuevos abajo.
- [x] Entrega: tareas/guía actualizadas, base existente distinguida de cambios añadidos, PR/QA manual pendientes. Trello solo lectura; sin commits ni push.

## Foco de aceptación

- Puntajes 0/1/2/3/4/5: aprobado false/false/false/false/true/true; no porcentajes.
- Selección modificable antes de confirmar, limpia al avanzar; respuestas confirmadas congeladas y preservadas.
- Último feedback legible antes del resultado; fin único después de continuar, en coherencia con C2-17/27 además de C2-23.
- Duplicados en un mismo batch y handlers retenidos no responden ni finalizan dos veces.
- Datos inválidos, incluso 5×4 malformados, no generan resultados/callbacks; sin API ni tiempo de intento.

## Evidencia final de Jhaelin

| Comando / comprobación | Resultado nuevo |
|---|---|
| `npm run typecheck` | Código 0; resuelto el import de valor de Jest que fallaba en baseline |
| `npm run lint` | Código 1, solo `src/hooks/use-color-scheme.web.ts:11`, `react-hooks/set-state-in-effect`, preexistente y no modificado |
| `npx eslint tests/quiz/fixtures.ts tests/quiz/quiz-state.test.ts tests/quiz/QuizEngine.test.tsx tests/quiz/QuizDemo.test.tsx` | Código 0, sin warnings |
| `npm test -- --runInBand` | Código 0; **37/37 pruebas, 5 suites**, 9,577 s; sin warnings de act |
| `CI=1 npx expo export --platform web` | Código 0; conserva `/`, `/explore`, `/pruebas`, `/_sitemap`, `/+not-found` |
| JS/HTML de `dist/`: `lesson-mock`, `basics-1`, `long-question`, `SOLO PRUEBAS` | Sin coincidencias; fixtures/preview no entran en release |
| Revisión independiente de diff, criterios y calidad de aserciones | Sin defectos concretos/bloqueantes; no sustituye revisión de PR del equipo |

Cambios de código: `tests/quiz/fixtures.ts`, `quiz-state.test.ts`, `QuizEngine.test.tsx` y el import de Jest en `QuizDemo.test.tsx`. Once pruebas netas nuevas; las siete funcionalidades estaban en la base integrada y se conservaron. No se alteraron producción, `Timer.tsx`, `quizService.js`, glosario ni dependencias. No se cambia producción para aparentar una implementación nueva cuando la base ya cumple.

Estado: entrega local lista para revisión técnica de C2-03/08/12/13/17/23/27; no se afirma Done. Falta PR, QA móvil/manual y aceptación/acuerdos del equipo. Trello fue consultado, no modificado. Lint global continúa fallando por el baseline y el export no prueba ejecución E2E/dispositivos.

---

# Corrección anterior de responsabilidades y ubicaciones

El usuario solicitó aplicar la revisión arquitectónica posterior. Esta sección sustituye las decisiones incompatibles de las ejecuciones inferiores; no amplía el alcance a Backend, autenticación o materias ausentes.

## Corrección A — controlador del cuestionario (fixer)

- [x] Trasladar las funciones locales y QuizState de `quiz/quizService.js` al archivo aprobado `quiz/screens/QuizScreen.tsx`, con tipos TypeScript reales; no crear hooks/types/helpers adicionales ni cambiar comportamiento 5×4, inmutabilidad, guards y resultado.
- [x] Actualizar todos los imports reales de esas funciones en suites existentes. Verificar con regresión de arquitectura que `QuizScreen` no importa lógica local de `quizService.js` y la suite sigue comprobando comportamientos reales.
- [x] Retirar `quizService.js` de esta implementación local: el servicio de envío/registro permanece pendiente de Sprint 2 hasta tener contrato real de API. No dejar un archivo vacío ni fabricar endpoints o una persistencia falsa para llenar el árbol.
- [x] Checks enfocados: suites de lógica y QuizScreen y lint de los archivos propios. Orquestador ejecuta global una vez reconciliados escritores.

## Corrección B — configuración, navegación y UI común (designer)

- [x] Trasladar tema/colores/tipografías/constantes existentes a `src/config/theme.js` con JSDoc tipado; actualizar TODOS sus consumidores y retirar `src/constants/theme.ts`, sin fachadas duplicadas.
- [x] Concentrar los navegadores de pestañas nativo/web existentes en el único `src/navigation/AppNavigator.tsx`, preservando Expo Router, rutas, comportamiento por plataforma y preview __DEV__; actualizar `_layout.tsx` y retirar `app-tabs.tsx`/`app-tabs.web.tsx`. No inventar AuthNavigator sin autenticación.
- [x] Implementar y consumir los controles compartidos previstos que necesita el código existente: `shared/components/Button.tsx`, `Card.tsx`, `Header.tsx`, `SearchBar.tsx`. Cada uno conserva su responsabilidad visual general; QuestionCard conserva lo específico de preguntas y GlossaryScreen la búsqueda/estado de glosario. Reutilizar presentación/tema existentes, sin rediseñar ni crear MathRenderer ficticio.
- [x] Actualizar imports de tema en starter/preview sin mover utilidades del starter a archivos con responsabilidades distintas. Los adaptadores heredados themed-text/view y efectos del starter no se presentan como implementaciones de los archivos originales ausentes.
- [ ] Añadir comprobación runnable en suite UI existente para el control de búsqueda compartido y sus props/limpieza. Checks enfocados UI/lint; no cambiar QuizScreen.tsx, quizService.js ni suites propiedad de Corrección A mientras el fixer las trabaja.

## Corrección C — reconciliación y evidencia (orquestador)

- [x] Eliminar únicamente carpetas físicas vacías `src/core/quiz/` y `src/core/`, verificando antes que no contienen archivos.
- [ ] Actualizar instrucciones y documentación existente: diferenciar arquitectura objetivo de entregables realmente implementados; retirar la justificación equivocada de una máquina de estados en el servicio de envío.
- [ ] Revisar artefactos finales contra responsabilidades; ejecutar lint, typecheck, suite completa y export web secuencialmente. Verificar release sin datos ficticios y ausencia de imports viejos de core/constants/app-tabs.
- [ ] Registrar límites: resto de materias/Backend/config API/panel docente/Timer/AuthNavigator no implementados ni simulados; aceptación del equipo y QA manual pendientes.

## Registro de corrección

- Diseño de corrección aceptado mediante «aplica los cambios necesarios para que mantenga esa arquitectura». No nueva arquitectura ni archivos de producción fuera de los nombres aprobados.
- Fuentes: árbol del usuario, revisión de ubicación/responsabilidad y tarjetas Trello ya consultadas. Sin modificaciones de Trello, commits ni dependencias nuevas.
- Corrección A: artefacto leído por el orquestador; funciones locales y QuizState en QuizScreen, servicio eliminado sin callers externos. Implementador reporta RED arquitectónico (import del servicio antes de traslado), GREEN 20/20 en suites enfocadas y ESLint 0. Validación global pendiente hasta terminar Corrección B.
- Directorios core vacíos comprobados y eliminados con eliminación no recursiva que falla si hay contenido; no se borraron archivos de usuario.
- Corrección B: artefactos leídos; configuración y navegación trasladadas, controles comunes consumidos y CSS global importado desde _layout. Directorio constants vacío eliminado sin recursión; búsqueda en src sin imports de constants/theme, app-tabs, core/quiz ni quizService. Revisión independiente de responsabilidades/UI sin hallazgos; no incluyó ejecución de herramientas.
- Primera validación global de corrección: Jest 25/25, 5 suites; typecheck detectó dos defectos del nuevo Button (disabled anulable y pérdida de hovered en callback de estilo), enviados a corrección mecánica con regresión. Lint global mantiene únicamente el error conocido del hook web, sin modificar.

---

# Ejecución anterior — ubicación corregida parcialmente, responsabilidad de quizService sustituida

**Goal:** completar técnicamente C2-01/05/10/15/20/21/25 y sus dependencias mínimas según Trello y el árbol de la magíster.
**Architecture:** producción exclusivamente en los archivos aprobados de `src/shared/features/quiz/` y `src/shared/features/glossary/`; sin copia ni fachada en `src/core/quiz/`. Los motores reciben datos de las materias, no las importan.
**Tech Stack:** Expo 57, React Native 0.86, React 19, TypeScript 6, Jest Expo; sin dependencias nuevas.
**Spec:** diseño aprobado en la conversación; árbol proporcionado por el usuario y tarjetas vigentes de https://trello.com/b/rAeH5rhS/calculo-virtu. El ERS v1.0 no fue aportado.

## Restricciones vigentes

- Alcance elegido: Matías y dependencias necesarias, no todos los equipos ni todos los sprints.
- Exactamente cinco preguntas, cuatro opciones únicas por pregunta, una correcta, explicación no vacía y lección identificada.
- Resultado sobre cinco; aprobado solo con cuatro o cinco aciertos. Cero/una pregunta son entradas inválidas, nunca intentos completados.
- No crear archivos auxiliares de producción, mocks dentro de `src/`, endpoints, duración del intento, Backend ni módulos de materia ficticios.
- Preservar preview de pruebas protegido por `__DEV__`, componentes/tema existentes y cambios locales; no commits, push ni modificaciones Trello.
- Timer no se implementa sin regla de duración; API de notas/intentos y publicación formal quedan en Sprint 2, no se simulan.

## Contratos de coordinación

Tipos exportados desde `shared/features/quiz/screens/QuizScreen.tsx` (sin `types.ts`):
`Option { readonly id: string; readonly text: string }`;
`Question { readonly id: string; readonly text: string; readonly options: readonly Option[]; readonly correctOptionId: string; readonly explanation: string }`;
`QuizAnswer { readonly questionId: string; readonly optionId: string; readonly isCorrect: boolean }`;
`QuizResult { readonly lessonId: string; readonly totalQuestions: 5; readonly correctAnswers: number; readonly score: number; readonly passed: boolean; readonly answers: readonly QuizAnswer[] }`.
`score` significa aciertos sobre cinco, no porcentaje. `QuizScreen` recibe `lessonId`, `questions`, `title?`, `onAnswer?`, `onComplete?`; una `key` nueva inicia otro intento.

`quizService.js` implementa lógica local pura con JSDoc tipado: `createQuizState(lessonId, questions)`, `selectOption(state, optionId)`, `confirmAnswer(state)`, `continueQuiz(state)`, `getQuizResult(state)` y `calculateScore(correctAnswers, totalQuestions)`; preserva snapshot y bloqueos. Estado: `lessonId, questions, index, selectedOptionId, answers, phase`, fase answering/feedback/completed. Validación pura puede lanzar; pantalla captura y presenta error sin callbacks. `getQuizResult` rechaza intentos incompletos; score exige total 5. No llamadas de red ni persistencia local fingida.

`glossaryService.js`: contrato local JSDoc `GlossaryEntry { id, subject, title, definition?, topic?, rendering?, date?, character?, timeline?, concept?, videoUrl?, vocabulary?, audioUrl?, example?, front?, back?, symbol?, atomicNumber?, properties? }`; subject: historia/biologia/quimica/ingles/calculo/fisica. `filterGlossaryEntries(entries, query, subject?)` filtra campos textuales sin distinguir mayúsculas y tolera campos opcionales; `getGlossaryEntries(entries, subject?)` usa datos del consumidor, no red ni fixtures internos. `GlossaryScreen` recibe `entries`, `subject?`, `title?`; lista, búsqueda limpiable, selección/detalle y sin resultados. Audio/video son referencias textuales en este alcance, no reproductores inventados.

## Verificación prioritaria

- Inválidos de 0/1/4/6 preguntas, 3/5 opciones, IDs duplicados y datos malformados: rechazo sin callback de finalización ni caída de pantalla.
- 0/5, 3/5, 4/5, 5/5: score 0/3/4/5, passed false/false/true/true; resultado incompleto rechazado.
- Doble confirmación/continuación, handlers retenidos, StrictMode y actualización de callbacks: un evento por respuesta/intento.
- Snapshot frente a mutación externa; sin revelación antes de confirmar y revisión de soluciones al terminar.
- Glosario de seis materias, búsqueda multicampo/case-insensitive, opcionales, limpieza y cero coincidencias.

## Tarea 1 — lógica local y pruebas (fixer)

- [x] Modificar primero `tests/quiz/quiz-state.test.ts` para exigir 5×4, lección, score sobre cinco, aprobado, rechazo de incompletos e inmutabilidad; registrar fallo conductual contra la implementación anterior.
- [x] Crear SOLO `src/shared/features/quiz/quizService.js` y `src/shared/features/glossary/glossaryService.js` con los contratos anteriores; pruebas de glosario en la suite existente, sin añadir archivos de pruebas.
- [x] Adaptar imports de esa suite, ejecutar únicamente la suite enfocada y lint de sus archivos; informar RED/GREEN real, sin suite completa.

## Tarea 2 — presentación e integración (designer)

- [ ] RED UI inicial anterior a la migración: no se ejecutó; no se afirma TDD completo retroactivamente. Sí hubo RED/GREEN posterior de la regresión de handler retenido (dos respuestas en lugar de una antes del arreglo).
- [x] Crear SOLO QuestionCard.tsx, FeedbackModal.tsx en quiz/components y QuizScreen.tsx, ResultScreen.tsx en quiz/screens; reutilizar presentación/accesibilidad actuales y lógica de Tarea 1.
- [x] Crear SOLO glossary/screens/GlossaryScreen.tsx; datos representativos y demostración en `tests/quiz/QuizDemo.tsx`, nunca en producción. Conservar guard release.
- [x] Actualizar fixtures a cinco preguntas con cuatro opciones y lessonId en consumidor; adaptar suites existentes sin borrar cobertura de duplicados/StrictMode/snapshot.
- [x] Retirar seis archivos antiguos de `src/core/quiz/` y README obsoleto de Core una vez actualizados todos sus consumidores. No cambiar servicios ni suite propiedad de Tarea 1.
- [x] Ejecutar solo suites UI enfocadas y lint de sus archivos. Validación global a cargo del orquestador tras reconciliar ambas tareas.

## Tarea 3 — documentación y validación (orquestador)

- [x] Reconciliar spec/design/tasks, guía, READMEs e instrucciones existentes con arquitectura aprobada, contratos reales y límites Sprint 1/2; conservar evidencia previa marcada como histórica, nunca aprobación de Trello/PR.
- [x] Revisar artefactos y dependencias; buscar referencias activas a `@/core/quiz` y ausencia de archivos de producción fuera del árbol acordado.
- [x] Revisión independiente de cumplimiento/corrección/accesibilidad sobre el diff; corregir defectos confirmados en el mismo ámbito.
- [x] Ejecutar secuencialmente `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, y export web con CI. Si falla lint por el error preexistente, registrarlo separado y comprobar lint enfocado sin desactivar reglas.
- [x] Inspeccionar export release sin fixtures/aviso de demo y `git diff --check`; registrar resultados nuevos y límites de dispositivo/PR/acuerdo Core1-Backend.

## Registro de ejecución vigente

- Diseño aprobado por el usuario: Matías y dependencias necesarias; ejecutar sin nuevas rondas de aprobación.
- Baseline: rama `core2`, HEAD `fc03b81`; únicamente `AGENTS.md` modificado antes de implementar. Se preserva.
- Decisión: usar el árbol original para las features del alcance; no crear navegación/autenticación/materias ajenas para aparentar cumplimiento global.
- Tarea 1: artefactos leídos por el orquestador. El implementador reportó RED conductual (3/5 devolvía 60 en lugar de 3 y aceptaba total distinto de cinco); GREEN enfocado 10/10 y ESLint de servicios/suite código 0. Verificación global independiente pendiente hasta reconciliar UI.
- Revisión Tarea 1: arrays dispersos eludían validación por `map`; regresiones RED para preguntas/opciones dispersas y corrección con `Array.from`. Implementador reporta GREEN 12/12 y ESLint 0; revisión independiente de servicios completada sin hallazgos. Evidencia global del orquestador pendiente.
- Revisión Tarea 2: primera entrega perdió guards de handlers retenidos, cobertura de concurrencia, contraste oscuro y ejemplos heterogéneos completos. Se devolvió al mismo especialista con alcance de corrección concreto; no se acepta como entrega terminada todavía.
- Tarea 2 corregida: artefactos finales leídos; handlers vinculados a índice/fase, callbacks actualizados en layout effect, contraste oscuro restaurado y ejemplos heterogéneos de seis materias en tests. Revisión final independiente del diff/UI/accesibilidad sin hallazgos; no equivale a pruebas de dispositivo.

### Evidencia final nueva del orquestador

| Comando / inspección | Resultado |
|---|---|
| `npm run lint` | Código 1: únicamente `src/hooks/use-color-scheme.web.ts:11`, regla `react-hooks/set-state-in-effect`, preexistente y sin modificar |
| `npm run typecheck` | Código 0 |
| `npm test -- --runInBand` | Código 0; 5 suites, **24/24 pruebas**, 6,311 s |
| `npx eslint src/shared tests` | Código 0, sin warnings |
| `CI=1 npx expo export --platform web` | Código 0; `/`, `/explore`, `/pruebas`, `/_sitemap`, `/+not-found` |
| JS/HTML exportados: búsqueda de `basics-1`, `long-question`, `SOLO PRUEBAS`, `demo-cultura`, `historia-1`, `example.test` | Sin coincidencias; datos de preview excluidos de release |
| Ejemplo TSX vigente de la guía, archivo virtual mediante API TypeScript sin crearlo en disco | 0 diagnósticos |
| Búsqueda de imports antiguos en `mobile/src/` | Sin `@/core/quiz` ni `src/core/quiz` |
| `git diff --check` | Código 0; solo advertencias informativas LF/CRLF |

Resultado: entrega local verificada para el alcance aprobado; **lint global sigue fallando** por el error de baseline, no se desactivaron reglas ni se modificó ese hook. Sin commits, push, cambios en Trello, API ficticia o paquetes nuevos. Acuerdo Core 1/Backend, PR, QA móvil/manual, regla de Timer y ERS completo pendientes; las tarjetas no están Done. La exportación web no demuestra un binario Android/iOS ni ejecución E2E.

---

# Registro histórico — arquitectura anterior, sustituida por el plan anterior

Los comandos, imports y reglas de las secciones siguientes describen ejecuciones previas; no son la arquitectura ni los criterios vigentes.

**Objetivo:** diferenciar como Core las herramientas usadas por los canales de todas las materias, sin cambiar el comportamiento ya probado.
**Spec:** [spec.md](spec.md). **Arquitectura:** [design.md](design.md). **Aceptación/estados:** [tasks.md](tasks.md).
**Stack verificado:** único paquete `mobile/`; Expo 57, React 19.2.3, React Native 0.86.3, TypeScript 6; Jest con preset Expo. No nuevos paquetes ni servicios para esta reorganización.

## Restricciones

- Preservar cambios locales, starter y módulos de otros integrantes; no commits, push, despliegues ni modificaciones a Trello.
- Trasladar, no duplicar; API `@/core/quiz`. No crear workspace, paquete externo o glosario ficticio.
- Core recibe datos/callbacks; no depende de canales o rutas. Fixtures no representan contenido final de Cálculo.
- Mantener estado, confirmación y cálculo únicos. El cambio de ubicación no modifica contratos ni comportamiento visual.

## Orden y propietarios de validación

1. **Diagnóstico (orquestador):** leer Git, spec/guía y rutas actuales. Preservar el trabajo local y confirmar que solo hay un paquete.
2. **Traslado Core inicial (fixer):** inventariar archivos de `quiz`, moverlos a `src/core/quiz`, actualizar imports reales. Comprobar tipos y pruebas enfocadas; no editar documentación en paralelo. El aislamiento posterior de pruebas se registra al final.
3. **SDD (orquestador, en paralelo al traslado):** separar especificación, diseño, tareas y este plan. Actualizar guía, READMEs e instrucciones con imports y comandos vigentes; mantener identificada la evidencia histórica.
4. **Reconciliación (orquestador):** leer archivos producidos, buscar referencias activas obsoletas, inspeccionar dirección de dependencias y verificar que no quedan copias. Validar el ejemplo TSX de la guía.
5. **Regresión final (orquestador):** ejecutar checks secuencialmente; registrar salida real y cerrar solo las tareas verificadas. Conservar bloqueos ajenos y revisión de PR pendientes.

## Comandos reproducibles

Desde `mobile/`:

```sh
npm run typecheck
npm run lint
npx eslint src/core tests src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx
npm test -- --runInBand
npm test -- --runInBand tests/quiz/quiz-state.test.ts -t "empty"
npx expo export --platform web
```

No ejecutar Metro/export y la suite en paralelo: se observó un timeout al competir por CPU. El lint global tiene un error conocido en `src/hooks/use-color-scheme.web.ts:11`, no modificado; no desactivar reglas para ocultarlo. Los archivos tocados deben pasar lint enfocado.

## Evidencia anterior a la separación Core

- Fases originales A–F implementaron contratos, núcleo, componentes, demo, fixtures y guía: 24/24 pruebas en 3 suites; TypeScript y export web aprobados. C2-05/15 solo integradas localmente, no con las entregas del equipo ausentes.
- Se resolvieron declaraciones CSS, import de `QuizState`, tuples readonly y refs durante render; estos cambios forman parte del baseline que se preserva.
- Lint global: único error en `src/hooks/use-color-scheme.web.ts:11`. Lint de archivos cambiados aprobado. Ejemplo Biología compilado mediante archivo virtual TypeScript.
- No hubo RED conductual inicial de núcleo/UI; sí se observó en ampliación del fixture largo. No afirmar TDD completo retroactivamente.
- Auditoría histórica de instalación: 57 vulnerabilidades (7 altas); `npm audit --omit=dev --json`: 42 (7 altas), código 1. Sin `audit fix --force` ni cambio de SDK. No es una auditoría aprobada de seguridad.

## Evidencia histórica del ajuste Core, anterior al aislamiento de pruebas

Verificación nueva, ejecutada después del traslado y la actualización de imports; no reutiliza resultados históricos:

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | Código 0 |
| `npm run lint` | Código 1; solo `src/hooks/use-color-scheme.web.ts:11`, preexistente y no modificado |
| `npx eslint src/core src/app/quiz.tsx src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx` | Código 0 |
| `npm test -- --runInBand` | Código 0; 3 suites, **24/24 pruebas**, 5,032 s |
| `CI=1 npx expo export --platform web` (PowerShell: `$env:CI='1'`) | Código 0; `/quiz`, `/`, `/explore` y rutas Expo generadas |
| Ejemplo TSX de Biología, cargado como archivo virtual mediante API TypeScript junto con el proyecto | 0 diagnósticos con import `@/core/quiz` |
| Inventario/búsqueda e inspección de imports | 10 archivos en Core; ubicación anterior ausente; sin dependencia de rutas o materias |
| Enlaces Markdown locales en SDD, READMEs, guía e instrucciones | 37 enlaces resueltos; sin referencias activas a documentos retirados |

`CORE-M01` a `CORE-M05` verificados localmente. El traslado no añade funcionalidades ni dependencias. Siguen pendientes integración de C2-02/03/12/13, glosario real, QA de dispositivos y revisión de PR. La exportación web no demuestra ejecución E2E o compilación de binarios móviles.

## Aislamiento de pruebas — plan y evidencia

Fuente: requisito CORE-05 en [spec.md](spec.md). El usuario solicitó separar las pruebas de las herramientas de producción/desarrollo.

1. Trasladar las tres suites y `fixtures.ts` a `mobile/tests/quiz/`; conservar seis archivos de implementación en `src/core/quiz/`.
2. Trasladar la demo a `tests/quiz/QuizDemo.tsx` y retirar únicamente sus puntos de acceso de la aplicación. No cambiar selección, puntaje, feedback o contratos.
3. Ajustar `jest.config.js` para descubrir solo `tests/`; actualizar imports test → producción. Mantener TypeScript sobre ambos y dependencias de testing solo de desarrollo.
4. Reconciliar fuentes/documentación. Comprobar dependencia unidireccional, descubrimiento de suites, typecheck y pruebas completas; exportar web secuencialmente para confirmar que no existe `/quiz`.

Validación final nueva (posterior a mover archivos e imports):

| Comando / inspección | Resultado |
|---|---|
| `npm run typecheck` | Código 0; incluye fuente y pruebas aisladas |
| `npx eslint src/core tests src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx` | Código 0 |
| `npm test -- --runInBand` | Código 0; **24/24 pruebas**, 3 suites, 6,868 s |
| `npx jest --listTests --runInBand` | Solo las tres suites bajo `tests/quiz/` |
| `CI=1 npx expo export --platform web` | Código 0; solo `/`, `/explore`, `/_sitemap`, `/+not-found`; sin `/quiz` ni `dist/quiz.html` |
| Inventario e imports | Seis archivos de implementación en `src/core/quiz/`; tests, fixtures y demo fuera de `src/` |

En la comprobación enfocada del especialista hubo un timeout aislado inicial; su repetición y la suite global final aprobaron sin cambiar los límites de tiempo. No se modificó el comportamiento del motor ni se añadieron dependencias. El error global de lint preexistente y los pendientes externos siguen registrados; no se afirma que se hayan resuelto por mover las pruebas.

## Preview de desarrollo identificado como pruebas

Solicitud posterior del usuario: volver a mostrar el cuestionario de muestra, aclarando que es solo de pruebas. Mantener el aislamiento de archivos y agregar únicamente acceso desde Home y ruta puente protegidos por `__DEV__`, reutilizando `tests/quiz/QuizDemo.tsx`. Aviso persistente de datos ficticios/no canal real; release sin carga de demo.

Implementado: acceso Home y pestaña «Pruebas» nativa/web solo en desarrollo; `/pruebas` carga condicionalmente `tests/quiz/QuizDemo.tsx`. Banner fijo «SOLO PRUEBAS — datos ficticios. No corresponde a un canal real.»; release redirige a `/`. Core permanece sin cambios.

Validación nueva: suite completa `npm test -- --runInBand`, **26/26 pruebas en 5 suites**, 7,895 s; lint de archivos tocados aprobado; export web aprobado. Búsqueda sobre todos los JS/HTML de `dist/` sin `basics-1`, `long-question` ni `SOLO PRUEBAS`. `/pruebas` existe como ruta en release pero redirige y no incluye el cuestionario. Se corrigió el tipado de `globalThis.__DEV__` del test; `npm run typecheck` y prueba enfocada del guard posteriores aprobados. El test release falla si intenta cargar la demo, además de comprobar la redirección. No se afirma prueba E2E en navegador/dispositivo.

La excepción queda declarada en CORE-05, diseño, guía e instrucciones; no aplica a Core ni a canales de producción. Los demás pendientes externos no cambian.
