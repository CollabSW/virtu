# Cálculo · T01, T08, T11 y T14

Verificación en `codex/calculo-integracion`, 20 de noviembre de 2026. La rama parte de `develop`, recupera el núcleo móvil de Core 2 y adapta el flujo y almacenamiento de Core 1 al contrato de Cálculo. [Swagger oficial](https://backend-virtu.onrender.com/docs/).

| Ticket | Dependencias y evidencia |
| --- | --- |
| [T01](https://trello.com/c/N2JZcEMV) | Core 1 aportó la URL y la base de autenticación. El cliente de `mobile/` usa el contrato publicado: login devuelve `data.token` y `data.usuario`, y `/auth/me` devuelve el usuario en `data`. Login y `/auth/me` dieron 200 para las cuentas de prueba de ambos roles. `/auth/me` sin Bearer respondió 401. Falta probar en Android el reinicio y la expiración durante una sesión real. |
| [T08](https://trello.com/c/gmHjhpeG) | Bloqueo externo a cargo de la docente responsable del backend. El GET autenticado de Cálculo devolvió la unidad «Derivadas y Razón de Cambio» y la lección «La Regla de la Cadena» con `tieneCuestionario: false` y `cuestionarioId: null`. Swagger muestra el ID 1 como ejemplo de Historia. |
| [T11](https://trello.com/c/5XJTCx6j) | Progreso e historial usan respuestas oficiales. La vista vuelve a consultar al recuperar el foco y permite actualizar manualmente. Swagger publica `GET /cuestionarios/{id}/historial`. La verificación del cambio de estado tras acciones reales depende de T03 y T05. El historial real de Cálculo depende de T08. |
| [T14](https://trello.com/c/VPhLhc4q) | Pendientes T08–T13 y revisión de rama estable. El perfil EAS `preview` está preparado para un APK. La identidad de Android en `app.json` sigue siendo la provisional del proyecto. |

Para desbloquear T08, el equipo de backend debe indicar el entorno de pruebas y asignar allí un cuestionario a una lección de Cálculo. Cargar cinco preguntas con cuatro opciones, una correcta y su explicación. Entregar el ID mediante `GET /contenidos/calculo`. Con T04 y T05 integrados, ejecutar un intento 4/5 con el alumno de prueba y comprobar resultado, historial y estado actualizado. No se enviaron mutaciones a la API en esta revisión.

Para entregar T14, validar las dependencias anteriores y confirmar con el equipo el identificador Android y el proyecto de Expo. Desde `mobile/`, ejecutar `npx eas-cli@latest build --platform android --profile preview`. Instalar el APK desde cero en Android 12 o superior, probar los recorridos de ambos roles y mantener una sesión durante 30 minutos. Registrar versión, entorno y enlace del artefacto.

Validación local desde `mobile/`: `npm run lint`, `npm run typecheck` y `npm test -- --runInBand --testTimeout=15000` (89 pruebas aprobadas). Las pruebas de Cálculo comprueban el contrato de autenticación, la limpieza de sesión por 401 y la actualización de estado e historial con respuestas simuladas del servidor.
