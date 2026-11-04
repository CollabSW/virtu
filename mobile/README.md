# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Virtu Core — herramientas para todas las materias

Las herramientas compartidas siguen el árbol de la magíster en `src/shared/features/quiz/` y `src/shared/features/glossary/`. Entrada de cuestionario: `@/shared/features/quiz/screens/QuizScreen`, con lección y exactamente cinco preguntas de cuatro opciones. Resultado sobre cinco, aprobado desde 4/5. El glosario recibe datos heterogéneos del consumidor, sin Backend en Sprint 1.

Ubicación y responsabilidad del código implementado: tema en `src/config/theme.js`; navegación en `src/navigation/AppNavigator.tsx` (puente Expo Router en `src/app/_layout.tsx`); controles generales en `src/shared/components/`; controlador local del cuestionario en `QuizScreen.tsx`. `quizService.js` queda pendiente del contrato real de envío de notas/registro de intentos de Sprint 2, no se usa como máquina de estados ni se deja un servicio ficticio. No hay carpeta de implementación `src/core/`.

SDD: [spec](docs/specs/core/spec.md), [design](docs/specs/core/design.md), [tasks](docs/specs/core/tasks.md), [plan](docs/specs/core/plan.md). Contratos internos y ejemplo: [docs/quiz-engine.md](docs/quiz-engine.md). Publicación definitiva para las seis materias y API pendientes de Sprint 2. Las secciones históricas del SDD no son instrucciones vigentes.

## Get started

1. Install dependencies

   ```bash
    npm ci
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Routes live in **src/app/**. This project uses [file-based routing](https://docs.expo.dev/router/introduction); shared feature screens are not routes. Run `npm run lint`, `npm run typecheck` and `npm test -- --runInBand` from this directory. The development-only `/pruebas` preview loads isolated mock data; release redirects without loading the demo.

## Destructive starter command

Do not use `npm run reset-project` for setup or cleanup: it moves both `src/` and `scripts/` to `example/` (or deletes them if answered `n`) and writes blank routes.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
