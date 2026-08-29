import { VIEWS } from './views.js';
import {
  APP_TITLE,
  INFO_PANEL_BODY_HTML,
  INFO_PANEL_HEADING,
} from './content.js';

export function createUi({ onViewChange }) {
  const root = document.createElement('div');
  root.className = 'ui-root';

  const header = document.createElement('header');
  header.className = 'app-header';

  const title = document.createElement('h1');
  title.className = 'app-title';
  title.textContent = APP_TITLE;
  header.appendChild(title);

  const fullscreenButton = document.createElement('button');
  fullscreenButton.type = 'button';
  fullscreenButton.className = 'icon-button fullscreen-button';
  fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen');
  fullscreenButton.title = 'Toggle fullscreen';
  fullscreenButton.textContent = '⛶';

  const infoPanel = document.createElement('aside');
  infoPanel.className = 'info-panel';
  infoPanel.setAttribute('aria-label', 'Scene information');

  const infoPanelHeader = document.createElement('div');
  infoPanelHeader.className = 'info-panel__header';

  const infoPanelHeading = document.createElement('h2');
  infoPanelHeading.className = 'info-panel__heading';
  infoPanelHeading.textContent = INFO_PANEL_HEADING;

  const infoPanelClose = document.createElement('button');
  infoPanelClose.type = 'button';
  infoPanelClose.className = 'icon-button info-panel__close';
  infoPanelClose.setAttribute('aria-label', 'Hide information panel');
  infoPanelClose.title = 'Hide panel';
  infoPanelClose.textContent = '×';

  const infoPanelBody = document.createElement('div');
  infoPanelBody.className = 'info-panel__body';
  infoPanelBody.innerHTML = INFO_PANEL_BODY_HTML;

  infoPanelHeader.appendChild(infoPanelHeading);
  infoPanelHeader.appendChild(infoPanelClose);
  infoPanel.appendChild(infoPanelHeader);
  infoPanel.appendChild(infoPanelBody);

  const infoPanelOpen = document.createElement('button');
  infoPanelOpen.type = 'button';
  infoPanelOpen.className = 'icon-button info-panel-open';
  infoPanelOpen.setAttribute('aria-label', 'Show information panel');
  infoPanelOpen.title = 'Show info';
  infoPanelOpen.textContent = 'ℹ';
  infoPanelOpen.hidden = true;

  const viewBar = document.createElement('nav');
  viewBar.className = 'view-bar';
  viewBar.setAttribute('aria-label', 'Scene views');

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

  const fpsCounter = document.createElement('div');
  fpsCounter.className = 'fps-counter';
  fpsCounter.textContent = 'FPS —';

  root.appendChild(header);
  root.appendChild(fullscreenButton);
  root.appendChild(infoPanelOpen);
  root.appendChild(infoPanel);
  root.appendChild(viewBar);
  root.appendChild(fpsCounter);
  document.body.appendChild(root);

  function setInfoPanelVisible(visible) {
    root.classList.toggle('info-panel-hidden', !visible);
    infoPanel.hidden = !visible;
    infoPanelOpen.hidden = visible;
    infoPanelClose.setAttribute('aria-label', visible ? 'Hide information panel' : 'Show information panel');
  }

  infoPanelClose.addEventListener('click', () => {
    setInfoPanelVisible(false);
  });

  infoPanelOpen.addEventListener('click', () => {
    setInfoPanelVisible(true);
  });

  function setActiveView(viewId) {
    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.viewId === viewId);
    });
  }

  function setLoading(loading) {
    buttons.forEach((button) => {
      button.disabled = loading;
    });
  }

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
