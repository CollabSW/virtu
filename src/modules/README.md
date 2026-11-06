# Módulos por materia

Cada carpeta contiene el módulo de una materia. La guía completa está en el [README principal](../../README.md).

- Cada equipo trabaja solo dentro de la carpeta de su materia.
- Los cambios en `src/shared`, `src/config` o `src/navigation` se coordinan con:
  - **Core 1:** estructura, login, roles, navegación y tema.
  - **Core 2:** cuestionarios y glosario.
- Los nombres de carpeta van en minúscula y sin tildes (por ejemplo, `biologia`, `calculo`).

## Organización de cada módulo

- `index.js`: exporta la pantalla principal, por ejemplo `HistoriaHomeScreen`.
- `screens/`: pantallas de la materia.
- `components/`: componentes propios de la materia.
- `services/`: llamadas a la API de la materia.

Más detalles en las secciones [Estructura del proyecto](../../README.md#7-estructura-del-proyecto) y [Reglas de trabajo entre equipos](../../README.md#8-reglas-de-trabajo-entre-equipos).
