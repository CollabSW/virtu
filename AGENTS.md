# Repository Guidelines

## Project Structure & Module Organization
Virtu is an educational React Native/Expo app. Run application commands from `mobile/`.
- `mobile/src/app/`: Expo Router routes and layouts.
- `mobile/src/modules/<materia>/`: subject modules, each with `components/`, `screens/`, `services/`, and an `index.js` entry point.
- `mobile/src/shared/`: reusable controls, authentication, HTTP services, quiz, and glossary features.
- `mobile/src/config/` and `mobile/src/navigation/`: shared configuration, theme, and navigation.
- `mobile/tests/`: tests and fixtures; `mobile/assets/`: images and fonts; `mobile/docs/`: specifications and delivery notes.

Read `mobile/AGENTS.md` before editing the application. Coordinate shared-code changes with Core 1 (authentication, navigation, theme) or Core 2 (quiz, glossary).

## Build, Test, and Development Commands
From `mobile/`:
- `npm ci`: install locked dependencies.
- `npm start`: start the Expo development server.
- `npm run web`: launch the web preview.
- `npm run android` / `npm run ios`: build and run the native app locally.
- `npm run lint`: run Expo ESLint checks.
- `npm run typecheck`: check TypeScript without emitting files.
- `npm test -- --runInBand`: run Jest serially.

Use npm consistently. Obtain lead approval for new dependencies and install them with `npx expo install <package>`. Avoid `npm run reset-project`: it moves or deletes application source.

## Coding Style & Naming Conventions
Use two-space indentation and follow surrounding JavaScript/TypeScript conventions. Prettier specifies single quotes, trailing commas, and a 100-character print width; ESLint uses Expo's flat configuration. TypeScript strict mode is enabled.

Use PascalCase component names, camelCase functions/services, and lowercase subject folders without accents. Reuse shared controls and theme values. Keep API configuration in `mobile/src/config/apiConfig.js`.

## Testing Guidelines
Tests use Jest with `jest-expo` and React Native Testing Library. Name files `*.test.ts`, `*.test.tsx`, or their JavaScript equivalents under `mobile/tests/`. Keep fictional data in test fixtures. No coverage threshold is configured. Add regression coverage for changed behavior; run relevant tests, lint, and typecheck before submitting. Test UI changes on a phone.

## Commit & Pull Request Guidelines
History includes scoped Conventional Commits in Spanish, such as `feat(calculo): integrar sesión, progreso e historial de Virtu`. Follow the README's ticket convention for new work: `feat(C1-05): pantalla de login`.

Branch from updated `develop`; target PRs to `develop`. Include the Trello card code, changes, and testing steps. Obtain team-lead approval and Core review when shared code changes.
