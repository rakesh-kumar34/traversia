# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Traversia — an animated, quiz-driven algorithm learning game (React 19 + TypeScript + Vite, no backend).

## Commands

- `npm run dev` — dev server on :5173
- `npm run build` — type-check (`tsc -b`) + production build; run this to verify changes
- `npm run lint` — oxlint

## Architecture

The core abstraction is in `src/types.ts`: an `AlgoModule` bundles metadata (name, category, pseudocode, complexity, interview tips) with a `generateSteps()` function that runs the algorithm once and returns `Step[]` — immutable state snapshots. Each `Step` has a `description`, an optional `codeLine` (0-based index into the module's pseudocode array, highlighted in the side panel), and an optional `quiz` that gates playback.

Three state shapes cover all visualizations, rendered by the matching component in `src/components/viz/`:

- `ArrayState` → `ArrayViz`: bar chart with labeled pointers, index highlights (`HighlightRole`), an optional `window` range, and an optional `aux` row (e.g. merge output, dp values)
- `GraphState` → `GraphViz`: SVG; node coordinates are 0–100 layout units, nodes have a `status` (unvisited/frontier/current/visited) and optional `sub` label (distances, in-degrees), edges have a `status` (idle/active/included/rejected)
- `TableState` → `TableViz`: DP grids with row/col labels and per-cell roles

`Player.tsx` is the generic playback engine: play/pause/step/speed, progress, scoring (+10 per correct quiz, +5 × streak bonus), and quiz gating — advancing into a step that carries an unanswered quiz pauses and shows `QuizOverlay` before the step is applied. Results persist via `src/progress.ts` (localStorage key `traversia-progress`).

## Adding an algorithm

1. Write an `AlgoModule` in the right category file under `src/algorithms/` (arrays / sorting / graphs / dp). Simulate the algorithm imperatively, pushing a `Step` per meaningful event; snapshot state (spread arrays/objects) — steps must not share mutable state.
2. Embed 2–3 quizzes at decision points (first occurrence of the key insight, not every iteration); use a `quizzed` flag to avoid repeats.
3. Add it to the exported array at the bottom of the file; it flows through `src/algorithms/index.ts` into the home grid automatically.

Keep runs small (arrays ≤ 10 elements, graphs ≤ 8 nodes) so total steps stay roughly under 60.

## Conventions

- Inputs are deterministic (hardcoded), so quiz text can reference concrete values.
- Descriptions teach: state what happened AND why it's the interview-relevant insight.
- Styling is a single hand-rolled stylesheet (`src/App.css`) driven by CSS variables (`--c-*`); highlight colors map from `HighlightRole` names. No UI libraries.
- `docs/` holds README screenshots (captured at 2× via puppeteer), not source.
