# Copilot / Agent Instructions for claudeGPU

This project is a small Next.js + Tailwind app that visualizes GPU supply-chains on a 3D globe.
These notes capture the essential structure, workflows, and code patterns an AI coding agent should know to be productive.

1. Architecture (big picture)
- Framework: Next.js (app router) — top-level pages live in `app/` (see `app/page.jsx`, `app/layout.js`).
- UI: React + Tailwind CSS; icons from `lucide-react`.
- Visualization: `three` is used directly in `components/SimpleGlobe.js` to render a WebGL globe and markers.
- Data model: `data/supplyChainData.js` contains level-keyed arrays (keys match `data/levelInfo.js`). The UI navigates levels using a `history` array in `app/page.jsx`.

2. Key files to reference
- `app/page.jsx` — main view, client component (`"use client"`), implements navigation/history pattern and item selection logic.
- `components/SimpleGlobe.js` — direct Three.js usage; exposes props: `locations`, `highlight`, `onLocationClick`. Important for 3D interaction and memory management.
- `components/*` — `FloatingItem`, `LevelHeader`, `Breadcrumb`, `SelectedItemCard` implement the app UI and follow Tailwind utility classes.
- `data/supplyChainData.js` and `data/levelInfo.js` — canonical data and level definitions; update these to add nodes/levels.
- `package.json` — scripts and dependencies (`npm run dev`, `next`, `three`, Tailwind in devDependencies).

3. Developer workflows (commands and tips)
- Run dev server: `npm install` then `npm run dev` (uses `next dev`).
- Build for production: `npm run build`; run server: `npm start`.
- When changing 3D code in `SimpleGlobe.js`, restart dev server if you change native modules; otherwise hot reload usually works.
- No test harness present — changes should be manually verified in the browser (inspect console for WebGL errors).

4. Project-specific conventions & patterns
- Client-first: The main page and visualization are client components — look for `"use client"` at the top of files (e.g., `app/page.jsx`).
- Data-driven levels: The UI derives the next level by using `levelInfo` entries' `key` fields to index `supplyChainData` (see `handleItemClick` in `app/page.jsx`). Keep those keys aligned when adding levels.
- History stack: `history` is an array of entries: `{ level, items, parent?, selectedItem? }`. When navigating forward, update the last entry's `selectedItem` and push a new entry for the next level.
- Three.js lifecycle: `components/SimpleGlobe.js` creates renderer/scene/camera and attaches `renderer.domElement` to `containerRef`. The component removes listeners, removes DOM children, and calls `renderer.dispose()` in the cleanup — follow this pattern to avoid leaks.
- Hover/interaction: SimpleGlobe uses raycasting for hover/click; `onLocationClick` is how selection flows back to the UI.

5. Integration points and dependencies
- `three` (3D) — main heavy dependency. `package.json` includes `three` and `next`.
- `tailwindcss`, `postcss`, `autoprefixer` for styling. Styles import occurs in `app/layout.js` (`import '../styles/index.css'`).
- `lucide-react` for icons.

6. Safe edit checklist for PRs
- If editing `SimpleGlobe.js`: ensure you remove event listeners and call `renderer.dispose()` in cleanup. Test for console warnings about WebGL contexts.
- If adding a new level key: update `data/levelInfo.js` and add corresponding array in `data/supplyChainData.js` using the same `key`.
- UI changes: prefer Tailwind utility classes and existing component patterns (`FloatingItem`, `SelectedItemCard`) to keep the look consistent.

7. Example quick tasks (prompts to use)
- "Add a new GPU model `x100` located at (lat,lng) and make it appear on the globe": modify `data/supplyChainData.js` under `gpus` and add locations.
- "Make globe markers larger on hover and change highlight color": edit `components/SimpleGlobe.js` — marker material color and scale adjustments are present near marker creation and hover handling.
- "Add keyboard accessibility to the breadcrumb navigation": update `components/Breadcrumb.js` and ensure interactive elements have proper `tabIndex` and ARIA labels.

8. Known gaps (what to ask the owner)
- No automated tests or CI configured — confirm desired testing approach before adding tests.
- Authentication or backend APIs are not present in this repo — confirm if data should remain static files or be pulled from a service.

If anything above is unclear or you'd like additional examples (e.g., a short PR with a sample data change or a `SimpleGlobe.js` refactor to a hook), tell me which area to expand and I'll update this file.
