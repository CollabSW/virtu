
# S3-T13 — Pruebas completas de accesibilidad y fórmulas

## Proyecto
Virtu — Plataforma Académica de Cálculo

## Responsable
Jhaelin Alvarado

## Sprint
Sprint 3 — Cierre y entrega

## 1. Objetivo
Verificar el funcionamiento del glosario,
la representación de fórmulas y la accesibilidad
de la aplicación antes de su entrega.

## 2. Pruebas automatizadas

Herramienta: Jest

Comando:
npm test -- --runInBand

Resultados obtenidos:

- Test Suites: 21 passed, 21 total
- Tests: 126 passed, 126 total
- Tests fallidos: 0

## 3. Verificación TypeScript

Comando:
npm run typecheck

Resultado observado:
Sin errores de compilación de tipos.

## 4. Checklist de pruebas funcionales

- [ ] Inicio de sesión de estudiante
- [ ] Inicio de sesión de docente
- [ ] Navegación por unidades de Cálculo
- [ ] Búsqueda de términos del glosario
- [ ] Consulta de definiciones
- [ ] Renderización de fórmulas LaTeX
- [ ] Manejo de fórmulas inválidas
- [ ] Búsquedas sin coincidencias
- [ ] Cuestionario de cinco preguntas
- [ ] Visualización de resultados
- [ ] Funcionamiento sin conexión
- [ ] Manejo de errores HTTP

## 5. Checklist de accesibilidad

- [ ] Android 12 o superior
- [ ] Pantalla de ancho 360dp
- [ ] Texto principal legible
- [ ] Contraste de texto mínimo 4.5:1
- [ ] Navegación en tres toques o menos
- [ ] Fórmulas sin cortes de contenido
- [ ] Sin desplazamiento horizontal de pantalla
- [ ] Compatibilidad con lector de pantalla

## 6. Evidencias

Evidencia 1:
Captura de las 126 pruebas automatizadas aprobadas.

Evidencia 2:
Captura de verificación TypeScript.

Evidencias pendientes:
Pruebas manuales en Android y validación
del glosario con usuario autenticado.

## 7. Observaciones

La aplicación se ejecutó correctamente en
el navegador mediante Expo.

No se pudo completar la validación de los
servicios autenticados porque no se dispone
de credenciales de prueba.

Las pruebas automatizadas aprobadas no
sustituyen las verificaciones manuales
de accesibilidad y compatibilidad.

## 8. Conclusión

Se completó la ejecución de pruebas
automatizadas con 126 casos aprobados.

Quedan pendientes las comprobaciones
manuales de accesibilidad, fórmulas y
funcionamiento en Android.

Estado general: Parcialmente verificado.
