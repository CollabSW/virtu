# virtu
Desarrollo de herramienta digital educativa

Guía principal del proyecto: qué es Virtu, cómo levantarlo y cómo trabajamos entre equipos. Si nunca usaste React Native, sigue la [sección 5](#5-cómo-levantar-el-proyecto-paso-a-paso) paso a paso.

> La guía general describe la base de Core 1 que viene de `develop`. Para trabajar con el cuestionario y el glosario en `core2`, ejecuta los comandos desde `mobile/` y sigue la [guía de Core 2](#core-compartido-en-core2).

## Índice

1. [Sobre Virtu](#1-sobre-virtu)
2. [Equipos del proyecto](#2-equipos-del-proyecto)
3. [Stack tecnológico y decisiones](#3-stack-tecnológico-y-decisiones)
4. [Requisitos previos](#4-requisitos-previos)
5. [Cómo levantar el proyecto (paso a paso)](#5-cómo-levantar-el-proyecto-paso-a-paso)
6. [Solución de problemas comunes](#6-solución-de-problemas-comunes)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Reglas de trabajo entre equipos](#8-reglas-de-trabajo-entre-equipos)
9. [Flujo de trabajo con Git](#9-flujo-de-trabajo-con-git)
10. [Scripts disponibles](#10-scripts-disponibles)
11. [Organización Scrum](#11-organización-scrum)
12. [Documentación del proyecto](#12-documentación-del-proyecto)
13. [Contacto](#13-contacto)
14. [Core compartido en `core2`](#core-compartido-en-core2)

## 1. Sobre Virtu

Virtu es una app móvil educativa para estudiantes de secundaria. Reúne 6 materias: Biología, Cálculo, Física, Historia, Inglés y Química.

Tiene dos roles: estudiante y docente. Cada materia se desarrolla como un módulo independiente sobre una base común de login, navegación, cuestionarios y glosario.

## 2. Equipos del proyecto

| Equipo | Responsabilidad | Lead | Integrantes |
|---|---|---|---|
| Core 1 | Estructura, login y roles | Rubén | Gadiel, Hassan, Ismael |
| Core 2 | Cuestionarios y glosario | Matías | Oliver, Esteban, Jhaelin |
| Biología | Módulo de Biología | Nahuel | Joaquín, Mateo |
| Química | Módulo de Química | Rodrigo | Eduardo, Randall |
| Física | Módulo de Física | Brayan | José, Carla |
| Inglés | Módulo de Inglés | Marvin | Liam, Estrella |
| Historia | Módulo de Historia | Brandon | Nataly, Romina |
| Backend | API central + MySQL | A cargo de la docente | — |

> **Nota:** Cálculo está pendiente de asignación.

## 3. Stack tecnológico y decisiones

| Tecnología | Versión en el proyecto | Por qué |
|---|---|---|
| React Native con Expo | Expo SDK 58 (`expo ~58.0.23`), React Native 0.88.1 | Permite probar en el celular con Expo Go, sin instalar Android Studio ni Xcode. |
| JavaScript | — | Lo exige el ERS; por eso no se usa TypeScript. |
| npm | — | Un solo gestor de paquetes evita diferencias de versiones entre equipos. |
| React Navigation | `@react-navigation/native ^7.5.1`, `@react-navigation/native-stack ^7.21.0` | Es la navegación elegida para el proyecto, en lugar de expo-router. |
| axios | `^1.21.0` | Centraliza las llamadas a la API central. |
| AsyncStorage | `@react-native-async-storage/async-storage 2.2.0` | Guarda en el celular datos locales que no son sensibles. |
| expo-secure-store | `~58.0.2` | Guarda de forma cifrada datos sensibles, como el token de sesión. |
| ESLint + Prettier | `eslint ^9.39.5`, `prettier ^3.9.10` | Detectan errores y mantienen el mismo formato de código en todos los equipos. |

> [!WARNING]
> - **No instales expo-router.** La navegación se hace con React Navigation.
> - **No uses TypeScript.** Todo el código va en `.js` o `.jsx`.
> - **No uses yarn ni pnpm.** Solo npm.
> - **No instales librerías con `npm install <paquete>`.** Usa `npx expo install <paquete>` para mantener versiones compatibles con el SDK. (`npm install` sin nombre de paquete sí es correcto: instala lo que el proyecto ya tiene definido).
> - **Consulta a tu lead antes de agregar una dependencia nueva.**

## 4. Requisitos previos

| Herramienta | Detalle | Cómo verificar |
|---|---|---|
| [Node.js](https://nodejs.org/) LTS | El proyecto admite `^22.13.0`, `^24.3.0` o `26` en adelante. Incluye npm. | `node -v` |
| [Git](https://git-scm.com/) | Para clonar y subir cambios. | `git --version` |
| [VS Code](https://code.visualstudio.com/) | Con las extensiones recomendadas **ESLint** (`dbaeumer.vscode-eslint`) y **Prettier** (`esbenp.prettier-vscode`). | `code --version` |
| Expo Go en el celular | [Android 12 o superior](https://play.google.com/store/apps/details?id=host.exp.exponent) o [iPhone](https://apps.apple.com/app/expo-go/id982107779). | Abre la app en el celular. |
| Cuenta en [expo.dev](https://expo.dev/signup) | Es gratuita y se usa en la computadora y en el celular. | `npx expo whoami` (dentro del proyecto) |

## 5. Cómo levantar el proyecto (paso a paso)

Los comandos son iguales en Windows, Mac y Linux.

**1. Clona el repositorio y entra a la carpeta:**

```bash
git clone https://github.com/CollabSW/virtu.git
```

```bash
cd virtu
```

**2. Cámbiate a la rama de integración:**

```bash
git checkout develop
```

Comprueba que el archivo `package.json` aparece en la raíz de la carpeta. Si no aparece, y en su lugar ves una carpeta `mobile/`, el proyecto base todavía no se integró en `develop`. En ese caso usa esta rama:

```bash
git checkout leadCore1
```

**3. Instala las dependencias:**

```bash
npm install
```

**4. Inicia sesión en Expo:**

```bash
npx expo login
```

Inicia sesión también en la app Expo Go del celular, **con la misma cuenta**. Si no lo haces, aparece el error `You need to be signed in to Expo Go and Expo CLI`.

**5. Inicia el servidor de desarrollo:**

```bash
npx expo start
```

Deja esa terminal abierta mientras trabajas. Aparecerá un código QR.

**6. Escanea el código QR:**

- **Android:** desde la app Expo Go.
- **iPhone:** con la cámara del celular.

**7. Comprueba el resultado.** Si todo salió bien, verás una pantalla con la barra **Inicio** arriba y el texto **Virtu** en el centro.

**8. Recarga la app cuando la necesites.** Tienes dos formas:

- Sacude el celular y elige **Reload**.
- Presiona la tecla `r` en la terminal donde corre el servidor.

## 6. Solución de problemas comunes

| Problema | Solución |
|---|---|
| `Local Network Access Needed` en iPhone | Da permiso a Expo Go en **Ajustes > Privacidad y seguridad > Red local**. |
| El celular no encuentra el servidor | Conecta el celular y la computadora a la misma red Wi-Fi. Si no funciona (por ejemplo, con el Wi-Fi de la universidad), usa `npx expo start --tunnel`. |
| `You need to be signed in to Expo Go and Expo CLI` | Ejecuta `npx expo login` e inicia sesión en Expo Go con la misma cuenta. |
| Puerto 8081 ocupado | Cierra el otro servidor de Expo, o responde que sí cuando la terminal pregunte si quieres usar otro puerto. |
| Errores raros después de un `git pull` | Ejecuta `npm install` de nuevo. Si persisten, limpia la caché con `npx expo start -c`. |
| Expo Go dice que la versión del SDK no es compatible | Actualiza Expo Go desde la tienda de tu celular. |
| Mensaje `Using src/app as the root directory for Expo Router` | Es solo informativo: ignóralo. Expo lo muestra porque existe la carpeta `src/app`, pero el proyecto no usa expo-router. |
| Windows: PowerShell no deja ejecutar `npx` o `npm` (scripts deshabilitados) | Usa la terminal **Símbolo del sistema (cmd)**, o ejecuta una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` en PowerShell. |

## 7. Estructura del proyecto

El punto de entrada es `index.js`, que carga `App.js`, y este renderiza `src/app/App.jsx`. El código del proyecto va dentro de `src/`:

```text
src/
├── app/                         # Componente raíz: providers y navegación (Core 1)
│   └── App.jsx
├── config/                      # Configuración compartida (Core 1)
│   ├── apiConfig.js             # URL base de la API central
│   └── theme.js                 # Colores, tipografía y espaciados
├── navigation/                  # Navegadores de la app (Core 1)
│   ├── AppNavigator.jsx         # Navegador principal
│   └── AuthNavigator.jsx        # Navegador de autenticación
├── shared/                      # Código común: los cambios se coordinan con Core 1 o Core 2
│   ├── components/              # Componentes UI reutilizables, como Button o Card
│   ├── features/
│   │   ├── glossary/            # Motor de glosario (Core 2)
│   │   ├── quiz/                # Motor de cuestionarios (Core 2)
│   │   └── teacher-dashboard/   # Panel docente (Core 1)
│   └── services/                # authService, cliente axios, etc. (Core 1)
└── modules/                     # Una carpeta por materia (cada equipo de materia)
    ├── README.md
    ├── biologia/                # Equipo de Biología
    ├── calculo/                 # Pendiente de asignación
    ├── fisica/                  # Equipo de Física
    ├── historia/                # Equipo de Historia
    ├── ingles/                  # Equipo de Inglés
    └── quimica/                 # Equipo de Química
```

Cada materia tiene la misma organización:

```text
src/modules/historia/
├── components/   # Componentes propios de la materia
├── screens/      # Pantallas de la materia
├── services/     # Llamadas a la API de la materia
└── index.js      # Lo que el módulo expone al resto de la app
```

### Cómo un módulo exporta su pantalla

El `index.js` de cada módulo exporta su pantalla principal por nombre. Hoy es una pantalla provisional que muestra el nombre de la materia:

| Módulo | Pantalla exportada |
|---|---|
| `src/modules/biologia` | `BiologiaHomeScreen` |
| `src/modules/calculo` | `CalculoHomeScreen` |
| `src/modules/fisica` | `FisicaHomeScreen` |
| `src/modules/historia` | `HistoriaHomeScreen` |
| `src/modules/ingles` | `InglesHomeScreen` |
| `src/modules/quimica` | `QuimicaHomeScreen` |

Para usarla, por ejemplo desde `src/navigation/`:

```js
import { HistoriaHomeScreen } from '../modules/historia';
```

> **Nota:** las pantallas de las materias todavía no están conectadas a la navegación. Por ahora, la app solo muestra la pantalla provisional de `AppNavigator.jsx`.

## 8. Reglas de trabajo entre equipos

- Cada equipo trabaja **solo** dentro de su carpeta `src/modules/<materia>/`.
- Los cambios en `src/shared`, `src/config` o `src/navigation` se coordinan con:
  - **Core 1:** estructura, login, roles, navegación y tema.
  - **Core 2:** cuestionarios y glosario.
- Usa siempre los colores y tamaños de `src/config/theme.js` y los componentes compartidos de `src/shared/components/`. No escribas colores a mano ni crees botones propios.
- La URL de la API se toma solo de `src/config/apiConfig.js`.
- Nombres:
  - Carpetas en minúscula y sin tildes (`biologia`, `calculo`).
  - Componentes en PascalCase con extensión `.jsx` (`QuizCard.jsx`).
  - Funciones y servicios en camelCase con extensión `.js` (`authService.js`).
  - Cada módulo mantiene su `index.js` como punto de entrada.

### Requisitos del ERS que todos deben cumplir

- Texto de cuerpo de al menos 16 sp.
- Contraste mínimo de 4.5:1.
- Pantallas desde 360 dp de ancho, sin scroll horizontal.
- Indicador de carga si algo tarda más de 1 segundo.
- Mensajes de error comprensibles.
- Funcionamiento en Android 12 o superior.

## 9. Flujo de trabajo con Git

### Ramas

| Rama | Para qué sirve |
|---|---|
| `main` | Versión estable, la que se presenta. |
| `develop` | Integración del trabajo de todos los equipos. |
| `feature/<equipo>-<código-de-tarjeta>` | Trabajo de una tarjeta, por ejemplo `feature/core1-C1-05` o `feature/ingles-IN-03`. |
| `fix/<equipo>-<descripcion-corta>` | Correcciones, por ejemplo `fix/quimica-tabla-periodica`. |

### Crear tu rama

Crea siempre tu rama desde `develop` actualizado:

```bash
git checkout develop
```

```bash
git pull
```

```bash
git checkout -b feature/core1-C1-05
```

### Mensajes de commit

Se usa Conventional Commits en español, con el código de la tarjeta de Trello entre paréntesis: `tipo(CÓDIGO): descripción`.

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `chore` | Configuración y mantenimiento |
| `docs` | Documentación |
| `style` | Formato, sin cambiar el comportamiento |
| `refactor` | Reorganización del código, sin cambiar el comportamiento |

Ejemplos:

```text
feat(C1-05): pantalla de login
fix(C2-08): corregir el cálculo del puntaje del cuestionario
chore(C1-01): inicializar proyecto Expo en JavaScript
docs(C1-03): agregar guía de instalación al README
refactor(IN-03): separar la lista de vocabulario en un componente
```

### Antes de subir tus cambios

Estos dos comandos deben terminar sin errores:

```bash
npm run format
```

```bash
npm run lint
```

Después, prueba la app en tu celular.

### Pull Requests

- Todo PR va **siempre hacia `develop`**. Nunca se sube código directo a `main` ni a `develop`.
- El título lleva el código de la tarjeta, por ejemplo `feat(C1-05): pantalla de login`.
- La descripción explica qué se hizo y cómo probarlo.
- Lo revisa y aprueba el lead del equipo.
- Si toca `src/shared`, también lo revisa Core 1 o Core 2, según el tema.

Plantilla de descripción:

```markdown
## Tarjeta
C1-05

## Qué se hizo
-

## Cómo probarlo
1.

## Checklist
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run format` aplicado
- [ ] Probado en el celular
- [ ] Si toca `src/shared`, avisé a Core 1 o Core 2
```

### Mantener tu rama actualizada

Trae los cambios de `develop` con frecuencia para evitar conflictos:

```bash
git pull origin develop
```

Si aparece un conflicto, **pide ayuda a tu lead y no borres código ajeno**.

### Fin de sprint

`develop` se pasa a `main` al final de cada sprint, para el Sprint Review.

## 10. Scripts disponibles

Se ejecutan con `npm run <script>`, por ejemplo `npm run lint`. `start` también funciona como `npm start`.

| Script | Comando | Para qué sirve |
|---|---|---|
| `start` | `expo start` | Inicia el servidor de desarrollo y muestra el código QR. |
| `android` | `expo start --android` | Inicia el servidor y abre la app en un emulador o dispositivo Android conectado a la computadora. Con Expo Go no lo necesitas. |
| `ios` | `expo start --ios` | Inicia el servidor y abre la app en el simulador de iOS (solo en Mac con Xcode). Con Expo Go no lo necesitas. |
| `web` | `expo start --web` | Abre la versión web. Virtu es una app móvil y este modo no está configurado; no lo uses salvo que tu lead lo pida. |
| `lint` | `eslint .` | Revisa el código y el formato, sin modificar archivos. |
| `format` | `prettier --write .` | Da formato al código. Modifica los archivos. Los `README.md` están excluidos. |

## 11. Organización Scrum

- **Sprints:** de 2 semanas.
- **Tableros:** cada equipo tiene su tablero de Trello, administrado por su lead.
- **Tarjetas:** cada una tiene título, código, tiempo estimado, asignación y criterios de aceptación en forma de checklist.
- **Columnas:** Por hacer, En progreso, En revisión y Terminado.
- **Avance:** se comparte en Discord.

### Definición de terminado

Una tarjeta está terminada cuando:

- Sus criterios de aceptación están cumplidos.
- Su PR está aprobado e integrado.
- La app sigue compilando.
- Los cambios que afectan a otros equipos se comunicaron en Discord.

## 12. Documentación del proyecto

Documentos de referencia:

- **ERS general:** los requisitos del sistema.
- **Borrador de planificación de Virtu:** la planificación del proyecto.

Si no los encuentras en las carpetas de abajo, pídelos a tu lead.

# Carpetas de documentos
Grupo 1 - https://drive.google.com/drive/folders/11BhtBG_chRkF-vgQXXLo13rZPbC5T-y3?usp=drive_link

Grupo 2 Biología https://drive.google.com/drive/folders/1_Qzt9yY5DoXqPd7MFWTdDZxMUE2KkiGW?usp=sharing 

Grupo 3 Calculo https://drive.google.com/drive/folders/1SCKvGheOEGFVTpuj5IVzfwjihB8squwd?usp=sharing 

Grupo 4 Historia https://drive.google.com/drive/folders/1Aq7YVYID2R4sCj8SixxIoWNLIBtdj9Gw?usp=sharing 

Grupo 5 Química https://drive.google.com/drive/folders/1Y7EFuFU1Q-CwwGqCJe86OcupDDj8VeTa?usp=sharing

Grupo 6 Física https://drive.google.com/drive/folders/1HDZTP-W8im9TS2LRsrX-qBFiI8a_oJE-?usp=sharing 

Grupo 7 Inglés https://drive.google.com/drive/folders/18uVg8856dVuTEpPCzpLrkRJEoTmU3wwe?usp=sharing

## 13. Contacto

- Dudas sobre la estructura, el login o el repositorio: Rubén (lead de Core 1).
- Dudas sobre cuestionarios y glosario: Matías (lead de Core 2).
- Dudas de cada módulo: el lead de su equipo.

## Core compartido en `core2`

Las herramientas reutilizables siguen el árbol de la magíster en `mobile/src/shared/features/`: cuestionarios en `quiz/` y glosario en `glossary/`. El alcance actual es Sprint 1 de las siete tarjetas propuestas para Matías y sus dependencias necesarias; no equivale a completar todos los equipos.

El tema global vive en `mobile/src/config/theme.js`, la navegación implementada en `mobile/src/navigation/AppNavigator.tsx` y los controles comunes en `mobile/src/shared/components/`. El controlador local pertenece a `QuizScreen.tsx`; el servicio de envío de notas/registro de intentos está pendiente de API, no se reemplaza por una máquina de estados. Los adaptadores del starter aún presentes no acreditan las piezas faltantes de Core 1, Backend ni materias.

Guía SDD: [spec](mobile/docs/specs/core/spec.md), [design](mobile/docs/specs/core/design.md), [tasks](mobile/docs/specs/core/tasks.md), [plan y evidencia](mobile/docs/specs/core/plan.md). [Contratos internos y ejemplo](mobile/docs/quiz-engine.md). Las secciones históricas registran una arquitectura anterior, no instrucciones vigentes.
