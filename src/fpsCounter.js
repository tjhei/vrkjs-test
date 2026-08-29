/**
 * Tracks smoothed render FPS based on actual render() calls.
 */
export function createFpsCounter({ smoothing = 0.92 } = {}) {
  let fps = 0;
  let lastFrameTime = 0;

  return {
    recordFrame(now = performance.now()) {
      if (lastFrameTime) {
        const instantFps = 1000 / (now - lastFrameTime);
        fps = fps === 0 ? instantFps : fps * smoothing + instantFps * (1 - smoothing);
      }
      lastFrameTime = now;
    },
    getFps() {
      return fps;
    },
  };
}

export function attachFpsCounter(renderWindow, fpsCounter) {
  const render = renderWindow.render.bind(renderWindow);
  renderWindow.render = () => {
    fpsCounter.recordFrame();
    render();
  };
}
