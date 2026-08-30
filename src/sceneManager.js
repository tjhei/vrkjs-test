import { captureCameraState, restoreCameraState } from './cameraHome.js';
import { loadVtkJsScene } from './loadVtkJsScene.js';
import {
  animateFade,
  FADE_MS,
  hideEntries,
  showEntries,
} from './sceneFade.js';

function getSceneEntries(sceneLoader) {
  return sceneLoader.getScene().map((item) => ({
    actor: item.actor,
    volume: item.volume,
    baseOpacity: item.actor ? item.actor.getProperty().getOpacity() : 1,
  }));
}

function hideAllScenes(cache) {
  cache.forEach((cached) => {
    hideEntries(cached.entries);
  });
}

/**
 * Lazy-load scenes on first visit, keep them cached, and cross-fade transitions.
 */
export function createSceneManager(renderer, renderWindow) {
  const camera = renderer.getActiveCamera();
  const cache = new Map();
  const homeCameraByViewId = new Map();
  let activeViewId = null;
  let activeTransitionId = 0;

  async function ensureCached(viewId, url, transitionId) {
    if (cache.has(viewId)) {
      return cache.get(viewId);
    }

    const sceneLoader = await loadVtkJsScene(renderer, url);
    if (transitionId !== activeTransitionId) {
      return null;
    }

    const cached = {
      sceneLoader,
      entries: getSceneEntries(sceneLoader),
    };
    hideEntries(cached.entries);
    cache.set(viewId, cached);
    return cached;
  }

  async function loadScene(viewId, url) {
    const transitionId = ++activeTransitionId;
    hideAllScenes(cache);

    const outgoing =
      activeViewId && activeViewId !== viewId ? cache.get(activeViewId) : null;
    const loadPromise = ensureCached(viewId, url, transitionId);

    if (outgoing) {
      showEntries(outgoing.entries);
      await animateFade({
        entries: outgoing.entries,
        from: 1,
        to: 0,
        durationMs: FADE_MS,
        onFrame: () => renderWindow.render(),
      });
      if (transitionId !== activeTransitionId) {
        return null;
      }
      hideEntries(outgoing.entries);
    }

    const incoming = await loadPromise;
    if (!incoming || transitionId !== activeTransitionId) {
      if (incoming) {
        hideEntries(incoming.entries);
      }
      return null;
    }

    renderer.resetCamera();
    homeCameraByViewId.set(viewId, captureCameraState(camera));

    await animateFade({
      entries: incoming.entries,
      from: 0,
      to: 1,
      durationMs: FADE_MS,
      onFrame: () => renderWindow.render(),
    });

    if (transitionId !== activeTransitionId) {
      hideEntries(incoming.entries);
      return null;
    }

    activeViewId = viewId;
    showEntries(incoming.entries);
    renderWindow.render();
    return incoming.sceneLoader;
  }

  function resetActiveCameraView() {
    const homeCamera = activeViewId ? homeCameraByViewId.get(activeViewId) : null;
    if (!restoreCameraState(camera, homeCamera)) {
      return false;
    }

    renderWindow.render();
    return true;
  }

  return {
    loadScene,
    isCached: (viewId) => cache.has(viewId),
    getActiveViewId: () => activeViewId,
    resetActiveCameraView,
  };
}
