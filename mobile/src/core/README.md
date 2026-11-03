# Virtu Core

Herramientas reutilizables por los canales de **todas** las materias. El contenido pedagógico, la navegación y el consumo de resultados pertenecen a cada canal, no a Core.

- `quiz/`: QuizEngine, FeedbackModal, controlador y contratos; entrada pública `@/core/quiz`.
- Core no importa rutas de `src/app` ni módulos particulares de materias. Puede reutilizar componentes visuales, tema y hooks generales.
- El glosario está pendiente: no hay interfaz/implementación que consumir todavía.
- Este es un límite modular del paquete `mobile/`, no un workspace o paquete npm adicional.
- Pruebas, preguntas ficticias y demo están aisladas en `mobile/tests/quiz/`; no forman parte de Core. Solo una ruta puente protegida por `__DEV__` permite abrir el preview identificado como pruebas, sin cargarlo en release.

SDD: [spec](../../../docs/specs/core/spec.md), [diseño](../../../docs/specs/core/design.md), [tareas](../../../docs/specs/core/tasks.md), [plan](../../../docs/specs/core/plan.md). [Ejemplo de integración](../../docs/quiz-engine.md).
