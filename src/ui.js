import { VIEWS } from './views.js';

export function createUi({ onViewChange }) {
  const root = document.createElement('div');
  root.className = 'ui-root';

  const topBar = document.createElement('div');
  topBar.className = 'top-bar';

  const fullscreenButton = document.createElement('button');
  fullscreenButton.type = 'button';
  fullscreenButton.className = 'icon-button';
  fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen');
  fullscreenButton.title = 'Toggle fullscreen';
  fullscreenButton.textContent = '⛶';
  topBar.appendChild(fullscreenButton);

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

  root.appendChild(topBar);
  root.appendChild(viewBar);
  document.body.appendChild(root);

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

  return {
    setActiveView,
    setLoading,
  };
}
