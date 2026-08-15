import { trapFocus } from './focus-trap';

export function toc() {
  const headings = document.querySelector('main h2, main h3');
  const wrapper = document.getElementById('toc-wrapper');

  if (!headings || !wrapper) {
    return;
  }

  tocbot.init({
    tocSelector: '#toc',
    contentSelector: '.content',
    ignoreSelector: '[data-toc-skip]',
    headingSelector: 'h2, h3, h4',
    orderedList: false,
    scrollSmooth: false,
    headingsOffset: 96,
    collapseDepth: 6
  });

  wrapper.classList.remove('d-none');

  const trigger = document.getElementById('toc-sheet-trigger');
  const closeBtn = document.getElementById('toc-sheet-close');

  if (trigger) {
    trigger.hidden = false;
    trigger.setAttribute('aria-controls', 'toc-wrapper');
    trigger.setAttribute('aria-expanded', 'false');
  }

  const isCompact = () => window.innerWidth < 1200;

  const setOpen = (open) => {
    if (open) {
      document.body.setAttribute('toc-sheet', '');
      closeBtn?.focus?.();
    } else {
      document.body.removeAttribute('toc-sheet');
      if (isCompact()) trigger?.focus?.();
    }
    trigger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const toggle = () => {
    setOpen(!document.body.hasAttribute('toc-sheet'));
  };

  trigger?.addEventListener('click', toggle);
  closeBtn?.addEventListener('click', () => setOpen(false));

  wrapper.addEventListener('click', (event) => {
    if (event.target.closest('a') && isCompact()) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!document.body.hasAttribute('toc-sheet')) return;

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (isCompact()) {
      trapFocus(wrapper, event);
    }
  });

  window.addEventListener('resize', () => {
    if (!isCompact()) {
      setOpen(false);
    }
  });
}
