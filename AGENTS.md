# Repository guidance

- The only application/package is `mobile/`; there is no root npm workspace. Run all npm/Expo commands from `mobile/`.
- Read `mobile/AGENTS.md` before changing the app. It covers version-matched Expo docs, SDK-compatible dependency installation, and generated native projects.

## Commands and verification

From `mobile/`:

- Install locked dependencies: `npm ci` (`package-lock.json` is committed).
- Start: `npm start`; launch a target with `npm run android`, `npm run ios`, or `npm run web`. These scripts start Expo, not native compilation.
- Check: `npm run lint` and `npm run typecheck` (`tsc --noEmit`), as required by mobile instructions.
- Jest uses the Expo preset: `npm test -- --runInBand`; focus with `npm test -- --runInBand tests/quiz/quiz-state.test.ts` (add `-t "requires a lesson"` for validation). Tests/fixtures/demo belong in `mobile/tests/`; only the explicitly guarded development preview route may load the demo, never shared features or production channels.
- Run Jest separately from Metro/export jobs; concurrent export previously caused a UI test timeout. No services or environment variables are needed for Jest.
- Current contracts and verification limits live in `mobile/docs/quiz-engine.md` and `mobile/docs/specs/core/`. Historical sections describe superseded contracts; use the current sections at the top. An attempt snapshots questions on mount; change its `key` to start a new attempt.
- Add dependencies with `npx expo install <package>`, not bare `npm install <package>`.

## Wiring and pitfalls

- Follow the instructor's approved tree: quiz and glossary live in `mobile/src/shared/features/{quiz,glossary}/`; subject-owned code belongs in `src/modules/`. Do not restore `src/core/quiz/` or add unapproved types/hooks/barrel files. Shared features must not import routes or subject modules.
- Quiz entrypoint is `@/shared/features/quiz/screens/QuizScreen`; its TypeScript contracts are exported there. Require a lesson ID, exactly 5 questions and 4 options each; invalid input must not complete an attempt. Score is correct answers out of 5, with passing at 4/5, not a percentage.
- Local quiz state/validation/scoring belongs in `QuizScreen.tsx`, not in `quizService.js`: that filename is reserved by the approved tree for sending grades/registering attempts. Do not reintroduce a state-machine service or a fake API; implement that service only against the real Sprint 2 contract.
- Global colors/fonts/constants live in `@/config/theme` (`theme.js`); reusable Button/Card/Header/SearchBar in `@/shared/components/`. Keep generic controls ignorant of quiz/glossary rules.
- Sprint 1 uses caller-supplied local data. Do not invent API endpoints, persisted attempts or a timer duration; API integration and formal engine publication belong to Sprint 2. This scope does not implement the rest of the instructor's tree.
- `mobile/package.json` uses `expo-router/entry`; the root layout is `mobile/src/app/_layout.tsx`. The README's reference to an `app/` directory means `src/app/` here.
- `src/navigation/AppNavigator.tsx` owns the native/web tab implementations; `_layout.tsx` is the Expo Router bridge. Preserve platform-specific behavior and the `__DEV__` guard, not parallel `app-tabs` files. AuthNavigator remains pending until there is a real authentication flow.
- TypeScript aliases differ: `@/*` maps to `mobile/src/*`, but `@/assets/*` maps to `mobile/assets/*`.
- Do not run `npm run reset-project` as setup or cleanup. It moves **both `src/` and `scripts/` to `example/`**, or deletes them if prompted with `n`, then writes blank routes.
