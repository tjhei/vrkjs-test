export function createRotationController({
  interactor,
  resumeDelayMs = 1000,
}) {
  let rotationPausedUntil = 0;
  let interacting = false;
  const style = interactor.getInteractorStyle();

  style.onStartInteractionEvent(() => {
    interacting = true;
  });

  style.onEndInteractionEvent(() => {
    interacting = false;
    rotationPausedUntil = performance.now() + resumeDelayMs;
  });

  return {
    isRotationPaused() {
      return interacting || performance.now() < rotationPausedUntil;
    },
  };
}
