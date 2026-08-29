const FADE_MS = 140;

function captureBaseOpacity(actor) {
  return actor ? actor.getProperty().getOpacity() : 1;
}

function applyFadeFactor(entries, factor) {
  entries.forEach(({ actor, volume, baseOpacity }) => {
    if (actor) {
      const opacity = baseOpacity * factor;
      const visible = opacity > 0;
      actor.setVisibility(visible);
      actor.getProperty().setOpacity(opacity);
    }
    if (volume) {
      volume.setVisibility(factor > 0);
    }
  });
}

function hideEntries(entries) {
  entries.forEach(({ actor, volume, baseOpacity }) => {
    if (actor) {
      actor.setVisibility(false);
      actor.getProperty().setOpacity(baseOpacity);
    }
    if (volume) {
      volume.setVisibility(false);
    }
  });
}

function showEntries(entries) {
  entries.forEach(({ actor, volume, baseOpacity }) => {
    if (actor) {
      actor.setVisibility(true);
      actor.getProperty().setOpacity(baseOpacity);
    }
    if (volume) {
      volume.setVisibility(true);
    }
  });
}

export function animateFade({
  entries,
  from,
  to,
  durationMs = FADE_MS,
  onFrame,
}) {
  return new Promise((resolve) => {
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / durationMs, 1);
      const value = from + (to - from) * progress;
      applyFadeFactor(entries, value);
      onFrame();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

export { applyFadeFactor, hideEntries, showEntries, FADE_MS };
