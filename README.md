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
- Camera rotation uses `camera.azimuth()` with delta-time so speed stays consistent even when the frame rate drops.
- The animation loop targets 60 FPS but will run slower automatically when rendering cannot keep up.

## Swap in your own scene

Place your `.vtkjs` file in `public/data/` and update `SCENE_URL` in `src/main.js`.

If your archive nests scene metadata below the root, the zip helper still picks the shortest `index.json` path automatically — you usually only need to pass `index.json`.
