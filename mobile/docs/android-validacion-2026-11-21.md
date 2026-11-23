# Validación de la integración Android

> Estado actualizado: [cierre funcional de Matías](matias-cierre-funcional.md), con 109 pruebas y recorrido web contra API real. Android abrió en Expo Go, pero MIUI bloqueó los toques automatizados. El APK permanece aplazado.

Continuación del informe `calculo-validacion-2026-11-21.md`. Fecha: 21 de noviembre de 2026.

## Cambios de frontend

- `quizService.js`: inicio, confirmación de respuestas y finalización mediante los endpoints existentes; valida sus respuestas. No calcula aciertos ni calificaciones.
- `RemoteQuizScreen.jsx`: reutiliza `QuestionCard` y `FeedbackModal`; presenta cinco preguntas, selección única, confirmación, retroalimentación oficial, resultado y reintentos. Bloquea la selección al enviar una respuesta, incluso si se pierde la conexión, para evitar cambiar una respuesta posiblemente registrada. Tras finalizar solicita refrescar contenidos.
- `LessonScreen.jsx`: abre la evaluación suministrada por la API, sin fijar su ID en el código.
- `UnitsScreen.tsx`: admite la calificación decimal como número o cadena, según las respuestas reales del backend.
- `MathFormula.jsx` y `GlossaryScreen.tsx`: renderizado nativo con `react-native-katex` y `react-native-webview`. KaTeX viene incluido en la biblioteca; no utiliza un CDN. Normaliza comandos con doble barra recibidos por la API y deshabilita comandos de confianza y navegación externa. El modo web conserva una representación textual de respaldo.
- No se añadió `mathjs`: no se necesitan cálculos simbólicos ni resolver derivadas en el cliente.

## Pruebas locales

`npm.cmd test -- --runInBand --testTimeout=15000`: **104 pruebas, 19 suites, aprobadas**. Tras reforzar la validación de IDs y valores nulos, las seis pruebas enfocadas de evaluación remota y fórmulas también pasaron. Lint y TypeScript aprobados.

Cobertura añadida: cuestionario inválido, cinco confirmaciones, resultado diferente del conteo de retroalimentaciones para asegurar que manda el servidor, refresco de progreso, reintentos, pérdida de conexión con selección bloqueada, temporizador condicionado al límite remoto, normalización LaTeX y protección frente al cierre del elemento script de WebView.

Contraste calculado para las combinaciones principales: verde `#176b48` sobre blanco **6.50:1**; texto secundario `#60646c` sobre blanco **5.94:1**; negro sobre superficie `#e6f1eb` **18.15:1**. Esto no sustituye la inspección de todas las pantallas reales.

## Entorno Android y compilación

ADB detectó un teléfono **M2101K7BG con Android 12**, autorizado por USB.

Se usa `npm run android -- --variant release --no-bundler`, es decir, el comando Expo/React Native del proyecto. No se altera el backend ni se utiliza SQL.

Se encontraron dos problemas del entorno: ubicación del SDK ausente tras regenerar Android, y fallo de CMake con Java 25. Se restauró `android/local.properties` (archivo local ignorado) con el SDK instalado. Se descargó un JDK 17 portátil oficial de Eclipse Adoptium en el directorio temporal, sin cambiar el Java global.

La compilación actual utiliza `JAVA_HOME` temporal y `GRADLE_OPTS` con arquitectura `arm64-v8a`, máximo dos trabajadores y paralelismo deshabilitado. El APK previsto es para teléfonos ARM64, no para emuladores x86. La configuración release generada por Expo emplea la firma de desarrollo predeterminada; no es una entrega firmada para tienda.

## Estado de validación física

El usuario pidió posponer la creación del APK hasta el final. La compilación se canceló y no se continuará con empaquetado o instalación por ahora. No se generó un APK ni se realizaron pruebas físicas de sesión, recorridos, fórmulas, 360 dp o funcionamiento continuo de 30 minutos.

No se añadieron scripts de generación de APK al código: se usó el comando Android ya existente con argumentos temporales. El perfil EAS `preview` era previo a esta revisión y se conserva. La identidad de Cálculo, la autenticación y las dependencias de fórmulas son cambios funcionales, no herramientas de empaquetado, y se mantienen.
