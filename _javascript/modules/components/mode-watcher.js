/**
 * Theme mode toggle with Material icon state.
 */
const toggle = document.getElementById('mode-toggle');

function currentMode() {
  const attr = document.documentElement.getAttribute('data-mode');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function syncToggleIcon() {
  if (!toggle) return;
  const icon = toggle.querySelector('i');
  if (!icon) return;

  const dark = currentMode() === 'dark';
  icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
  toggle.setAttribute(
    'aria-label',
    dark ? 'Switch to light theme' : 'Switch to dark theme'
  );
  toggle.setAttribute('title', dark ? 'Light theme' : 'Dark theme');
}

export function modeWatcher() {
  if (!toggle) {
    return;
  }

  syncToggleIcon();

  toggle.addEventListener('click', () => {
    modeToggle.flipMode();
    // Wait a tick so data-mode / system path settles.
    requestAnimationFrame(syncToggleIcon);
  });

  window.addEventListener('message', (event) => {
    if (event.data?.direction === 'mode-toggle') {
      syncToggleIcon();
    }
  });

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', syncToggleIcon);
}
