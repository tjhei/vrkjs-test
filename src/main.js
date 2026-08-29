import '@kitware/vtk.js/Rendering/Profiles/All';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import { createFrameLoop } from './frameLoop.js';
import { loadVtkJsScene } from './loadVtkJsScene.js';

const SCENE_URL = '/data/earth-lowres.vtkjs';
const ROTATION_DEG_PER_SEC = 12;
const TARGET_FPS = 60;

const container = document.querySelector('#app');
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  rootContainer: container,
  background: [0.1, 0.1, 0.12],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const camera = renderer.getActiveCamera();

loadVtkJsScene(renderer, SCENE_URL)
  .then(() => {
    renderer.resetCamera();
    renderWindow.render();

    const frameLoop = createFrameLoop({
      targetFps: TARGET_FPS,
      onFrame(deltaSeconds) {
        camera.azimuth(ROTATION_DEG_PER_SEC * deltaSeconds);
        renderWindow.render();
      },
    });

    frameLoop.start();
  })
  .catch((error) => {
    console.error('Failed to load vtkjs scene:', error);
  });
