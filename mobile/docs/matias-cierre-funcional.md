# Cierre funcional de las tareas de Matías

Fecha: 21 de noviembre de 2026. Actualiza los informes anteriores. T14 y la generación del APK quedan expresamente aplazados por el usuario.

## Resultado por ticket

| Ticket | Implementación y evidencia | Límite de validación |
| --- | --- | --- |
| T01 | Login y `/auth/me` reales de ESTUDIANTE y DOCENTE; entrada directa por rol, logout y error de credenciales incorrectas comprobados en la interfaz web. Proveedor real de sesión probado para restauración de ambos roles, borrado al salir, token vencido y recuperación tras fallo de red. | SecureStore se simula en las pruebas automatizadas. Falta comprobar reinicio y logout en el teléfono; la automatización táctil fue bloqueada por MIUI. |
| T08 | Cuestionario 30001 de Cálculo, lección 2, cinco preguntas con cuatro opciones. Primer intento 90001 verificado por API y segundo intento completado desde la interfaz web: una respuesta incorrecta y cuatro correctas; nota oficial 5.8, aprobado y segundo intento vigente en historial. Sin reutilizar Historia. | La lección ya estaba estudiada. No se reinició ni alteró artificialmente el estado del alumno para simular una transición. Los criterios de datos y ejecución 4/5 están verificados. |
| T11 | Recorrido real web: inicio → lección → cuestionario → resultado → lección → unidades → historial. Se observó el intento 2, nota 5.8 y etiqueta Nota vigente; unidades y lección se consultaron de nuevo al volver. Prueba de integración adicional recorre las pantallas con servidor simulado y comprueba PENDIENTE → ESTUDIADO e historial. | La transición del servidor real desde PENDIENTE no se afirma. Falta repetir el recorrido en Android cuando se pueda interactuar con el teléfono. |
| T14 | Aplazado. No se ejecutó una nueva compilación ni se generó o instaló un APK durante esta revisión. | No se reclama instalación limpia ni prueba continua de 30 minutos. |

## Verificaciones realizadas

- `npm.cmd test -- --runInBand --testTimeout=15000`: **109 pruebas, 19 suites, aprobadas**, después de ajustar las versiones de Expo.
- `npm.cmd run lint`, `npm.cmd run typecheck` y `git diff --check`: aprobados.
- API real: login/perfil de ambos roles, contenido de Cálculo, historial y reporte docente de la lección. Sin token: 401; token inválido: 403 con mensaje reconocido por el cliente.
- Interfaz web en **360 × 800**: login por rol, curso vacío, estudiantes, reporte docente de Cálculo, glosario, lección, evaluación 5×4, retroalimentación, resultado, historial y logout.
- El reporte docente mostró cuatro aciertos, un desacierto y nota vigente 5.8. No se presentaron métricas globales de otras materias como exclusivas de Cálculo.
- Las radios quedaron deshabilitadas después de confirmar; la primera respuesta incorrecta mostró la solución enviada por el servidor. El temporizador de 300 segundos provino del backend.
- Se observó un fallo real de conexión al consultar progreso. El mensaje y el botón de reintento funcionaron; el reintento recuperó las unidades sin inventar estados.
- Login incorrecto: mensaje «Usuario o contraseña incorrectos», sin abrir pantallas protegidas. Logout de ambos roles devolvió al login.
- En las vistas medidas, `document.documentElement.scrollWidth === 360` con ventana de 360 px. No hubo desbordamiento horizontal del documento.
- No se encontraron claves de token, sesión o contraseña en localStorage/sessionStorage. En web la sesión permanece en memoria; la persistencia nativa utiliza SecureStore.

## Teléfono y fórmulas

La pantalla de login de Virtu abrió realmente en el Expo Go 57 ya instalado en el M2101K7BG con Android 12, mediante USB y el servidor local en el puerto 8082. No se instaló un binario nuevo.

Al intentar el primer toque automatizado, MIUI devolvió `SecurityException: Injecting to another application requires INJECT_EVENTS permission`. Se solicitó al usuario elegir entre habilitar «Depuración USB (ajustes de seguridad)», si existe en su dispositivo, o realizar los pasos manualmente. No se cambió ese permiso ni se intentó eludirlo.

`react-native-katex` está integrado en el glosario nativo, con WebView incluido localmente y pruebas de normalización y confianza deshabilitada. `mathjs` no está instalado. El recorrido web muestra el respaldo textual LaTeX; **no demuestra el renderizado nativo de las fórmulas**. Ese punto sigue pendiente de inspección física.

## Archivos añadidos o reforzados en este cierre

- `tests/calculo/session.test.jsx`: restauración para ambos roles, logout, rechazo de sesión vencida y retry tras fallo de red.
- `tests/calculo/lesson.test.jsx`: recorrido de integración completo hasta unidades e historial después del resultado oficial.
- `.gitignore` raíz: excluye `.playwright-mcp/`, artefactos locales de validación del navegador que pueden contener datos de las cuentas de prueba.
- Este informe. Las capturas estructurales de navegador son evidencia local ignorada por Git, no contenido de producción.

No se cambiaron endpoints ni se accedió directamente a MySQL. La única mutación académica de esta revisión fue el segundo intento de la cuenta de prueba autorizado para validar T08/T11. No se crearon cuentas adicionales.

## Estados confirmados en Trello

- T08 movida a **Done**, con datos reales y dos intentos 4/5 verificados (API e interfaz).
- T01 y T11 movidas a **review**, con comentarios de evidencia y el límite de validación física explícito. No se marcaron como terminadas en Android.
- T14 conserva su lista anterior y tiene un comentario de aplazamiento por instrucción del usuario. No se generará un APK hasta que lo solicite.

El servidor local Expo Go queda disponible en el puerto 8082. La interacción automatizada con el teléfono no continuará hasta que el usuario confirme la opción de seguridad o elija los pasos manuales.
