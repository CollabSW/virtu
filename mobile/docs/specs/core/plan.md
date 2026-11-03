# Virtu Core — plan y registro de ejecución

**Objetivo:** diferenciar como Core las herramientas usadas por los canales de todas las materias, sin cambiar el comportamiento ya probado.
**Spec:** [spec.md](spec.md). **Arquitectura:** [design.md](design.md). **Aceptación/estados:** [tasks.md](tasks.md).
**Stack verificado:** único paquete `mobile/`; Expo 57, React 19.2.3, React Native 0.86.3, TypeScript 6; Jest con preset Expo. No nuevos paquetes ni servicios para esta reorganización.

## Restricciones

- Preservar cambios locales, starter y módulos de otros integrantes; no commits, push, despliegues ni modificaciones a Trello.
- Trasladar, no duplicar; API `@/core/quiz`. No crear workspace, paquete externo o glosario ficticio.
- Core recibe datos/callbacks; no depende de canales o rutas. Fixtures no representan contenido final de Cálculo.
- Mantener estado, confirmación y cálculo únicos. El cambio de ubicación no modifica contratos ni comportamiento visual.

## Orden y propietarios de validación

1. **Diagnóstico (orquestador):** leer Git, spec/guía y rutas actuales. Preservar el trabajo local y confirmar que solo hay un paquete.
2. **Traslado Core inicial (fixer):** inventariar archivos de `quiz`, moverlos a `src/core/quiz`, actualizar imports reales. Comprobar tipos y pruebas enfocadas; no editar documentación en paralelo. El aislamiento posterior de pruebas se registra al final.
3. **SDD (orquestador, en paralelo al traslado):** separar especificación, diseño, tareas y este plan. Actualizar guía, READMEs e instrucciones con imports y comandos vigentes; mantener identificada la evidencia histórica.
4. **Reconciliación (orquestador):** leer archivos producidos, buscar referencias activas obsoletas, inspeccionar dirección de dependencias y verificar que no quedan copias. Validar el ejemplo TSX de la guía.
5. **Regresión final (orquestador):** ejecutar checks secuencialmente; registrar salida real y cerrar solo las tareas verificadas. Conservar bloqueos ajenos y revisión de PR pendientes.

## Comandos reproducibles

Desde `mobile/`:

```sh
npm run typecheck
npm run lint
npx eslint src/core tests src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx
npm test -- --runInBand
npm test -- --runInBand tests/quiz/quiz-state.test.ts -t "empty"
npx expo export --platform web
```

No ejecutar Metro/export y la suite en paralelo: se observó un timeout al competir por CPU. El lint global tiene un error conocido en `src/hooks/use-color-scheme.web.ts:11`, no modificado; no desactivar reglas para ocultarlo. Los archivos tocados deben pasar lint enfocado.

## Evidencia anterior a la separación Core

- Fases originales A–F implementaron contratos, núcleo, componentes, demo, fixtures y guía: 24/24 pruebas en 3 suites; TypeScript y export web aprobados. C2-05/15 solo integradas localmente, no con las entregas del equipo ausentes.
- Se resolvieron declaraciones CSS, import de `QuizState`, tuples readonly y refs durante render; estos cambios forman parte del baseline que se preserva.
- Lint global: único error en `src/hooks/use-color-scheme.web.ts:11`. Lint de archivos cambiados aprobado. Ejemplo Biología compilado mediante archivo virtual TypeScript.
- No hubo RED conductual inicial de núcleo/UI; sí se observó en ampliación del fixture largo. No afirmar TDD completo retroactivamente.
- Auditoría histórica de instalación: 57 vulnerabilidades (7 altas); `npm audit --omit=dev --json`: 42 (7 altas), código 1. Sin `audit fix --force` ni cambio de SDK. No es una auditoría aprobada de seguridad.

## Evidencia histórica del ajuste Core, anterior al aislamiento de pruebas

Verificación nueva, ejecutada después del traslado y la actualización de imports; no reutiliza resultados históricos:

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | Código 0 |
| `npm run lint` | Código 1; solo `src/hooks/use-color-scheme.web.ts:11`, preexistente y no modificado |
| `npx eslint src/core src/app/quiz.tsx src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx` | Código 0 |
| `npm test -- --runInBand` | Código 0; 3 suites, **24/24 pruebas**, 5,032 s |
| `CI=1 npx expo export --platform web` (PowerShell: `$env:CI='1'`) | Código 0; `/quiz`, `/`, `/explore` y rutas Expo generadas |
| Ejemplo TSX de Biología, cargado como archivo virtual mediante API TypeScript junto con el proyecto | 0 diagnósticos con import `@/core/quiz` |
| Inventario/búsqueda e inspección de imports | 10 archivos en Core; ubicación anterior ausente; sin dependencia de rutas o materias |
| Enlaces Markdown locales en SDD, READMEs, guía e instrucciones | 37 enlaces resueltos; sin referencias activas a documentos retirados |

`CORE-M01` a `CORE-M05` verificados localmente. El traslado no añade funcionalidades ni dependencias. Siguen pendientes integración de C2-02/03/12/13, glosario real, QA de dispositivos y revisión de PR. La exportación web no demuestra ejecución E2E o compilación de binarios móviles.

## Aislamiento de pruebas — plan y evidencia

Fuente: requisito CORE-05 en [spec.md](spec.md). El usuario solicitó separar las pruebas de las herramientas de producción/desarrollo.

1. Trasladar las tres suites y `fixtures.ts` a `mobile/tests/quiz/`; conservar seis archivos de implementación en `src/core/quiz/`.
2. Trasladar la demo a `tests/quiz/QuizDemo.tsx` y retirar únicamente sus puntos de acceso de la aplicación. No cambiar selección, puntaje, feedback o contratos.
3. Ajustar `jest.config.js` para descubrir solo `tests/`; actualizar imports test → producción. Mantener TypeScript sobre ambos y dependencias de testing solo de desarrollo.
4. Reconciliar fuentes/documentación. Comprobar dependencia unidireccional, descubrimiento de suites, typecheck y pruebas completas; exportar web secuencialmente para confirmar que no existe `/quiz`.

Validación final nueva (posterior a mover archivos e imports):

| Comando / inspección | Resultado |
|---|---|
| `npm run typecheck` | Código 0; incluye fuente y pruebas aisladas |
| `npx eslint src/core tests src/app/index.tsx src/components/app-tabs.tsx src/components/app-tabs.web.tsx` | Código 0 |
| `npm test -- --runInBand` | Código 0; **24/24 pruebas**, 3 suites, 6,868 s |
| `npx jest --listTests --runInBand` | Solo las tres suites bajo `tests/quiz/` |
| `CI=1 npx expo export --platform web` | Código 0; solo `/`, `/explore`, `/_sitemap`, `/+not-found`; sin `/quiz` ni `dist/quiz.html` |
| Inventario e imports | Seis archivos de implementación en `src/core/quiz/`; tests, fixtures y demo fuera de `src/` |

En la comprobación enfocada del especialista hubo un timeout aislado inicial; su repetición y la suite global final aprobaron sin cambiar los límites de tiempo. No se modificó el comportamiento del motor ni se añadieron dependencias. El error global de lint preexistente y los pendientes externos siguen registrados; no se afirma que se hayan resuelto por mover las pruebas.

## Preview de desarrollo identificado como pruebas

Solicitud posterior del usuario: volver a mostrar el cuestionario de muestra, aclarando que es solo de pruebas. Mantener el aislamiento de archivos y agregar únicamente acceso desde Home y ruta puente protegidos por `__DEV__`, reutilizando `tests/quiz/QuizDemo.tsx`. Aviso persistente de datos ficticios/no canal real; release sin carga de demo.

Implementado: acceso Home y pestaña «Pruebas» nativa/web solo en desarrollo; `/pruebas` carga condicionalmente `tests/quiz/QuizDemo.tsx`. Banner fijo «SOLO PRUEBAS — datos ficticios. No corresponde a un canal real.»; release redirige a `/`. Core permanece sin cambios.

Validación nueva: suite completa `npm test -- --runInBand`, **26/26 pruebas en 5 suites**, 7,895 s; lint de archivos tocados aprobado; export web aprobado. Búsqueda sobre todos los JS/HTML de `dist/` sin `basics-1`, `long-question` ni `SOLO PRUEBAS`. `/pruebas` existe como ruta en release pero redirige y no incluye el cuestionario. Se corrigió el tipado de `globalThis.__DEV__` del test; `npm run typecheck` y prueba enfocada del guard posteriores aprobados. El test release falla si intenta cargar la demo, además de comprobar la redirección. No se afirma prueba E2E en navegador/dispositivo.

La excepción queda declarada en CORE-05, diseño, guía e instrucciones; no aplica a Core ni a canales de producción. Los demás pendientes externos no cambian.
