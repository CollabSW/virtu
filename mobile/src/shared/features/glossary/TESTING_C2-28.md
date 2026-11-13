# Pruebas funcionales del glosario (C2-28)

La suite `mobile/tests/glossary/C2-28.test.tsx` verifica la búsqueda y el detalle con siete ejemplos ficticios de las seis materias.

| Caso | Resultado esperado |
| --- | --- |
| Buscar `LÍMITE` o `límite` | Aparece Límite con su tema y representación. |
| Buscar `Simón`, `ATP` o `No metal` | Aparecen Independencia, Mitocondria u Oxígeno, respectivamente, por coincidencias en sus detalles. |
| Buscar `gravitación` | Aparece Gravedad por su concepto. |
| Buscar `cloud` y abrir Cloud | El detalle incluye el ejemplo de uso. El campo Audio está ausente. |
| Buscar `xyz` y limpiar la búsqueda | Aparece «No hay resultados» y el botón «Limpiar búsqueda» restaura la lista. |

Desde `mobile/`, ejecutar `npm test -- --runInBand tests/glossary/C2-28.test.tsx`.
