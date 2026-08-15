/**
 * Lightweight focus trap for modal surfaces (drawer / search / sheet).
 */

function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

export function getFocusable(root) {
  if (!root) return [];
  return [
    ...root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ].filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      isVisible(el)
  );
}

export function trapFocus(root, event) {
  if (event.key !== 'Tab' || !root) return;

  const nodes = getFocusable(root);
  if (nodes.length === 0) {
    event.preventDefault();
    return;
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
