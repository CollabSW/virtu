# Repository guidance

- The only application/package is `mobile/`; there is no root npm workspace. Run all npm/Expo commands from `mobile/`.
- Read `mobile/AGENTS.md` before changing the app; `mobile/CLAUDE.md` points to that same guidance. It covers version-matched Expo docs, SDK-compatible dependency installation, and generated native projects.

## Commands and verification

From `mobile/`:

- Install locked dependencies: `npm ci` (`package-lock.json` is committed).
- Start: `npm start`; launch a target with `npm run android`, `npm run ios`, or `npm run web`. These scripts start Expo, not native compilation.
- Check: `npm run lint` and `npx tsc --noEmit`, as required by the mobile instructions.
- Jest uses the Expo preset: `npm test -- --runInBand`; focus with `npm test -- --runInBand tests/quiz/quiz-state.test.ts` (add `-t "empty"` for one scenario). Tests/fixtures/demo belong in `mobile/tests/`; only the explicitly guarded development preview route may load the demo, never Core or production channels.
- QuizEngine contracts, SDD acceptance criteria, integration examples and verification limits are linked from `mobile/docs/quiz-engine.md`. An attempt snapshots its questions on mount; change its `key` to start a new attempt.
- Add dependencies with `npx expo install <package>`, not bare `npm install <package>`.

## Wiring and pitfalls

- `mobile/src/core/` owns tools shared by all subject channels; consume quiz through `@/core/quiz`. Core must not import routes or subject-specific modules. SDD lives in `docs/specs/core/{spec,design,tasks,plan}.md`.
- `mobile/package.json` uses `expo-router/entry`; the root layout is `mobile/src/app/_layout.tsx`. The README's reference to an `app/` directory means `src/app/` here.
- Tabs have separate implementations: `src/components/app-tabs.tsx` uses native tabs, while `app-tabs.web.tsx` uses `expo-router/ui`. Navigation changes may require both; animated splash components also have native/web variants.
- TypeScript aliases differ: `@/*` maps to `mobile/src/*`, but `@/assets/*` maps to `mobile/assets/*`.
- Do not run `npm run reset-project` as setup or cleanup. It moves **both `src/` and `scripts/` to `example/`**, or deletes them if prompted with `n`, then writes blank routes. The README's `app-example/` description is stale.
