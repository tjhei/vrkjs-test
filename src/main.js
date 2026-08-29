import '@kitware/vtk.js/Rendering/Profiles/All';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import './styles.css';
import { attachFpsCounter, createFpsCounter } from './fpsCounter.js';
import { createFrameLoop } from './frameLoop.js';
import { createRotationController } from './rotationController.js';
import { createSceneManager } from './sceneManager.js';
import { createUi } from './ui.js';
import { VIEWS } from './views.js';

const ROTATION_DEG_PER_SEC = 12;
const TARGET_FPS = 60;
const INTERACTION_RESUME_DELAY_MS = 1000;

const container = document.querySelector('#app');
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  rootContainer: container,
  background: [0.1, 0.1, 0.12],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const interactor = fullScreenRenderer.getInteractor();
const camera = renderer.getActiveCamera();

const fpsCounter = createFpsCounter();
attachFpsCounter(renderWindow, fpsCounter);

const sceneManager = createSceneManager(renderer, renderWindow);
const rotationController = createRotationController({
  interactor,
  resumeDelayMs: INTERACTION_RESUME_DELAY_MS,
});

const viewById = Object.fromEntries(VIEWS.map((view) => [view.id, view]));
let activeViewId = VIEWS[0].id;

const ui = createUi({
  onViewChange: (viewId) => {
    if (viewId === activeViewId) {
      return;
    }
    switchView(viewId);
  },
});

ui.setActiveView(activeViewId);

const frameLoop = createFrameLoop({
  targetFps: TARGET_FPS,
  onFrame(deltaSeconds) {
    if (!rotationController.isRotationPaused()) {
      camera.azimuth(ROTATION_DEG_PER_SEC * deltaSeconds);
      renderWindow.render();
    }
  },
});

async function switchView(viewId) {
  const view = viewById[viewId];
  if (!view) {
    return;
  }

  const needsLoad = !sceneManager.isCached(viewId);
  if (needsLoad) {
    ui.setLoading(true);
  }

  try {
    await sceneManager.loadScene(viewId, view.url);
    activeViewId = viewId;
    ui.setActiveView(viewId);
  } catch (error) {
    console.error(`Failed to load view "${viewId}":`, error);
  } finally {
    if (needsLoad) {
      ui.setLoading(false);
    }
  }
}

switchView(activeViewId)
  .then(() => {
    frameLoop.start();
    ui.startFpsDisplay(() => fpsCounter.getFps());
  })
  .catch((error) => {
    console.error('Failed to load initial scene:', error);
  });
