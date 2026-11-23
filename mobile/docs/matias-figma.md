# Diseño de Figma aplicado a T01 y T11

Referencia: [Virtu Cálculo](https://www.figma.com/design/vNKYA4EiSEN2Eb7Ysyi0tr/virtu-calculo). Se consultaron las asignaciones actuales de Trello antes de editar.

## Alcance

- **T01:** login, nodo `55:2382`. Se adaptaron cabecera, composición, tarjeta informativa, campos, botones e iconos originales. Se añadió el control accesible de visibilidad de contraseña conservando la autenticación existente.
- **T11:** Mi progreso, nodo `56:3853`, e historial existente. Tarjetas, tipografía Inter, jerarquía, colores y espaciados adaptados a React Native. El acceso «Mi progreso» conserva el inicio y la lista de unidades existentes.
- **T08:** validación de datos; no requiere otra pantalla propia.
- **T14:** aplazada por solicitud del usuario. No se compiló ni instaló APK.

Registro, detalle de lecciones, motor y resultados del cuestionario, glosario y panel docente conservan sus diseños anteriores. La cabecera compartida del alumno y la navegación global tampoco se rediseñaron. No se modificó el archivo de Figma ni el estado de las tarjetas de Trello.

## Adaptaciones al contrato real

El login presenta exclusivamente Cálculo, sin el texto de seis materias. Se omitieron recuperación de contraseña sin endpoint, versión ilustrativa y navegación «Clase» sin funcionalidad implementada.

El progreso muestra cantidades derivadas de los estados reales de unidades y lecciones. No copia el 68 %, promedio 8.8, escala /10, bloqueos ni fechas de ejemplo de Figma. El historial se consulta por lección mediante el endpoint disponible; muestra nota, aciertos, fecha, aprobación y marca de nota vigente enviadas por el servidor. No se agregaron endpoints ni se modificaron datos académicos.

## Archivos

- `src/navigation/AuthNavigator.tsx`: login y entrada al progreso.
- `src/modules/calculo/screens/UnitsScreen.tsx`: presentación de progreso e historial.
- `src/modules/calculo/components/ProgressOverview.jsx` y `matiasDesign.js`: presentación y tokens exclusivos de T01/T11.
- `src/shared/components/Button.tsx`: dos propiedades opcionales (`textStyle`, `icon`), conservando el aspecto predeterminado de sus otros consumidores.
- `assets/figma/matias/`: ocho iconos originales, tres fuentes Inter locales y licencia OFL; sin nuevas dependencias.
- `tests/calculo/matias-design.test.jsx`, `progress.test.jsx` y `lesson.test.jsx`: verificación de login, progreso e historial.

## Verificación

- **120 pruebas aprobadas**, 21 suites; lint sin caché y typecheck aprobados.
- Revisión visual web a 360 px; login también comprobado a 390 px. Sin desbordamiento horizontal; campos y botones del login de 48 px; texto de cuerpo de al menos 16 px. Fuentes e iconos cargados localmente y geometría comprobada.
- Flujo real: login → inicio → progreso → historial → progreso → actualizar → inicio → logout. HTTP 200 en `/auth/login`, `/contenidos/calculo` y `/cuestionarios/30001/historial`. Dos intentos reales con nota 5.8 y 4/5 aciertos; ninguna nueva evaluación creada durante esta comprobación.
- Capturas locales en `.playwright-mcp/matias-{login,progreso,historial}-360.png`, ignoradas por Git.
- Guías utilizadas: Figma design-to-code e Impeccable, coordinadas por design-orchestrator.

Pendiente: revisión visual nativa en Android; ADB no detectó dispositivos conectados. La revisión web no sustituye esa prueba.
