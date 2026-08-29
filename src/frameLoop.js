/**
 * Animation loop capped at a target frame rate, but allowed to run slower
 * when rendering cannot keep up.
 */
export function createFrameLoop({
  targetFps = 60,
  onFrame,
  maxDeltaSeconds = 0.1,
}) {
  const minFrameMs = 1000 / targetFps;
  let rafId = 0;
  let running = false;
  let lastFrameTime = 0;

  function tick(now) {
    if (!running) {
      return;
    }

    rafId = requestAnimationFrame(tick);

    if (!lastFrameTime) {
      lastFrameTime = now;
      return;
    }

    const elapsedMs = now - lastFrameTime;
    if (elapsedMs < minFrameMs) {
      return;
    }

    const deltaSeconds = Math.min(elapsedMs / 1000, maxDeltaSeconds);
    onFrame(deltaSeconds);
    lastFrameTime = performance.now();
  }

  return {
    start() {
      if (running) {
        return;
      }
      running = true;
      lastFrameTime = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
  };
}
