export function captureCameraState(camera) {
  return {
    position: [...camera.getPosition()],
    focalPoint: [...camera.getFocalPoint()],
    viewUp: [...camera.getViewUp()],
    viewAngle: camera.getViewAngle(),
    parallelScale: camera.getParallelScale(),
    parallelProjection: camera.getParallelProjection(),
    clippingRange: [...camera.getClippingRange()],
  };
}

export function restoreCameraState(camera, state) {
  if (!state) {
    return false;
  }

  camera.setPosition(...state.position);
  camera.setFocalPoint(...state.focalPoint);
  camera.setViewUp(...state.viewUp);
  camera.setViewAngle(state.viewAngle);
  camera.setParallelScale(state.parallelScale);
  camera.setParallelProjection(state.parallelProjection);
  camera.setClippingRange(...state.clippingRange);
  return true;
}
