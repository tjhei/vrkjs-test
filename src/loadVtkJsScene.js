import DataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkHttpSceneLoader from '@kitware/vtk.js/IO/Core/HttpSceneLoader';

/**
 * Load a .vtkjs archive (zip) into a renderer.
 *
 * Most archives expose scene metadata at index.json. Some older exports nest
 * the scene one directory deep (for example earth.vtp/index.json).
 */
export async function loadVtkJsScene(renderer, vtkJsUrl, sceneIndexPath = 'index.json') {
  const zipContent = await HttpDataAccessHelper.fetchBinary(vtkJsUrl);

  return new Promise((resolve, reject) => {
    const dataAccessHelper = DataAccessHelper.get('zip', {
      zipContent,
      callback: () => {
        const sceneLoader = vtkHttpSceneLoader.newInstance({
          renderer,
          dataAccessHelper,
        });

        sceneLoader.setUrl(sceneIndexPath);
        sceneLoader.onReady(() => resolve(sceneLoader));
      },
    });

    if (!dataAccessHelper) {
      reject(new Error('Zip data access helper is unavailable.'));
    }
  });
}
