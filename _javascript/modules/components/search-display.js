/**
 * Search dialog with recent history and focus trap.
 * Keeps #search-input / #search-results for Simple-Jekyll-Search.
 */

import { trapFocus } from './focus-trap';

const dialog = document.getElementById('search-dialog');
const surface = dialog?.querySelector('.md-search-surface');
const btnSearchTrigger = document.getElementById('search-trigger');
const btnCancel = document.getElementById('search-cancel');
const input = document.getElementById('search-input');
const results = document.getElementById('search-results');
const hints = document.getElementById('search-hints');
const chipKbd = document.querySelector('.md-search-kbd');

const UNLOADED = 'd-none';
const RECENT_KEY = 'md-search-recent';
const RECENT_MAX = 6;

let isOpen = false;
let lastFocus = null;

function isMac() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

function syncShortcutHint() {
  if (!chipKbd) return;
  chipKbd.textContent = isMac() ? '⌘K' : 'Ctrl K';
}

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function writeRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch (e) {
    /* ignore quota */
  }
}

function rememberResult(title, url) {
  if (!title || !url) return;
  const next = readRecent().filter((item) => item.url !== url);
  next.unshift({ title, url });
  writeRecent(next);
}

function ensureRecentBlock() {
  if (!hints) return null;
  let block = document.getElementById('search-recent');
  if (block) return block;

  block = document.createElement('div');
  block.id = 'search-recent';
  block.className = 'md-search-recent';
  hints.prepend(block);
  return block;
}

function renderRecent() {
  const block = ensureRecentBlock();
  if (!block) return;

  const items = readRecent();
  if (items.length === 0) {
    block.innerHTML = '';
    block.hidden = true;
    return;
  }

  block.hidden = false;
  block.innerHTML = `
    <h4 class="md-search-recent-title">Recent</h4>
    <ul class="md-search-recent-list">
      ${items
        .map(
          (item) => `
        <li>
          <a href="${item.url}">${item.title}</a>
        </li>`
        )
        .join('')}
    </ul>
  `;
}

function onResultsClick(event) {
  const link = event.target.closest('a[href]');
  if (!link || !results?.contains(link)) return;
  const title = link.textContent?.trim();
  rememberResult(title, link.getAttribute('href'));
}

function openDialog() {
  if (!dialog || isOpen) {
    input?.focus();
    return;
  }

  lastFocus = document.activeElement;
  isOpen = true;
  dialog.hidden = false;
  dialog.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  renderRecent();
  input?.focus();
}

function closeDialog() {
  if (!dialog || !isOpen) return;

  isOpen = false;
  dialog.classList.remove('is-open');
  dialog.hidden = true;
  document.body.style.overflow = '';

  if (input) input.value = '';
  if (results) results.innerHTML = '';
  hints?.classList.remove(UNLOADED);

  lastFocus?.focus?.();
}

export function displaySearch() {
  syncShortcutHint();
  renderRecent();

  btnSearchTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    openDialog();
  });

  btnCancel?.addEventListener('click', () => closeDialog());

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  results?.addEventListener('click', onResultsClick);

  input?.addEventListener('input', () => {
    if (!input.value) {
      hints?.classList.remove(UNLOADED);
      renderRecent();
    } else {
      hints?.classList.add(UNLOADED);
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key?.toLowerCase();
    const meta = event.metaKey || event.ctrlKey;

    if (meta && key === 'k') {
      event.preventDefault();
      if (isOpen) {
        closeDialog();
      } else {
        openDialog();
      }
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }

    trapFocus(surface || dialog, event);
  });
}
