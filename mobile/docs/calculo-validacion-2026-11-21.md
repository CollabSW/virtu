# Virtu Cálculo: implementación y validación

> Continuación vigente: [cierre funcional de Matías](matias-cierre-funcional.md). Incluye el segundo intento desde la interfaz, 109 pruebas y el límite de validación física impuesto por MIUI. T14 sigue aplazado.

Revisión del 21 de noviembre de 2026. Este informe actualiza la evidencia histórica de `calculo-entrega.md`. Se conservaron los cambios que ya estaban en el árbol de trabajo; no se hicieron commits, reseteos ni cambios en el backend.

**Actualización posterior autorizada por el usuario:** se crearon datos de cuestionario mediante los endpoints existentes de Swagger, usando las cuentas de prueba. No se modificaron código ni endpoints del backend ni se accedió directamente a MySQL. La evidencia inicial de ausencia de cuestionario se conserva como antecedente y queda sustituida por la validación de T08 al final de este informe.

## Estado de los tickets

| Ticket | Estado verificable | Pendiente para cerrar |
| --- | --- | --- |
| T01 | Login y `/auth/me` reales con ambos roles; JWT de siete días. Inicio directo por rol, SecureStore existente, Bearer, cierre de sesión y rechazo de JWT inválido cubiertos por pruebas locales. | Reinicio y expiración real en Android. No se declara completado. |
| T08 | Cuestionario de Cálculo ID 30001 creado por API con cinco preguntas. Intento real 90001: 4/5, nota oficial 5.8, aprobado e historial vigente verificados. Bloqueo de datos resuelto. | Conservar revisión. La transición PENDIENTE → ESTUDIADO no se comprobó porque la lección ya estaba estudiada. |
| T11 | Estados e historial oficiales; refresco por foco, manual y después de marcar una lección sin cuestionario. Historial real de Cálculo verificado por API tras T08. | T04/T05 deben integrar la evaluación remota en la app y refrescar contenidos tras finalizar. |
| T14 | Configuración exclusiva de Cálculo, HTTPS, permisos restringidos y perfil EAS APK existente. Prebuild Android terminado. | Sin APK generado ni instalación limpia. `npm run android` se detuvo por ausencia de dispositivo/emulador. No se ejecutó una sesión de 30 minutos. Pendientes T08–T13. |

## Navegación y pantallas

- Se eliminó `SubjectSelection.tsx`, su prueba obsoleta, su import y el botón «Volver a materias».
- Estudiante: login → inicio de Cálculo → unidades → detalle de lección; acceso al glosario e historial de cuestionarios suministrados por el servidor.
- Docente: login → cursos → estudiantes → lecciones de Cálculo → reporte de resultados. Solo GET; sin edición de notas ni administración de contenidos.
- Se sustituyeron las pestañas del starter por Stack de Expo Router y se retiró la ruta `explore`. El preview `pruebas` sigue siendo exclusivo de desarrollo; no se utiliza para evaluar Cálculo.
- Los módulos de otras materias se conservaron para no borrar trabajo compartido; no tienen accesos desde esta aplicación. El inicio no consulta `/contenidos` ni lista las seis materias.
- `APP_SLUG=calculo` en configuración y servicios; identidad Android `com.virtu.calculo`, nombre Virtu Cálculo y esquema `virtu-calculo`.

## API oficial

Swagger consultado: `https://backend-virtu.onrender.com/docs/swagger-ui-init.js`, contrato 1.2.0. Base única: `https://backend-virtu.onrender.com/api`.

Consultas reales verificadas: POST `/auth/login`, GET `/auth/me`, `/contenidos/calculo`, `/glosarios/calculo`, `/docente/cursos`, `/docente/cursos/1/estudiantes`. Ambas cuentas de prueba públicas autentican; no se almacenaron sus credenciales o JWT en el repositorio. Un JWT inválido dio 403 con «El token proporcionado no es válido»; ahora se diferencia de un 403 de permisos.

Endpoints adicionales conectados según Swagger y probados con respuestas simuladas exclusivamente en tests: GET `/lecciones/{id}`, POST `/lecciones/{id}/marcar-estudiado`, GET `/cuestionarios/{id}/historial`, GET `/docente/estudiantes/{estudianteId}/lecciones/{leccionId}`. No se enviaron mutaciones académicas al servidor.

Swagger sí publica el historial, con array de intentos y nota vigente. Inicialmente faltaba un cuestionario de Cálculo; posteriormente se verificaron iniciar/responder/finalizar e historial con el cuestionario 30001 (ver actualización T08). No se usó Historia ni se integró una segunda máquina de evaluación en paralelo a T04/T05.

El reporte docente agregado mezcla materias y no ofrece filtro de Cálculo: se advierte en pantalla y no se presenta ese porcentaje/promedio como exclusivo de Cálculo. El detalle se solicita únicamente para lecciones del catálogo de Cálculo.

## Archivos intervenidos en esta revisión

- Configuración y navegación: `app.json`, `src/config/apiConfig.js`, `src/navigation/AppNavigator.tsx`, `src/navigation/AuthNavigator.tsx`.
- Sesión: `src/shared/services/database.js`, `src/shared/context/AuthContext.jsx`.
- Pantallas: `src/modules/calculo/screens/UnitsScreen.tsx`; nuevas `LessonScreen.jsx`, `CalculusGlossary.jsx` y `src/shared/features/teacher-dashboard/TeacherDashboard.jsx`.
- Texto compartido: `src/components/themed-text.tsx`, variantes pequeñas elevadas a 16 sp.
- Tests: `tests/calculo/session.test.jsx`; nuevos `navigation.test.jsx`, `lesson.test.jsx`, `teacher.test.jsx`, `glossary.test.jsx`.
- Documentación: README raíz y este informe. Rutas eliminadas: `src/navigation/SubjectSelection.tsx`, `src/app/explore.tsx`; prueba retirada: `tests/calculo/subjects.test.jsx`.

Las carpetas anteriores son relativas a `mobile/` salvo el README raíz. Los archivos de autenticación, tema y registro que ya estaban modificados se conservaron.

## Verificación y límites

- Antes de editar: 91 tests pasaron.
- Después: `npm.cmd test -- --runInBand --testTimeout=15000`: **98 tests, 17 suites, todos aprobados**.
- `npm.cmd run lint` y `npm.cmd run typecheck`: aprobados. `git diff --check`: sin errores.
- `npx.cmd expo prebuild --platform android --no-install`: terminó. La configuración nativa previa de `app/src`, `app/build.gradle` y `gradle.properties` quedó respaldada en el directorio temporal, archivo `virtu-native-before-calculo-20261121002614.zip`.
- Según la preferencia del usuario, se ejecutó Android mediante `npm.cmd run android` (Expo/React Native), sin continuar la compilación directa con Gradle. Se detuvo antes de compilar: no hay dispositivo conectado ni emulador disponible para arranque automático.
- No se validaron visualmente los 360 dp, contraste completo, instalación limpia ni funcionamiento continuo. El identificador Android debe acordarse antes de distribuir una versión oficial.
- El glosario reutiliza Core 2 y presenta el texto LaTeX recibido; **el renderizado matemático sigue pendiente de T07**. No se afirma que las fórmulas estén renderizadas.
- No se encontraron ERS, CR-01, Especif API ni wireframes PDF en el repositorio. Se aplicaron los requisitos transcritos por el usuario, las tarjetas y Swagger; falta cotejo con esos originales. Posteriormente se leyó `C:/Users/matia/Downloads/BD inicial.md`, proporcionado por el usuario.

### Contraste con BD inicial

El documento es una hoja de datos de prueba, no un esquema SQL completo. Confirma contenido/unidad/lección de Cálculo con ID 2, sin cuestionario; el cuestionario ID 1 pertenece a Historia (lección ID 6). También documenta el glosario de Cálculo con `renderizacion` LaTeX y métricas docentes globales de seis unidades. No autoriza usar la evaluación de Historia en Cálculo.

Sus estados y porcentajes son una fotografía inicial: para el estado vigente se usa la respuesta del servidor. Por ejemplo, el documento indica Cálculo `PENDIENTE`, mientras la consulta autenticada de esta revisión devolvió `ESTUDIADO`. Los IDs del documento tampoco se fijan en el frontend; se obtienen de los endpoints.

Restricción confirmada por el usuario: resolver exclusivamente con los endpoints existentes de Swagger, sin crear ni modificar endpoints. La conexión del cuestionario remoto y el renderizado de fórmulas son trabajo frontend; no requieren ampliar la API. La falta de un cuestionario de Cálculo es una dependencia de datos, no de endpoints. Este documento no concede autorización para modificar registros de producción.

Para continuar: conectar un Android 12+ con depuración USB o disponer de un emulador y ejecutar `npm run android` desde `mobile/`. El perfil `preview` de `eas.json` permite solicitar un APK cuando se acuerden proyecto EAS y credenciales de firma. No existe un artefacto nuevo cuya instalación pueda declararse probada.

## Actualización de Trello

Se publicaron comentarios de evidencia y pendientes en T01, T08, T11 y T14. T08 conserva `review`; las otras tres conservan `In Progress`. No se marcó ninguna como terminada. Comentarios confirmados por Trello: `6b011f812183463c336b6baa`, `6b011f844fececd325723459`, `6b011f86cea0afd2f0e6c1ca` y `6b011f882a8850917ccfd49e`, respectivamente.

## T08: datos creados y evaluación real comprobada

Con autorización expresa posterior del usuario para utilizar las cuentas de prueba y crear las preguntas, se comprobó primero que la lección 2 seguía sin cuestionario. La cuenta docente existente pudo ejecutar los endpoints administrativos; no fue necesario crear otra cuenta ni añadir capacidades administrativas al frontend docente.

1. POST `/admin/cuestionarios` con `leccionId: 2` creó el cuestionario **30001**. El servidor asignó un límite de **300 segundos**.
2. Cinco POST `/admin/cuestionarios/30001/preguntas` crearon las preguntas **30001–30005**, opciones **30001–30020**: cuatro alternativas, una correcta y explicación por alternativa. Temas: derivadas de `(3x + 2)^2`, `(2x - 1)^3`, `sin(4x)`, `e^(5x)` y `ln(x^2 + 1)`.
3. GET `/lecciones/2` confirmó `materiaSlug: calculo`, `tieneCuestionario: true` y `cuestionarioId: 30001`.
4. Con la cuenta estudiante de prueba, POST `/cuestionarios/30001/iniciar` creó el intento **90001**, número 1. Se verificaron cinco preguntas y cuatro opciones, sin el campo `esCorrecta` expuesto en las opciones del inicio.
5. Se confirmaron cinco respuestas mediante POST `/intentos/90001/responder`: una incorrecta y cuatro correctas, con retroalimentación del servidor.
6. POST `/intentos/90001/finalizar` devolvió **4 aciertos de 5**, **calificación 5.8**, `aprobado: true`, `leccionCompletada: true` y `unidadCompletada: true`.
7. GET `/cuestionarios/30001/historial` confirmó el intento 90001 como nota vigente. La calificación llega en este endpoint como cadena `"5.8"`; no se recalculó en el cliente.
8. GET `/contenidos/calculo` confirmó la asociación y estado `ESTUDIADO`. El estado ya era `ESTUDIADO` antes del intento: no se reinició ni alteró artificialmente el progreso para demostrar una transición.

Estos pasos crearon registros reales en el backend publicado, exclusivamente mediante su API y con las cuentas de prueba autorizadas. No se guardaron contraseñas ni tokens en archivos del proyecto. El flujo remoto ya está verificado a nivel API; su conexión con las pantallas sigue siendo dependencia T04/T05. La restricción de solo consulta del docente dentro de la app se conserva, aunque la cuenta de prueba permita operaciones administrativas desde la API.

## T09 / T10: contrato del panel docente de solo lectura

Se volvió a consultar el OpenAPI 3.0.3, contrato 1.2.0, servido en `https://backend-virtu.onrender.com/docs/swagger-ui-init.js`. Los ejemplos siguientes son los ejemplos publicados por Swagger; no se presentan como respuestas reales de esta ejecución:

- `GET /docente/cursos`: array de `{ id, nombre, colegio: { id, nombre }, totalEstudiantes }`.
- `GET /docente/cursos/{cursoId}/estudiantes`: `{ curso: { id, nombre }, totalEstudiantes, estudiantes: [{ estudianteId, nombreCompleto, username, totalUnidades, unidadesEstudiadas, porcentajeAvance, promedioNotas }] }`.
- `GET /docente/estudiantes/{estudianteId}/lecciones/{leccionId}`: `{ estudiante: { id, nombreCompleto, username }, leccion: { id, titulo }, tieneCuestionario, estadoLeccion, notaVigente, aprobado, aciertosTotales, desaciertosTotales, fechaEjecucion, detallePreguntas: [{ preguntaId, orden, enunciado, acerto, respuestaDadaTexto, respuestaCorrectaTexto, solucionExplicacion }] }`.

Los informes de validación previos registran consultas autenticadas reales para cursos y estudiantes; el detalle docente estaba cubierto con respuestas simuladas en pruebas, no con una consulta real autenticada. En esta implementación se conserva el contrato de campos de Swagger; valores ausentes se presentan como «No disponible», sin convertir ni recalcular notas.

**Alcance de los agregados:** la descripción del endpoint de estudiantes define el avance por unidades y el promedio de notas como métricas agregadas y no ofrece parámetro/filtro de materia. El informe de alcance anterior indica que combina materias. Por eso el panel lo rotula como global y muestra una advertencia; la selección de lecciones que conduce al reporte T10 se limita al catálogo obtenido por `GET /contenidos/calculo`. Confirmar con Backend si más adelante se necesita que las métricas de T09 sean exclusivas de Cálculo.
