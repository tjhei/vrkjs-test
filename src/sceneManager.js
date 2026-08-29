import { loadVtkJsScene } from './loadVtkJsScene.js';

function getSceneEntries(sceneLoader) {
  return sceneLoader.getScene().map((item) => ({
    actor: item.actor,
    volume: item.volume,
  }));
}

function setSceneVisibility(entries, visible) {
  entries.forEach(({ actor, volume }) => {
    if (actor) {
      actor.setVisibility(visible);
    }
    if (volume) {
      volume.setVisibility(visible);
    }
  });
}

/**
 * Lazy-load scenes on first visit and keep them in memory for instant switching.
 */
export function createSceneManager(renderer, renderWindow) {
  const cache = new Map();
  let activeViewId = null;
  let activeLoadId = 0;

  async function loadScene(viewId, url) {
    const loadId = ++activeLoadId;

    if (activeViewId && cache.has(activeViewId)) {
      setSceneVisibility(cache.get(activeViewId).entries, false);
    }

    let cached = cache.get(viewId);
    if (!cached) {
      const sceneLoader = await loadVtkJsScene(renderer, url);
      if (loadId !== activeLoadId) {
        return null;
      }

      cached = {
        sceneLoader,
        entries: getSceneEntries(sceneLoader),
      };
      cache.set(viewId, cached);
    } else if (loadId !== activeLoadId) {
      return null;
    }

    setSceneVisibility(cached.entries, true);
    activeViewId = viewId;
    renderer.resetCamera();
    renderWindow.render();
    return cached.sceneLoader;
  }

  return {
    loadScene,
    isCached: (viewId) => cache.has(viewId),
    getActiveViewId: () => activeViewId,
  };
}
