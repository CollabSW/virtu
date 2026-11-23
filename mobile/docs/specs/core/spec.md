# Virtu Core 2 — especificación vigente

## Fuente y precedencia

El usuario aprobó implementar las siete tarjetas de Matías y sus dependencias mínimas siguiendo el árbol de la magíster y las descripciones vigentes del tablero https://trello.com/b/rAeH5rhS/calculo-virtu. Estas reglas sustituyen la reorganización anterior a `src/core/quiz/`. El ERS v1.0 y el borrador completo no fueron aportados: no se afirma cumplimiento integral de esos documentos.

Ampliación solicitada: completar las siete tarjetas propuestas para `jhaelin.alvarado` (C2-03/08/12/13/17/23/27). Reutilizar la base funcional y reforzar aceptación/fixtures/pruebas sin cambiar arquitectura ni volver a porcentajes. Estados remotos solo consultados; PR y QA manual siguen pendientes.

**Ampliación vigente posterior:** revisar y completar las **28 tarjetas** C2-01..28 del mismo tablero, respetando el árbol proporcionado. Las reglas del cuestionario no cambian. El glosario se verifica ahora contra todas sus tarjetas C2-04/09/14/18/19/24/28, no solo como dependencia de documentación. La matriz actual está al inicio de `tasks.md`; no se agregan funcionalidades de autenticación/BD/materias/panel docente sin tarjetas o contratos reales.

## Arquitectura obligatoria del alcance

```text
mobile/src/shared/features/
├── quiz/
│   ├── components/QuestionCard.tsx
│   ├── components/FeedbackModal.tsx
│   ├── screens/QuizScreen.tsx
│   ├── screens/ResultScreen.tsx
│   └── quizService.js (objetivo Sprint 2, sin implementación ficticia)
└── glossary/
    ├── screens/GlossaryScreen.tsx
    └── glossaryService.js
```

No agregar archivos auxiliares de producción para tipos, hooks, barrels o motores. No mantener implementaciones ni fachadas en `src/core/quiz/`. `Timer.tsx` pertenece al árbol completo pero su regla temporal no está definida en las tarjetas del alcance: queda pendiente de aclaración, no se inventa duración ni se registra tiempo de intento.

Las features compartidas reciben datos/callbacks; no importan materias ni rutas. Los equipos de materia proporcionan contenido y deciden navegación. Core 1/Backend deben revisar los contratos; esta ejecución no acredita ese acuerdo.

Configuración global en `src/config/theme.js`; navegación existente en `src/navigation/AppNavigator.tsx`, conservando `src/app/_layout.tsx` como puente obligatorio de Expo Router. Controles comunes implementados y consumidos en `src/shared/components/{Button,Card,Header,SearchBar}.tsx`; no deben conocer materias ni transiciones de cuestionario. Se mantienen adaptadores/efectos heredados del starter sin presentarlos como entregables faltantes del árbol. AuthNavigator, apiConfig, MathRenderer, servicios comunes, panel docente y materias permanecen pendientes, no se rellenan con archivos vacíos.

La validación, snapshot, transiciones y cálculo local pertenecen a `QuizScreen.tsx`. `quizService.js` tiene otra responsabilidad explícita: envío de notas y registro de intentos. No alojar allí una máquina de estado antes de tener el contrato de API. Un pull posterior de C2-02 incorporó `Timer.tsx` y `quizService.js` vacíos: se preservan como aportación del equipo, sin rellenarlos ni afirmar que implementan API/timer.

## Aceptación de cuestionario — Sprint 1

| ID / tarjeta | Regla obligatoria |
|---|---|
| C2-01 | Intento identificado por lección; exactamente cinco preguntas, cuatro opciones por pregunta, una correcta y explicación; contratos TypeScript en archivos del árbol |
| C2-05 | `QuizScreen` recibe datos por props sin dependencia de una materia; rechaza entradas inválidas con mensaje, sin caída ni intento completado |
| C2-10 | `FeedbackModal` muestra acierto/error inmediatamente tras confirmar y solución al fallar; no calcula nota |
| C2-15 | Selección única, confirmación irreversible y sin duplicados; respuesta/explicación no reveladas antes de confirmar; continuar avanza una pregunta |
| C2-20 | Resultado sobre cinco; aprobado solo con 4/5 o 5/5; pruebas de 0/5, 3/5, 4/5 y 5/5; resultados incompletos rechazados |
| C2-21 | Fixture válido 5×4 y textos extensos; cero/una pregunta son inválidos, nunca se califican como intentos válidos |
| C2-25 | Contratos internos de QuizScreen y GlossaryScreen documentados y probados con datos ficticios; publicación formal para seis materias pendiente de Sprint 2 |

IDs/textos no vacíos, preguntas/opciones sin IDs duplicados y clave correcta existente. Validar también formas malformadas de entrada para no confiar únicamente en anotaciones TypeScript. Snapshot de preguntas durante el intento; una `key` nueva inicia otro. Callbacks una vez por respuesta/intento, incluso con StrictMode, acciones duplicadas o handlers retenidos. No hay notificación de completado para entradas inválidas. Resultado permite revisar respuestas y soluciones de errores; el cálculo es único.

### Aceptación específica de Jhaelin

C2-03 exige mock separado por lección 5×4. C2-08: cambio de selección antes de confirmar y selección limpia en la siguiente pregunta, sin nota por seleccionar. C2-12: elección inmutable y confirmaciones deduplicadas. C2-13: **todos** los resultados 0/1/2/3/4/5; solo 4 y 5 aprueban, incompletos inválidos y sin duración. C2-17: respuestas preservadas al avanzar. C2-23: resultado a la vista real una vez, conservando feedback de la última respuesta. C2-27: evidencia de flujo válido y 5×4 malformado rechazado sin callbacks de respuesta/completado. Trazabilidad y dependencias completas en `tasks.md`.

## Dependencia mínima de glosario para C2-25

`glossaryService.js` consume datos del llamador y permite búsqueda textual multicampo sin distinguir mayúsculas ni fallar por opcionales. `GlossaryScreen.tsx` presenta lista, consulta limpiable, detalle según datos y estado sin resultados. Ejemplos de Cálculo (temática/título/definición/renderización), Historia (dato/fecha/personaje/línea temporal), Física (concepto/video), Inglés (vocabulario/audio/ejemplo), Biología (flashcard) y Química (propiedades de elemento). No limitar el modelo a term/definition. Reproducción multimedia y contenido final de materias no se inventan.

## Pruebas, entrega y límites

El dato ficticio de seis materias debe vivir fuera de UI/producción en `tests/glossary/`; los tests comprueban lista/detalle/búsqueda de cada materia, opcionales, consulta vacía y sin resultados. La consulta se limita a los campos textuales establecidos por C2-18. C2-26 requiere evidencia de Android desde 360 dp, cuerpo >=16 sp, contraste al menos 4,5:1 cuando corresponde y sin overflow horizontal. Unit tests, cálculo de contraste y viewport web aportan evidencia, pero no sustituyen un dispositivo/emulador Android.

Pruebas/fixtures/demo permanecen en `mobile/tests/`; solo el preview existente protegido por `__DEV__` puede cargarlos desde la app. Debe mostrar aviso de datos ficticios; release no carga el material. No nuevas rutas de demo ni archivos de pruebas obligatorios. No servicios externos ni variables de entorno para las pruebas locales.

Sprint 2: API de notas/registro de intentos en `quizService.js` y publicación/documentación definitiva de motores, según C2-02/25. No implementar llamadas simuladas, endpoints, autenticación, Backend o materias. Sprint 3 no verificable con las fuentes disponibles.

La Definition of Done requiere revisión de PR y prueba funcional; comprobaciones automáticas no sustituyen QA Android/accesibilidad, acuerdos Core 1/Backend ni aprobación del equipo. No modificar Trello, hacer commits o publicar desde esta ejecución. Ver [diseño](design.md), [tareas](tasks.md) y [plan/evidencia](plan.md).

---

## Especificación histórica sustituida

El texto siguiente registra las reglas anteriores (cantidad variable, porcentaje y `src/core/quiz/`); no debe usarse para implementar o aceptar las tarjetas vigentes.

Core es la capa de herramientas reutilizables que todas las materias pueden consumir en sus propios canales. No es el canal de Cálculo ni una colección de pantallas de una materia.

**Alcance actual:** Sprint 1, Core 2, tareas de Matías Morón C2-01/05/10/15/20/21/25. Fuente: requisitos proporcionados por el usuario y aclaración de que estas herramientas pertenecen a Core. Trello no fue accesible. Estado: implementación local; integración del equipo y revisión de PR pendientes.

## Documentos SDD

| Documento | Responsabilidad |
|---|---|
| Este `spec.md` | Qué debe cumplir Core y cómo aceptar su comportamiento |
| [design.md](design.md) | Límites, dependencias, contratos y decisiones de arquitectura |
| [tasks.md](tasks.md) | Tareas C2, criterios, pruebas y bloqueos verificables |
| [plan.md](plan.md) | Orden de ejecución, comandos y registro de validación |
| [Guía de consumo](../../../mobile/docs/quiz-engine.md) | Imports y ejemplo real para otra materia |

## Límites de Core

| ID | Requisito | Aceptación |
|---|---|---|
| CORE-01 | Las herramientas transversales viven en `mobile/src/core/`, no dentro de una materia | QuizEngine reside únicamente en `core/quiz`; no queda una copia de la implementación anterior |
| CORE-02 | Las materias consumen Core, nunca al revés | Core no importa rutas de `src/app` ni módulos de materias/canales; recibe datos y callbacks |
| CORE-03 | El contenido y la navegación de cada materia pertenecen al consumidor | Core no selecciona una materia ni crea rutas, consulta servicios o impone almacenamiento |
| CORE-04 | Compartir significa reutilizar contratos y ejecución, no copiar código | Los consumidores importan `@/core/quiz`; no implementan otro puntaje ni confirmación |
| CORE-05 | Pruebas, fixtures y cuestionario de muestra están aislados de las herramientas y canales de producción | Viven en `mobile/tests/quiz/`, nunca en Core; Jest solo descubre `tests/`. Única excepción: ruta puente protegida por `__DEV__` para abrir la demo desde Home, identificada como «Cuestionario de pruebas» y con aviso visible de datos ficticios; en release no carga la demo |

Core sigue dentro del único paquete `mobile/`. No se crea un workspace o paquete npm separado. Puede usar los componentes visuales, tema y hooks generales de la aplicación; no se afirma que su presentación React Native sea independiente del framework.

## Requisitos del cuestionario

| ID | Comportamiento obligatorio | Evidencia de aceptación |
|---|---|---|
| QUIZ-01 | Recibir preguntas tipadas con IDs estables, opciones, `correctOptionId` y explicación | Cinco preguntas de ejemplo y tipos públicos compilan |
| QUIZ-02 | Solo seleccionar opciones de la pregunta actual; no revelar corrección antes de confirmar | Explicación ausente antes de confirmar y selección válida probada |
| QUIZ-03 | Confirmar exige selección y registra una sola respuesta; después queda bloqueada | Confirmar repetidamente o cambiar selección en feedback no altera respuestas |
| QUIZ-04 | FeedbackModal distingue acierto/error, muestra explicación y exige continuar | Pruebas del modal; sin cálculo de puntaje ni cierre accidental por fondo |
| QUIZ-05 | Continuar avanza exactamente una pregunta; la última continuación finaliza | Duplicados en un mismo batch y acciones retenidas no saltan preguntas |
| QUIZ-06 | Resultados derivados de respuestas confirmadas; porcentaje entero entre 0 y 100 | Casos 0, parcial, 100; 2/3 → 67; cuestionario vacío → 0 |
| QUIZ-07 | `onAnswer` se notifica una vez por respuesta y `onComplete` una vez por intento | Incluye vacío, StrictMode y actualización de callbacks |
| QUIZ-08 | Mantener una instantánea de preguntas durante el intento | Cambiar/mutar el array externo no cambia el intento; una `key` nueva inicia otro |
| QUIZ-09 | Rechazar configuraciones inválidas descriptivamente | IDs vacíos/duplicados, textos/explicaciones vacíos, menos de dos opciones y clave inexistente |
| QUIZ-10 | Soportar datos vacíos, una/varias preguntas y textos/opciones largos | Fixtures reproducibles y recorridos correctos/incorrectos sin estados inconsistentes |
| QUIZ-11 | Mantener nombres/estados accesibles, foco del modal, scroll, escalado y temas | Pruebas de componentes y revisión manual pendiente en dispositivos; no confundir ambas |
| QUIZ-12 | No depender de API, base de datos o persistencia | Pruebas locales sin servicios ni variables de entorno |

La API de configuración es TypeScript, no un parser de JSON remoto ni un mecanismo antitrampas: la clave correcta existe en memoria local.

## Fuera de alcance y condiciones de entrega

- No implementar contenidos pedagógicos de cada canal, navegación de materias, autenticación, backend ni persistencia.
- El glosario es otra herramienta prevista de Core, pero no existe su implementación ni contrato en este checkout. No exportar componentes o tipos ficticios ni crear carpetas vacías como si estuviera integrado.
- C2-02/03/12/13 no están disponibles. El flujo usa controles y lógica mínimos locales, sin atribuirlos a Oliver Mérida, Jhaelin Alvarado o Esteban Medrano. Su integración real sigue pendiente.
- Una tarea técnicamente verificada sigue pendiente de revisión de PR. No marcar Done, publicar, hacer push ni modificar Trello sin autorización y evidencia.
