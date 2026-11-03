# Virtu Core — especificación

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
