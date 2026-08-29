import { loadVtkJsScene } from './loadVtkJsScene.js';

export function createSceneManager(renderer, renderWindow) {
  let activeLoadId = 0;
  let currentSceneLoader = null;

  function clearScene() {
    renderer.removeAllActors();
    renderer.removeAllVolumes();
    currentSceneLoader = null;
  }

  async function loadScene(url) {
    const loadId = ++activeLoadId;
    clearScene();

    const sceneLoader = await loadVtkJsScene(renderer, url);
    if (loadId !== activeLoadId) {
      return null;
    }

    currentSceneLoader = sceneLoader;
    renderer.resetCamera();
    renderWindow.render();
    return sceneLoader;
  }

  return {
    loadScene,
    clearScene,
    getCurrentSceneLoader: () => currentSceneLoader,
  };
}
