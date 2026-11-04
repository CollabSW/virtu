# Virtu Core 2 — tareas y aceptación vigentes

Fuente vigente: árbol compartido por el usuario y lectura autenticada de las 28 tarjetas del tablero https://trello.com/b/rAeH5rhS/calculo-virtu. Las siete siguientes dicen «Responsable propuesto: matias Moron», sin miembros asignados, en lista `to Do`, `complete: false` al consultarlas. No se modifica Trello ni se afirma aprobación de PR. Usuario aprobó implementar estas siete y sus dependencias mínimas.

Rutas relativas a `mobile/src/shared/features/`:

| Tarjeta | Entregable verificable | Dependencias Trello | Estado de esta ejecución |
|---|---|---|---|
| [C2-01](https://trello.com/c/71nB1Lh5) | Contratos TS de intento por lección, 5 preguntas de 4 opciones; tipos en `quiz/screens/QuizScreen.tsx` | Acuerdo Core 1/Backend | Verificada localmente; acuerdo externo y PR pendientes |
| [C2-05](https://trello.com/c/TFuhybMe) | `quiz/screens/QuizScreen.tsx` recibe datos por props; inválidos sin caída ni completado | C2-01/02/03 | Verificada localmente; aceptación del equipo y PR pendientes |
| [C2-10](https://trello.com/c/DmR0bhdF) | `quiz/components/FeedbackModal.tsx`, corrección/solución y continuación sin cálculo de nota | C2-01/02 | Verificada localmente; QA dispositivo y PR pendientes |
| [C2-15](https://trello.com/c/txoixMb6) | Confirmación irreversible, feedback inmediato, no revelación previa | C2-10/12/13 | Verificada localmente; aceptación del equipo y PR pendientes |
| [C2-20](https://trello.com/c/QuvXXLVG) | Pruebas 0/5, 3/5, 4/5 y 5/5; aprobado solo >=4; duplicados sin efecto | C2-12/13 | Verificada localmente; revisión de PR pendiente |
| [C2-21](https://trello.com/c/ST0UMVPK) | Fixture válido 5×4; 0/1 preguntas se rechazan; textos extensos | C2-01/05 | Verificada localmente; revisión de contenido/PR pendiente |
| [C2-25](https://trello.com/c/jIilr05m) | Contratos internos de QuizScreen y GlossaryScreen, prueba local; publicación Sprint 2 pendiente | C2-05/16/23/24 | Contratos/ejemplo verificados localmente; revisión y publicación formal pendientes |

Se implementan dependencias locales necesarias sin atribuir su autoría ni aprobación a otros miembros: QuestionCard, resultado/revisión, selección/bloqueo/cálculo y contrato mínimo heterogéneo del glosario. No se afirma que ello cierre las tarjetas propuestas para Oliver, Jhaelin o Esteban.

## Pendientes que el código no puede cerrar

- Acordar contratos con Core 1/Backend y validar reparto del trabajo con los demás integrantes.
- Revisión de PR y QA Android desde 360 dp, textos 16 sp, contraste y VoiceOver/TalkBack/teclado. Pruebas Node/export no son QA de dispositivo.
- Timer: regla temporal pendiente; no registrar duración de intento según C2-13/20.
- Sprint 2: implementar API de notas/intentos en `quizService.js`; publicación/documentación definitiva de ambos motores para las seis materias (C2-02/25).
- Sprint 3 y cumplimiento completo del ERS v1.0: no verificables sin documentación adicional.
- No declarar Done por resultados históricos. Evidencia nueva en [plan.md](plan.md).

---

## Registro histórico sustituido

Las marcas y estados siguientes describen entregas bajo criterios anteriores; no acreditan las tarjetas vigentes (5×4, aprobación 4/5 y árbol original).

Referencias: [spec](spec.md), [diseño](design.md), [plan](plan.md). Archivos de implementación relativos a `mobile/src/core/quiz/`, salvo ruta completa.

**Estados:** «verificada localmente» no equivale a PR aprobada/Done. C2-05 y C2-15 siguen parciales por dependencias del equipo ausentes. Las autorías de C2-02/03/12/13 no pueden deducirse del checkout.

## Trazabilidad Sprint 1, Core 2 — Matías Morón

| ID / tarjeta | Requisitos | Archivos | Aceptación y pruebas | Estado / dependencia |
|---|---|---|---|---|
| [C2-01](https://trello.com/c/71nB1Lh5) | QUIZ-01 | `types.ts`, `index.ts`, `mobile/tests/quiz/fixtures.ts` | Contratos exportados, IDs estables y cinco preguntas aisladas; `npm run typecheck` | Verificada tras aislamiento; revisión de contratos/PR pendiente |
| [C2-05](https://trello.com/c/TFuhybMe) | CORE-02/03/04; QUIZ-08/12 | `QuizEngine.tsx`, `use-quiz.ts`, `quiz-state.ts` | Props locales, separación de lógica, vacío y snapshot: `QuizEngine.test.tsx` | Parcial: faltan C2-02/03; C2-01 disponible |
| [C2-10](https://trello.com/c/DmR0bhdF) | QUIZ-04/11 | `FeedbackModal.tsx`, `mobile/tests/quiz/FeedbackModal.test.tsx` | Acierto/error y explicación, acción única, ocultación/reapertura y handler retenido | Verificada tras aislamiento; QA manual accesible y PR pendientes |
| [C2-15](https://trello.com/c/txoixMb6) | QUIZ-02/03/05/07 | `use-quiz.ts`, `QuizEngine.tsx`, `mobile/tests/quiz/QuizEngine.test.tsx` | No revelar antes; selección bloqueada; duplicados en mismo `act`; callbacks actualizados; StrictMode; resultado parcial | Parcial: C2-10 local disponible; faltan C2-12/13 reales |
| [C2-20](https://trello.com/c/QuvXXLVG) | QUIZ-03/06/09 | `mobile/tests/quiz/quiz-state.test.ts` y suites UI en esa carpeta | 0/parcial/100, vacío, 2/3→67, rango, confirmación repetida, configuración inválida; cálculo único | Verificada tras aislamiento; revisión de PR pendiente |
| [C2-21](https://trello.com/c/ST0UMVPK) | QUIZ-10 | `mobile/tests/quiz/fixtures.ts`, `mobile/tests/quiz/quiz-state.test.ts` | `empty/single/multiple/long`, opciones largas y elecciones correctas/incorrectas reproducibles | Verificada tras aislamiento; revisión de contenido/PR pendiente |
| [C2-25](https://trello.com/c/jIilr05m) | CORE-04; contratos/guía | `mobile/docs/quiz-engine.md`, documentos SDD y READMEs | Ejemplo Biología con exports reales, consumo del resultado, comandos, limitaciones y glosario ausente explícito | Verificada localmente con imports Core; revisión documental/PR pendiente |

## Ajuste arquitectónico solicitado: Core diferenciado

Este ajuste no agrega tarjetas ni amplía las siete tareas originales.

- [x] **CORE-M01 — ubicación única:** trasladar íntegro el módulo a `mobile/src/core/quiz/`; no copiar ni dejar shims. Verificados 10 archivos y ausencia de implementación en la ruta antigua.
- [x] **CORE-M02 — consumo por canales:** imports de la demo a `@/core/quiz` y `@/core/quiz/fixtures`. Contratos preservados; TypeScript y 24 pruebas aprobados.
- [x] **CORE-M03 — separación:** inspeccionados imports: Core no importa `src/app` ni módulos de materias. Solo dependencias internas y componentes/tema/hooks generales permitidos.
- [x] **CORE-M04 — SDD coherente:** spec/diseño/tareas/plan canónicos; guía, ejemplos y referencias actualizados. 37 enlaces relativos verificados; evidencia histórica identificada.
- [x] **CORE-M05 — regresión:** suite completa, TypeScript, lint enfocado, export web y ejemplo de la guía aprobados. Resultados en [plan.md](plan.md); lint global preexistente sigue pendiente.

## Aislamiento inicial de pruebas — CORE-05

Registro del aislamiento verificado. La solicitud posterior de preview visible en desarrollo agrega la excepción siguiente, sin devolver fixtures o tests a Core.

- [x] **TEST-M01:** suites y fixtures en `mobile/tests/quiz/`; motor sin cambios, sin copias de material de prueba en `src/core/quiz/`.
- [x] **TEST-M02:** componente de muestra en `tests/quiz/QuizDemo.tsx`; ruta `/quiz`, enlace Home y triggers retirados. No hay ruta alternativa de muestra en producción.
- [x] **TEST-M03:** Jest e imports actualizados; `--listTests` descubre solo tres suites en `tests/quiz/`; `src/` no importa tests/fixtures.
- [x] **TEST-M04:** TypeScript, 24 pruebas y lint enfocado aprobados; export web sin `/quiz`; guía y comandos actualizados. Evidencia en `plan.md`.

### Preview identificado como pruebas

- [x] Acceso desde Home y pestaña «Pruebas» solo con `__DEV__`; ruta `/pruebas` con aviso persistente de datos ficticios/no canal real. La ruta puente es la única excepción de carga de `tests/` desde `src/`; en release redirige a Home sin cargar la demo. Aviso/guard probados, 26 pruebas aprobadas, TypeScript y lint enfocado aprobados; export release sin IDs de fixtures ni aviso de demo en JS/HTML.

## Pendientes externos (no entregados)

- [ ] Acordar con Oliver Mérida, Jhaelin Alvarado y Esteban Medrano contratos y propiedad de las piezas faltantes C2-02/03/12/13; integrar cuando existan, sin duplicar confirmación/puntaje.
- [ ] Recibir implementación/interfaz real del glosario antes de documentar su consumo.
- [ ] QA manual en canales de materias, dispositivos, teclado y VoiceOver/TalkBack.
- [ ] Resolver o aceptar separadamente el error preexistente de lint y revisar vulnerabilidades del árbol de dependencias.
- [ ] Revisión de PR por el equipo. No mover tarjetas a Done desde esta ejecución.
