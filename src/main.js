import '@kitware/vtk.js/Rendering/Profiles/All';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import './styles.css';
import { createTrackedRender, createFpsCounter } from './fpsCounter.js';
import { createFrameLoop } from './frameLoop.js';
import { createRotationController } from './rotationController.js';
import { createSceneManager } from './sceneManager.js';
import { createUi } from './ui.js';
import { VIEWS } from './views.js';

const ROTATION_DEG_PER_SEC = 12;
const TARGET_FPS = 60;
const INTERACTION_RESUME_DELAY_MS = 1000;
const CYCLE_INTERVAL_MS = 10_000;

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
const trackedRender = createTrackedRender(renderWindow, fpsCounter);

const sceneManager = createSceneManager(renderer, renderWindow);
const rotationController = createRotationController({
  interactor,
  resumeDelayMs: INTERACTION_RESUME_DELAY_MS,
});

const viewById = Object.fromEntries(VIEWS.map((view) => [view.id, view]));
let activeViewId = VIEWS[0].id;
let cycleEnabled = true;
let cycleTimerId = 0;
let cycleRemainingMs = CYCLE_INTERVAL_MS;
let cycleTimerStart = 0;
let cyclePausedByInteraction = false;

function getNextViewId(currentId) {
  const index = VIEWS.findIndex((view) => view.id === currentId);
  return VIEWS[(index + 1) % VIEWS.length].id;
}

function captureCycleRemaining() {
  if (cycleTimerId && cycleTimerStart) {
    cycleRemainingMs = Math.max(
      0,
      cycleRemainingMs - (performance.now() - cycleTimerStart),
    );
  }
}

function clearCycleTimer({ resetRemaining = false } = {}) {
  captureCycleRemaining();
  if (cycleTimerId) {
    clearTimeout(cycleTimerId);
    cycleTimerId = 0;
  }
  cycleTimerStart = 0;
  if (resetRemaining) {
    cycleRemainingMs = CYCLE_INTERVAL_MS;
  }
}

function scheduleNextCycle(delayMs = cycleRemainingMs) {
  clearCycleTimer();
  if (!cycleEnabled || cyclePausedByInteraction) {
    cycleRemainingMs = delayMs;
    return;
  }

  cycleRemainingMs = delayMs;
  cycleTimerStart = performance.now();
  cycleTimerId = window.setTimeout(async () => {
    cycleTimerId = 0;
    cycleTimerStart = 0;
    const nextId = getNextViewId(activeViewId);
    await switchView(nextId);
    cycleRemainingMs = CYCLE_INTERVAL_MS;
    scheduleNextCycle(CYCLE_INTERVAL_MS);
  }, delayMs);
}

rotationController.onPauseChange((paused) => {
  if (!cycleEnabled) {
    return;
  }

  if (paused && !cyclePausedByInteraction) {
    cyclePausedByInteraction = true;
    clearCycleTimer();
    return;
  }

  if (!paused && cyclePausedByInteraction) {
    cyclePausedByInteraction = false;
    scheduleNextCycle(cycleRemainingMs);
  }
});

const ui = createUi({
  onViewChange: (viewId) => {
    if (viewId === activeViewId) {
      return;
    }
    clearCycleTimer({ resetRemaining: true });
    switchView(viewId).then(() => scheduleNextCycle(CYCLE_INTERVAL_MS));
  },
  onResetView: () => {
    sceneManager.resetActiveCameraView();
  },
  onCycleChange: (enabled) => {
    cycleEnabled = enabled;
    if (enabled) {
      scheduleNextCycle(CYCLE_INTERVAL_MS);
    } else {
      clearCycleTimer({ resetRemaining: true });
    }
  },
});

ui.setActiveView(activeViewId);

const frameLoop = createFrameLoop({
  targetFps: TARGET_FPS,
  onFrame(deltaSeconds) {
    if (!rotationController.isRotationPaused()) {
      camera.azimuth(ROTATION_DEG_PER_SEC * deltaSeconds);
      trackedRender();
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
    scheduleNextCycle(CYCLE_INTERVAL_MS);
  })
  .catch((error) => {
    console.error('Failed to load initial scene:', error);
  });
