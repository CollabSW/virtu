# Renderizado de fórmulas

Se reutiliza `react-native-katex` en Android. Antes solo estaba conectado al glosario; ahora también se aplica a lecciones, preguntas, alternativas, retroalimentación, resultados y detalle docente.

`MathText` separa el texto de las expresiones delimitadas con `$...$`, `$$...$$`, `\(...\)` o `\[...\]`, además de las asignaciones de funciones del contenido actual. Las alternativas matemáticas se renderizan completas. `mathFormatting.js` adapta potencias, funciones y fracciones simples del formato ASCII existente a LaTeX; no evalúa operaciones ni determina respuestas o notas. Para expresiones mixtas más complejas debe usarse LaTeX explícito. No se modificaron datos ni endpoints.

Se preserva la selección de alternativas: las vistas de fórmulas no capturan el toque del botón de respuesta. El motor compartido conserva su presentación anterior si no se activa `renderMath`.

Validación automatizada: 118 pruebas aprobadas en 20 suites; lint sin caché y typecheck aprobados. Incluye potencias, fracciones, funciones, escapes de la API, separación de texto y selección de opciones.

Pendiente: comprobación visual de estas modificaciones en el teléfono Android. En la última consulta no había dispositivo ADB conectado. La vista web mantiene la representación textual de respaldo. No se generó APK.
