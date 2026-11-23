# Virtu Core 2 — tareas y aceptación vigentes

## Revisión del tablero del 11 de noviembre de 2026

El [tablero Calculo Virtu](https://trello.com/b/rAeH5rhS/calculo-virtu) devuelve 29 tarjetas abiertas: 26 de Core 2 y tres de coordinación. Hay ocho en `to Do` (cinco técnicas), 21 en `review` y ninguna en `Done`. C2-03 y C2-17 se conservan abajo como referencias históricas: sus enlaces ya no fueron accesibles, pero el fixture por lección y el avance después del feedback siguen en el código y las pruebas.

- **C2-08, C2-12, C2-13, C2-23 y C2-27** siguen en `to Do` en Trello. El checkout ya incluye selección única, bloqueo irreversible, resultados de 0 a 5, aprobación desde 4/5 y un solo cierre después del último feedback. `QuizEngine.test.tsx` y `quiz-state.test.ts` cubren esos recorridos.
- **C2-10, C2-15 y C2-27**. El modal ahora muestra la alternativa correcta y la explicación tras un error. Una prueba verifica que la alternativa solo se revela tras confirmar.
- **C2-26**. El progreso, los identificadores de opciones y el texto de las preguntas en resultados usan 16 sp. El indicador de selección tiene contraste suficiente en ambos temas. La prueba en Android reveló que el desplazamiento de la pregunta anterior se conservaba al avanzar. Se corrigió y se verificaron las transiciones hasta resultados. Ver [evidencia y pendientes](plan.md#evidencia-de-la-revisión-del-11-de-noviembre-de-2026).
- **Core 1**. `develop` (`7a5ce1a`) y `leadCore1` (`7c87b37`) son ancestros de `core2`. El único conflicto del merge `6977654` fue el README, que documenta los dos puntos de entrada. La convergencia de la base JavaScript de la raíz y la app TypeScript de `mobile/` requiere un acuerdo de integración.
- **Comentarios en GitHub**. La tarjeta carece de descripción, checklist y referencias a issues. La búsqueda del repositorio no devolvió issues.

Los estados de Trello siguen sujetos a revisión de PR y a los acuerdos entre equipos.

Abreviaturas: **Q** = `src/shared/features/quiz/`, **G** = `src/shared/features/glossary/`. Tests aislados en `tests/`; contratos en `Q/screens/QuizScreen.tsx`, no nuevos tipos/hooks/barrels.

| ID / tarjeta | Responsable propuesto | Criterio / fuente de implementación y comprobación |
|---|---|---|
| [C2-01](https://trello.com/c/71nB1Lh5) | Matías | Contrato lección/5×4/una correcta; QuizScreen + TypeScript; acuerdo Core 1/Backend pendiente |
| [C2-02](https://trello.com/c/vGCZqJ7G) | Oliver | Seis nombres del árbol Q presentes; Timer/servicio vacíos del pull preservados; API explícitamente Sprint 2 |
| [C2-03](https://trello.com/c/4hQE17LS) | Jhaelin | Mock por lección 5×4, clave/explicación; `tests/quiz/fixtures.ts` |
| [C2-04](https://trello.com/c/LB6JXXqy) | Esteban | Modelo heterogéneo de seis materias en G/glossaryService y fixtures separados de UI |
| [C2-05](https://trello.com/c/TFuhybMe) | Matías | QuizScreen configurable, error seguro ante inválidos, sin dependencia de materias |
| [C2-06](https://trello.com/c/Sw78XAdU) | Oliver | QuestionCard con cuatro alternativas, texto/fórmulas largas y layout desde 360 dp |
| [C2-07](https://trello.com/c/WS6Le92m) | Oliver | Selección visual única y accesible mediante selectedOptionId |
| [C2-08](https://trello.com/c/qzEJsW14) | Jhaelin | Selección única, cambio previo a confirmar, reset al avanzar sin calificar selección |
| [C2-09](https://trello.com/c/19xR6iQU) | Esteban | GlossaryScreen: lista genérica/detalle según datos, sin pantallas de materia |
| [C2-10](https://trello.com/c/DmR0bhdF) | Matías | FeedbackModal: acierto/error, solución inmediata, sin cálculo de puntaje |
| [C2-11](https://trello.com/c/nHlhQTdX) | Oliver | Confirmar disabled sin selección; callback por acción, separado de pulsación de opción |
| [C2-12](https://trello.com/c/y1o7IgdP) | Jhaelin | Respuesta irreversible e inmutable, confirmación sin duplicados |
| [C2-13](https://trello.com/c/DomLsC2A) | Jhaelin | Aciertos 0..5, aprobado desde 4; incompletos no válidos; sin duración |
| [C2-14](https://trello.com/c/ehsGjomM) | Esteban | SearchBar compartido integrado: escribir/limpiar consulta |
| [C2-15](https://trello.com/c/txoixMb6) | Matías | Confirmación bloquea y abre feedback sin revelar antes la solución |
| [C2-16](https://trello.com/c/YKye2d7t) | Oliver | QuestionCard + botón + estado central integrados sin lógica duplicada |
| [C2-17](https://trello.com/c/rGVF6gdf) | Jhaelin | Avance tras feedback, respuestas preservadas, fin detectado |
| [C2-18](https://trello.com/c/cfJWP61c) | Esteban | Búsqueda sobre todos los campos textuales; ignore-case, vacía muestra todo, opcionales seguros |
| [C2-19](https://trello.com/c/ldfv6ZJk) | Esteban | Sin coincidencias: mensaje informativo y posibilidad de limpiar |
| [C2-20](https://trello.com/c/QuvXXLVG) | Matías | Tests de score/aprobación/bloqueo/duplicados, sin duración |
| [C2-21](https://trello.com/c/ST0UMVPK) | Matías | Fixture válido 5×4/largo, 0/1 preguntas únicamente como rechazo seguro |
| [C2-22](https://trello.com/c/TvouJtJP) | Oliver | ResultScreen: aciertos/aprobación/revisión y soluciones erróneas, sin recalcular |
| [C2-23](https://trello.com/c/CchJ1wIg) | Jhaelin | Resultado correcto a vista real, fin una vez preservando último feedback |
| [C2-24](https://trello.com/c/WRT9aqUc) | Esteban | Detalle de seis materias según campos propios; no limitar a term/definition |
| [C2-25](https://trello.com/c/jIilr05m) | Matías | Guía de contratos/rutas/pruebas locales; publicación formal Sprint 2 explícitamente pendiente |
| [C2-26](https://trello.com/c/kklid2r8) | Oliver | QA Android 360 dp, cuerpo >=16 sp, contraste 4.5:1 y sin overflow; no confundir renderer/web con Android |
| [C2-27](https://trello.com/c/5u9BrjLf) | Jhaelin | Flujo válido completo y rechazo seguro, sin API |
| [C2-28](https://trello.com/c/LdKEuye4) | Esteban | Flujo lista/detalle/búsqueda seis materias, ignore-case/vacío/opcionales |

### Comprobaciones y pendientes

- [x] Fixtures y pruebas de búsqueda textual por campo, materia, opcionales y lista vacía.
- [x] Datos ficticios en `tests/glossary/fixtures.ts`, consumidos por el preview con aviso y guard de desarrollo.
- [x] Pruebas de GlossaryScreen para las seis materias y de QuestionCard para texto largo, cuatro opciones y confirmación.
- [x] Colores del texto verde corregidos en ambos temas y cubiertos por `QuestionCard.test.tsx`.
- [x] Hidratación web y cambio de tema cubiertos por `tests/hooks/use-color-scheme.web.test.tsx`.
- [x] Recorrer la demo del cuestionario en Android a 360 dp con texto largo, feedback, avance y resultados.
- [ ] Revisar C2-26 con TalkBack y en un dispositivo físico.

Los directorios `modules/`, panel docente, servicios de sesión/progreso/BD y archivos AuthNavigator/apiConfig/MathRenderer son ubicaciones del árbol general, **no tarjetas adicionales** del tablero consultado. No se crean implementaciones ficticias ni conexiones MySQL directas desde móvil. Si sus contratos se incorporan en tarjetas de otro sprint, deberán revisarse antes de implementarlos.

---

## Jhaelin Alvarado — alcance solicitado ahora

Fuente: consulta autenticada del tablero https://trello.com/b/rAeH5rhS/calculo-virtu y de las siete tarjetas completas. Miembro `jhaelinalvarado`, nombre `jhaelin.alvarado`; responsabilidad **propuesta** en descripción, sin asignación formal. Snapshot inicial: C2-03 en `review`, las otras seis en `In progress`, todas `complete: false`, sin comentarios/checklists. No se cambia Trello ni se afirma revisión de PR.

| Tarjeta | Criterio y evidencia requerida | Dependencias locales | Estado local |
|---|---|---|---|
| [C2-03](https://trello.com/c/4hQE17LS) | Mock por lección, cinco preguntas/cuatro opciones, clave y explicación | C2-01: tipos reales disponibles | Verificada localmente: `lessonQuizFixture` en `tests/quiz/fixtures.ts`, consumido por ambas suites |
| [C2-08](https://trello.com/c/qzEJsW14) | Selección única y limpia al avanzar; no calificar al seleccionar | C2-01/03 | Verificada: pruebas puras y UI A→B, una selección marcada, sin onAnswer hasta confirmar y siguiente pregunta limpia |
| [C2-12](https://trello.com/c/y1o7IgdP) | Confirmación irreversible y eventos deduplicados | C2-08 | Verificada: referencias congeladas, guards, eventos repetidos y selección posterior sin editar respuesta |
| [C2-13](https://trello.com/c/DomLsC2A) | Todos los aciertos 0..5, aprobado desde 4, incompletos rechazados, sin duración | C2-01/12 | Verificada: seis casos puros y seis recorridos UI, aprobado false/false/false/false/true/true |
| [C2-17](https://trello.com/c/rGVF6gdf) | Avanzar solo tras feedback, preservar respuestas y detectar última | C2-12/15 integradas | Verificada: guard antes de confirmar, reset/preservación y progreso ordenado 1..5 |
| [C2-23](https://trello.com/c/CchJ1wIg) | Resultado real a ResultScreen y fin único | C2-13/17/22 disponibles | Verificada: payload completo/ordenado, resultado real, fin único y última explicación antes de continuar |
| [C2-27](https://trello.com/c/5u9BrjLf) | Flujo válido real y 5×4 malformado sin completado/calificación; sin API | C2-15/16/20/23 disponibles | Verificada por integración automatizada; suite global 37/37, QA manual y PR pendientes |

Implementación en `src/shared/features/quiz/`; pruebas/fixtures en `tests/quiz/`. Se conservan las dependencias funcionales existentes, sin atribuir autoría nueva ni PR aprobada a otro integrante. Conclusión/comandos nuevos en [plan.md](plan.md).

Las siete están técnicamente verificadas en este checkout, **no Done**: ninguna aprobación de PR, QA de dispositivo o acuerdo formal del equipo se deriva de estas pruebas. Se añadieron once casos netos (26→37) y se corrigió el import de Jest; no fue necesario cambiar producción. No se movieron tarjetas ni se publicaron comentarios, commits o push.

## Registro anterior de tareas de Matías

Fuente: árbol del usuario y consulta anterior de 28 tarjetas. Las siete siguientes dicen «Responsable propuesto: matias Moron»; estaban en `to Do` al consultarlas entonces. Sus listas remotas han cambiado después; no usar este registro como snapshot actual. Usuario aprobó esas siete y sus dependencias mínimas.

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
