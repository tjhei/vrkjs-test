# vrkjs-test

Minimal [vtk.js](https://kitware.github.io/vtk-js/) example that loads a `.vtkjs` scene archive and slowly rotates the camera around the object.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## How it works

- `.vtkjs` files are zip archives. The loader fetches the archive, unpacks it in memory, and uses `vtkHttpSceneLoader` (same approach as vtk.js SceneExplorer).
- Five view buttons at the bottom switch between bundled sample models while auto-rotation continues.
- Drag with the mouse to orbit the model. Auto-rotation pauses during interaction and resumes 1 second after you release.
- A fullscreen toggle sits in the top-right corner.
- An FPS counter in the bottom-left tracks actual render rate.
- Scenes are **lazy-loaded on first click** and kept in memory for instant switching afterward.

## Loading strategy

**Load on first click, keep loaded** is the best fit here:

| Approach | Pros | Cons |
|----------|------|------|
| Load all at start | Instant switching from the first click | Slow startup, downloads ~1.5 MB up front, higher memory even if the user only views one model |
| **Load on first click, cache** | Fast startup, instant re-visits, only pays for what you open | First visit to each model has a short load; memory grows with unique models viewed |
| Reload every switch | Simple | Poor UX on every revisit |

The scene manager toggles actor visibility instead of re-parsing archives on repeat visits.

## Swap in your own scene

Place your `.vtkjs` file in `public/data/` and update `SCENE_URL` in `src/main.js`.

If your archive nests scene metadata below the root, the zip helper still picks the shortest `index.json` path automatically — you usually only need to pass `index.json`.
