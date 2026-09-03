import { VIEWS } from './views.js';
import {
  APP_TITLE,
  INFO_PANEL_BODY_HTML,
  INFO_PANEL_HEADING,
} from './content.js';

export function createUi({ onViewChange, onResetView, onCycleChange }) {
  const root = document.createElement('div');
  root.className = 'ui-root';

  const header = document.createElement('header');
  header.className = 'app-header';

  const title = document.createElement('h1');
  title.className = 'app-title';
  title.textContent = APP_TITLE;
  header.appendChild(title);

  const actionBar = document.createElement('div');
  actionBar.className = 'action-bar';

  const infoToggle = document.createElement('button');
  infoToggle.type = 'button';
  infoToggle.className = 'icon-button';
  infoToggle.setAttribute('aria-label', 'Toggle information panel');
  infoToggle.setAttribute('aria-expanded', 'true');
  infoToggle.title = 'Toggle info panel';
  infoToggle.textContent = 'i';

  const resetViewButton = document.createElement('button');
  resetViewButton.type = 'button';
  resetViewButton.className = 'icon-button';
  resetViewButton.setAttribute('aria-label', 'Reset view');
  resetViewButton.title = 'Reset zoom and rotation';
  resetViewButton.textContent = '⟲';

  const fullscreenButton = document.createElement('button');
  fullscreenButton.type = 'button';
  fullscreenButton.className = 'icon-button';
  fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen');
  fullscreenButton.title = 'Toggle fullscreen';
  fullscreenButton.textContent = '⛶';

  actionBar.appendChild(infoToggle);
  actionBar.appendChild(resetViewButton);
  actionBar.appendChild(fullscreenButton);

  const infoPanel = document.createElement('aside');
  infoPanel.className = 'info-panel';
  infoPanel.setAttribute('aria-label', 'Scene information');

  const infoPanelHeading = document.createElement('h2');
  infoPanelHeading.className = 'info-panel__heading';
  infoPanelHeading.textContent = INFO_PANEL_HEADING;

  const infoPanelBody = document.createElement('div');
  infoPanelBody.className = 'info-panel__body';
  infoPanelBody.innerHTML = INFO_PANEL_BODY_HTML;

  const infoPanelHide = document.createElement('button');
  infoPanelHide.type = 'button';
  infoPanelHide.className = 'info-panel__hide';
  infoPanelHide.textContent = 'Hide';
  infoPanelHide.setAttribute('aria-label', 'Hide information panel');

  infoPanel.appendChild(infoPanelHeading);
  infoPanel.appendChild(infoPanelBody);
  infoPanel.appendChild(infoPanelHide);

  const viewBar = document.createElement('nav');
  viewBar.className = 'view-bar';
  viewBar.setAttribute('aria-label', 'Scene views');

  const cycleToggle = document.createElement('button');
  cycleToggle.type = 'button';
  cycleToggle.className = 'view-button cycle-toggle active';
  cycleToggle.setAttribute('aria-label', 'Cycle views');
  cycleToggle.setAttribute('aria-pressed', 'true');
  cycleToggle.title = 'Cycle views (10s each)';
  cycleToggle.textContent = '⟳';

  const viewDivider = document.createElement('span');
  viewDivider.className = 'view-bar__divider';
  viewDivider.setAttribute('aria-hidden', 'true');

  const buttons = VIEWS.map((view) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'view-button';
    button.dataset.viewId = view.id;
    button.textContent = view.label;
    button.addEventListener('click', () => {
      onViewChange(view.id);
    });
    viewBar.appendChild(button);
    return button;
  });

  viewBar.insertBefore(cycleToggle, viewBar.firstChild);
  viewBar.insertBefore(viewDivider, buttons[0] ?? null);

  let cycleEnabled = true;

  cycleToggle.addEventListener('click', () => {
    cycleEnabled = !cycleEnabled;
    cycleToggle.classList.toggle('active', cycleEnabled);
    cycleToggle.setAttribute('aria-pressed', String(cycleEnabled));
    cycleToggle.title = cycleEnabled ? 'Cycle views (10s each)' : 'Enable view cycling';
    cycleToggle.setAttribute(
      'aria-label',
      cycleEnabled ? 'Cycle views' : 'Enable view cycling',
    );
    onCycleChange(cycleEnabled);
  });

  const fpsCounter = document.createElement('div');
  fpsCounter.className = 'fps-counter';
  fpsCounter.textContent = 'FPS —';

  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.hidden = true;
  loadingOverlay.innerHTML = `
    <div class="loading-overlay__content">
      <div class="loading-spinner" aria-hidden="true"></div>
      <span class="loading-overlay__label">Loading scene…</span>
    </div>
  `;

  root.appendChild(header);
  root.appendChild(actionBar);
  root.appendChild(infoPanel);
  root.appendChild(viewBar);
  root.appendChild(fpsCounter);
  root.appendChild(loadingOverlay);
  document.body.appendChild(root);

  const viewBarObserver = new ResizeObserver(() => {
    root.style.setProperty('--view-bar-height', `${viewBar.offsetHeight}px`);
  });
  viewBarObserver.observe(viewBar);
  root.style.setProperty('--view-bar-height', `${viewBar.offsetHeight}px`);

  function setInfoPanelVisible(visible) {
    root.classList.toggle('info-panel-hidden', !visible);
    infoPanel.hidden = !visible;
    infoToggle.classList.toggle('active', visible);
    infoToggle.setAttribute('aria-expanded', String(visible));
    infoToggle.title = visible ? 'Hide info panel' : 'Show info panel';
  }

  infoToggle.addEventListener('click', () => {
    setInfoPanelVisible(infoPanel.hidden);
  });

  infoPanelHide.addEventListener('click', () => {
    setInfoPanelVisible(false);
  });

  function setActiveView(viewId) {
    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.viewId === viewId);
    });
  }

  function setLoading(loading) {
    loadingOverlay.hidden = !loading;
    buttons.forEach((button) => {
      button.disabled = loading;
    });
  }

  resetViewButton.addEventListener('click', () => {
    onResetView();
  });

  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenButton.textContent = isFullscreen ? '⤢' : '⛶';
    fullscreenButton.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreenButton.setAttribute(
      'aria-label',
      isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen',
    );
  });

  let fpsRafId = 0;

  function startFpsDisplay(getFps) {
    const update = () => {
      const fps = getFps();
      fpsCounter.textContent = fps > 0 ? `${Math.round(fps)} FPS` : 'FPS —';
      fpsRafId = requestAnimationFrame(update);
    };
    fpsRafId = requestAnimationFrame(update);
  }

  function stopFpsDisplay() {
    if (fpsRafId) {
      cancelAnimationFrame(fpsRafId);
      fpsRafId = 0;
    }
  }

  return {
    setActiveView,
    setLoading,
    startFpsDisplay,
    stopFpsDisplay,
  };
}
