# Pruebas Funcionales - Glosario (C2-28)

Este documento detalla las pruebas manuales realizadas para validar el motor del glosario, la búsqueda genérica y el renderizado de campos.

## Casos de Prueba

### 1. Visualización de Lista y Detalles (C2-24)
- Se muestran los términos de las 6 materias (Cálculo, Historia, Física, Inglés, Biología, Química).
- Al hacer clic en un término, se despliega su definición completa.
- Los detalles muestran campos específicos (ej. fórmulas en Cálculo, video en Física, flashcards en Biología).

### 2. Búsqueda Genérica No Sensible a Mayúsculas (C2-18)
- Buscar "LÍMITE" o "límite" arroja el mismo resultado.
- Buscar "Simón" encuentra el término "Independencia" (búsqueda en campo personaje).
- Buscar "ATP" encuentra el término "Mitocondria" (búsqueda en reverso de flashcard).
- Buscar "No metal" encuentra el término "Oxígeno" (búsqueda en propiedades químicas).

### 3. Campos Opcionales (C2-18)
- El término "Cloud" (Inglés) no tiene campo `audioUrl` y se renderiza correctamente sin errores.
- El buscador filtra el término "Cloud" correctamente ignorando el campo faltante.

### 4. Estado Vacío y Limpieza (C2-19)
- Al buscar "xyz" (que no existe), se muestra el mensaje "Sin resultados" con ícono de lupa.
- El botón "Limpiar búsqueda" vacía el campo de texto y devuelve la lista completa.
- La consulta vacía (borrar todo el texto) muestra todos los elementos.