export function createRotationController({
  interactor,
  resumeDelayMs = 1000,
}) {
  let rotationPausedUntil = 0;
  let interacting = false;
  const pauseListeners = new Set();
  const style = interactor.getInteractorStyle();

  function isRotationPaused() {
    return interacting || performance.now() < rotationPausedUntil;
  }

  function notifyPauseChange() {
    const paused = isRotationPaused();
    for (const listener of pauseListeners) {
      listener(paused);
    }
  }

  style.onStartInteractionEvent(() => {
    interacting = true;
    notifyPauseChange();
  });

  style.onEndInteractionEvent(() => {
    interacting = false;
    rotationPausedUntil = performance.now() + resumeDelayMs;
    notifyPauseChange();
    setTimeout(() => {
      notifyPauseChange();
    }, resumeDelayMs);
  });

  return {
    isRotationPaused,
    onPauseChange(listener) {
      pauseListeners.add(listener);
      return () => pauseListeners.delete(listener);
    },
  };
}
